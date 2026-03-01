import { useState, useEffect, useCallback, useRef } from 'react';
import { TimerMode, PlayerInventory, HeldItem, ItemType, SteveState, GhostBlock, DroppedItem, MiningState } from './types';
import { createTestInventory, EMPTY_SLOT, INVENTORY_STORAGE_KEY, getMaxStack } from './constants';
import { GRID, percentToGrid, isCellEmpty, hasSupport, isValidPlacement } from './constants/grid';
import { useToast, useLocalStorage } from './hooks';
import {
  Timer,
  WorldView,
  ToastContainer,
  InventoryModal,
  HeldItemCursor,
  Hotbar,
  CraftingModal,
} from './components';

// Steve 물리 상수
const STEVE_SPEED = 0.8;        // 기본 이동 속도 (%/frame)
const STEVE_RUN_SPEED = 1.6;   // 달리기 속도
const STEVE_CROUCH_SPEED = 0.3; // 웅크리기 속도
const JUMP_VELOCITY = 1.2;     // 점프 초기 속도 (%/frame) - 약 9% 높이 점프 (1블록 = 6%)
const GRAVITY = 0.08;          // 중력 (%/frame²)
const GROUND_Y = 0;            // 기본 땅 높이 (%)

// 충돌 상수 (Grid 기반)
const STEP_UP_HEIGHT = 6.5;  // 한 칸 높이(6.25%)까지 자동 오르기 (여유분 포함)

// 자원 채집 상수
const BLOCK_MOVE_INTERVAL = 12000;      // 블록 위치 변경 간격 (ms) - 12초
const TIME_BASED_GATHER_INTERVAL = 20000; // 시간 기반 아이템 획득 간격 (ms) - 20초
const MAX_RESOURCES_ON_SCREEN = 2;      // 화면에 최대 자원 블록 수

// 채굴 상수
const MINING_TIME = 1500;               // 채굴 시간 (ms) - 1.5초
const PICKUP_DISTANCE = 8;              // 아이템 수집 거리 (%)

// 자원 타입 및 확률 (집중 시간에 따라 변경됨)
interface ResourceConfig {
  type: ItemType;
  weight: number;  // 스폰 가중치
  minMinutes: number; // 최소 집중 시간 (분)
}

const getResourcePool = (elapsedMinutes: number): ResourceConfig[] => {
  const pool: ResourceConfig[] = [
    // 기본 자원 (항상)
    { type: 'oak_log', weight: 30, minMinutes: 0 },
    { type: 'dirt', weight: 25, minMinutes: 0 },
    // 중간 세션 (5분+)
    { type: 'cobblestone', weight: 20, minMinutes: 5 },
    { type: 'coal', weight: 15, minMinutes: 5 },
    // 긴 세션 (15분+)
    { type: 'iron_ore', weight: 10, minMinutes: 15 },
    { type: 'gold_ore', weight: 5, minMinutes: 20 },
    // 아주 긴 세션 (25분+, 희귀)
    { type: 'diamond', weight: 2, minMinutes: 25 },
    { type: 'emerald', weight: 1, minMinutes: 30 },
  ];

  return pool.filter(r => elapsedMinutes >= r.minMinutes);
};

// 가중치 기반 랜덤 선택
const selectRandomResource = (pool: ResourceConfig[]): ItemType => {
  const totalWeight = pool.reduce((sum, r) => sum + r.weight, 0);
  let random = Math.random() * totalWeight;

  for (const resource of pool) {
    random -= resource.weight;
    if (random <= 0) return resource.type;
  }

  return pool[0].type;
};

function App() {
  const [initialTime, setInitialTime] = useState(25 * 60);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [mode, setMode] = useState<TimerMode>('idle');

  // Steve 상태
  const [steveState, setSteveState] = useState<SteveState>({
    x: 45,
    y: GROUND_Y,
    velocityY: 0,
    facingRight: true,
    isWalking: false,
    isRunning: false,
    isJumping: false,
    isCrouching: false,
    walkFrame: 0,
  });

  // 키 입력 상태
  const keysPressed = useRef<Set<string>>(new Set());
  const lastWPress = useRef<number>(0);

  // 인벤토리 시스템
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [playerInventory, setPlayerInventory] = useState<PlayerInventory>(() => {
    const saved = localStorage.getItem(INVENTORY_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return createTestInventory();
      }
    }
    return createTestInventory();
  });
  const [heldItem, setHeldItem] = useState<HeldItem | null>(null);
  const [isCraftingTableOpen, setIsCraftingTableOpen] = useState(false);
  const [ghostBlock, setGhostBlock] = useState<GhostBlock | null>(null);

  // 채굴 시스템
  const [miningState, setMiningState] = useState<MiningState | null>(null);
  const [droppedItems, setDroppedItems] = useState<DroppedItem[]>([]);
  const droppedItemIdRef = useRef(0);
  const miningIntervalRef = useRef<number | null>(null);

  // 땅 블록 상태 (4줄 x 21열, row 0=잔디, row 1-3=흙)
  const [groundBlocks, setGroundBlocks] = useState<(string | null)[][]>(() => {
    const blocks: (string | null)[][] = [];
    for (let row = 0; row < 4; row++) {
      blocks.push(Array(21).fill(row === 0 ? 'grass_side' : 'dirt'));
    }
    return blocks;
  });

  // Ref로 최신 상태 추적 (useCallback 클로저 문제 해결)
  const heldItemRef = useRef<HeldItem | null>(null);
  const inventoryRef = useRef<PlayerInventory>(playerInventory);
  heldItemRef.current = heldItem;
  inventoryRef.current = playerInventory;


  const { toasts, addToast } = useToast();
  const {
    worldGrid,
    setWorldGrid,
    updateCell,
  } = useLocalStorage();

  // Steve의 현재 Grid 좌표 계산
  const getSteveGridPos = useCallback(() => {
    // Steve 베이스 위치: bottom 25% + y%
    // y는 ground=0으로부터의 높이 (%)
    const steveBottomPercent = 25 + steveState.y;
    return percentToGrid(steveState.x, steveBottomPercent);
  }, [steveState.x, steveState.y]);

  // 지면 높이 계산 함수 (Grid 기반 + 땅 블록 체크)
  const getGroundHeightAt = useCallback((xPos: number): number => {
    const col = Math.floor(xPos / GRID.TILE_W);
    if (col < 0 || col >= GRID.COLS) return GROUND_Y;

    // 해당 열에서 가장 위에 있는 블록 찾기 (위에서 아래로)
    for (let row = 0; row < GRID.ROWS; row++) {
      if (worldGrid[row]?.[col] !== null) {
        // 블록 위 표면 높이 반환
        return (GRID.ROWS - row) * GRID.TILE_H;
      }
    }

    // 땅 블록 체크 (채굴된 경우 음수 높이 반환)
    const groundCol = Math.floor(xPos / 5); // 땅 블록은 5% 간격
    if (groundCol >= 0 && groundCol < 21) {
      for (let row = 0; row < 4; row++) {
        if (groundBlocks[row]?.[groundCol] !== null) {
          return -row * 6.25;
        }
      }
    }

    return GROUND_Y;
  }, [worldGrid, groundBlocks]);

  // 플레이어 인벤토리 저장
  useEffect(() => {
    localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(playerInventory));
  }, [playerInventory]);

  // 아이템 버리기 함수 (Grid에 배치)
  const dropItem = useCallback((dropAll: boolean) => {
    const currentSlot = playerInventory.slots[playerInventory.hotbar];
    if (!currentSlot.type || currentSlot.count <= 0) return;

    const dropCount = dropAll ? currentSlot.count : 1;

    // Steve 앞쪽 Grid 칸에 배치
    const stevePos = getSteveGridPos();
    const dropCol = steveState.facingRight
      ? Math.min(GRID.COLS - 1, stevePos.col + 1)
      : Math.max(0, stevePos.col - 1);

    // 빈 칸 찾기 (아래에서부터)
    let dropRow = GRID.ROWS - 1;
    for (let row = GRID.ROWS - 1; row >= 0; row--) {
      if (isCellEmpty(worldGrid, dropCol, row) && hasSupport(worldGrid, dropCol, row)) {
        dropRow = row;
        break;
      }
    }

    // Grid에 배치
    if (isCellEmpty(worldGrid, dropCol, dropRow)) {
      updateCell(dropCol, dropRow, { type: currentSlot.type });

      // 인벤토리에서 제거
      setPlayerInventory(prev => {
        const newSlots = [...prev.slots];
        if (dropAll || currentSlot.count <= 1) {
          newSlots[prev.hotbar] = { ...EMPTY_SLOT };
        } else {
          newSlots[prev.hotbar] = { ...currentSlot, count: currentSlot.count - 1 };
        }
        return { ...prev, slots: newSlots };
      });

      addToast('아이템 버림', `${currentSlot.type} x${dropCount}`, currentSlot.type, '#AAAAAA');
    }
  }, [playerInventory, steveState, worldGrid, getSteveGridPos, updateCell, addToast]);

  // 들고 있는 아이템을 인벤토리로 돌려놓기
  const returnHeldItemToInventory = useCallback(() => {
    const currentHeld = heldItemRef.current;
    if (!currentHeld) return;

    setPlayerInventory(prev => {
      const newSlots = [...prev.slots];
      let remaining = currentHeld.count;

      // 1. 원래 슬롯이 비어있으면 거기에 넣기
      if (currentHeld.sourceSlot !== undefined && !newSlots[currentHeld.sourceSlot].type) {
        newSlots[currentHeld.sourceSlot] = { type: currentHeld.type, count: currentHeld.count };
        remaining = 0;
      } else {
        // 2. 같은 아이템이 있는 슬롯에 합치기
        for (let i = 0; i < newSlots.length && remaining > 0; i++) {
          if (newSlots[i].type === currentHeld.type) {
            const maxStack = getMaxStack(currentHeld.type);
            const canAdd = Math.min(remaining, maxStack - newSlots[i].count);
            if (canAdd > 0) {
              newSlots[i] = { ...newSlots[i], count: newSlots[i].count + canAdd };
              remaining -= canAdd;
            }
          }
        }

        // 3. 빈 슬롯에 넣기
        for (let i = 0; i < newSlots.length && remaining > 0; i++) {
          if (!newSlots[i].type) {
            const maxStack = getMaxStack(currentHeld.type);
            const toAdd = Math.min(remaining, maxStack);
            newSlots[i] = { type: currentHeld.type, count: toAdd };
            remaining -= toAdd;
          }
        }
      }

      return { ...prev, slots: newSlots };
    });

    setHeldItem(null);
  }, []);

  // E키, ESC키, 숫자키, Q키, F키 처리
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // E키: 인벤토리 토글
      if (e.key === 'e' || e.key === 'E' || e.key === 'ㄷ') {
        e.preventDefault();
        if (isInventoryOpen && heldItem) {
          returnHeldItemToInventory(); // 들고 있는 아이템 돌려놓기
        }
        setIsInventoryOpen(prev => !prev);
      }

      // ESC키: 인벤토리/제작대 닫기
      if (e.key === 'Escape') {
        if (isCraftingTableOpen) {
          if (heldItem) returnHeldItemToInventory();
          setIsCraftingTableOpen(false);
        } else if (isInventoryOpen) {
          if (heldItem) returnHeldItemToInventory();
          setIsInventoryOpen(false);
        }
      }

      // 숫자키 1-9: 핫바 슬롯 선택
      if (!isInventoryOpen && !isCraftingTableOpen && e.key >= '1' && e.key <= '9') {
        const slotIndex = parseInt(e.key) - 1;
        setPlayerInventory(prev => ({ ...prev, hotbar: slotIndex }));
      }

      // Q키: 아이템 버리기
      if ((e.key === 'q' || e.key === 'Q' || e.key === 'ㅂ') && !isInventoryOpen && !isCraftingTableOpen) {
        e.preventDefault();
        dropItem(e.ctrlKey); // Ctrl+Q면 전부 버리기
      }

      // F키: 양손 교체 (현재는 핫바 첫번째 슬롯과 현재 슬롯 교체로 구현)
      if ((e.key === 'f' || e.key === 'F' || e.key === 'ㄹ') && !isInventoryOpen && !isCraftingTableOpen) {
        e.preventDefault();
        setPlayerInventory(prev => {
          if (prev.hotbar === 0) return prev; // 이미 첫번째 슬롯이면 무시
          const newSlots = [...prev.slots];
          const temp = newSlots[0];
          newSlots[0] = newSlots[prev.hotbar];
          newSlots[prev.hotbar] = temp;
          return { ...prev, slots: newSlots };
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isInventoryOpen, isCraftingTableOpen, heldItem, dropItem, returnHeldItemToInventory]);

  // 마우스 휠로 핫바 슬롯 변경
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isInventoryOpen || isCraftingTableOpen) return;

      e.preventDefault();
      setPlayerInventory(prev => {
        let newHotbar = prev.hotbar;
        if (e.deltaY > 0) {
          // 아래로 스크롤 → 다음 슬롯
          newHotbar = (prev.hotbar + 1) % 9;
        } else if (e.deltaY < 0) {
          // 위로 스크롤 → 이전 슬롯
          newHotbar = (prev.hotbar - 1 + 9) % 9;
        }
        return { ...prev, hotbar: newHotbar };
      });
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [isInventoryOpen, isCraftingTableOpen]);

  // WASD 이동 + 점프 + Ctrl(달리기) + Shift(웅크리기) 키 핸들러
  useEffect(() => {
    if (isInventoryOpen || isCraftingTableOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      // W 더블탭 감지 (달리기)
      if (key === 'w' || key === 'ㅈ') {
        const now = Date.now();
        if (now - lastWPress.current < 300) {
          // 더블탭! 달리기 모드
          setSteveState(prev => ({ ...prev, isRunning: true }));
        }
        lastWPress.current = now;
      }

      // Ctrl: 달리기 유지
      if (key === 'control') {
        setSteveState(prev => ({ ...prev, isRunning: true }));
      }

      // Shift: 웅크리기
      if (key === 'shift') {
        setSteveState(prev => ({ ...prev, isCrouching: true, isRunning: false }));
      }

      // 스페이스바: 점프
      if (key === ' ' && !keysPressed.current.has(' ')) {
        setSteveState(prev => {
          const groundHeight = getGroundHeightAt(prev.x);
          const isOnGround = prev.y <= groundHeight + 0.1;
          if (!prev.isJumping && isOnGround) {
            return { ...prev, velocityY: JUMP_VELOCITY, isJumping: true };
          }
          return prev;
        });
      }

      keysPressed.current.add(key);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysPressed.current.delete(key);

      // W 떼면 달리기 중지 (Ctrl 안 누르고 있으면)
      if ((key === 'w' || key === 'ㅈ') && !keysPressed.current.has('control')) {
        setSteveState(prev => ({ ...prev, isRunning: false }));
      }

      // Ctrl 떼면 달리기 중지
      if (key === 'control') {
        setSteveState(prev => ({ ...prev, isRunning: false }));
      }

      // Shift 떼면 웅크리기 해제
      if (key === 'shift') {
        setSteveState(prev => ({ ...prev, isCrouching: false }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isInventoryOpen, isCraftingTableOpen, getGroundHeightAt]);

  // Steve 게임 루프 (물리 + 애니메이션)
  useEffect(() => {
    if (isInventoryOpen || isCraftingTableOpen) return;

    const gameLoop = setInterval(() => {
      setSteveState(prev => {
        let { x, y, velocityY, facingRight, isWalking, isRunning, isJumping, isCrouching, walkFrame } = prev;

        // 현재 위치의 지면 높이
        const currentGroundHeight = getGroundHeightAt(x);
        const isOnGround = y <= currentGroundHeight + 0.1;

        // 이동 입력 처리
        const moveLeft = keysPressed.current.has('a') || keysPressed.current.has('ㅁ');
        const moveRight = keysPressed.current.has('d') || keysPressed.current.has('ㅇ');
        const moveForward = keysPressed.current.has('w') || keysPressed.current.has('ㅈ');
        const moveBackward = keysPressed.current.has('s') || keysPressed.current.has('ㄴ');

        // 현재 이동 속도 계산 (웅크리기 > 달리기 > 기본)
        let speed = STEVE_SPEED;
        if (isCrouching) {
          speed = STEVE_CROUCH_SPEED;
        } else if (isRunning) {
          speed = STEVE_RUN_SPEED;
        }

        // 이동 처리 (블록 충돌 체크 포함)
        let newX = x;
        isWalking = false;

        if (moveLeft) {
          newX = Math.max(2, x - speed);
          facingRight = false;
          isWalking = true;
        } else if (moveRight) {
          newX = Math.min(95, x + speed);
          facingRight = true;
          isWalking = true;
        } else if (moveForward) {
          // W키: 바라보는 방향으로 이동
          if (facingRight) {
            newX = Math.min(95, x + speed);
          } else {
            newX = Math.max(2, x - speed);
          }
          isWalking = true;
        } else if (moveBackward) {
          // S키: 뒤로 이동
          if (facingRight) {
            newX = Math.max(2, x - speed * 0.7);
          } else {
            newX = Math.min(95, x + speed * 0.7);
          }
          isWalking = true;
        }

        // 이동 후 지면 높이 확인
        if (isWalking) {
          const newGroundHeight = getGroundHeightAt(newX);
          const heightDiff = newGroundHeight - y;

          // 점프 중이거나 공중에 있으면 수평 이동만 허용 (step-up 비활성화)
          if (isJumping || !isOnGround) {
            // 공중에서는 블록 옆면 충돌 체크
            // Steve가 블록보다 낮으면 막힘 (블록 옆면에 부딪힘)
            if (newGroundHeight > y) {
              // 블록 옆면에 막힘 - 이동 불가
              isWalking = false;
            } else {
              // 블록 위 또는 빈 공간 - 이동 가능
              x = newX;
            }
          } else {
            // 땅에 있을 때 자동 계단 오르기/내려가기
            if (heightDiff > 0 && heightDiff <= STEP_UP_HEIGHT) {
              // 1칸 높이까지 자동 올라가기
              x = newX;
              y = newGroundHeight;
            } else if (heightDiff > STEP_UP_HEIGHT) {
              // 너무 높은 블록: 막힘 (이동 불가)
              isWalking = false;
            } else {
              // 평지 또는 내려가기 - y도 즉시 업데이트
              x = newX;
              y = newGroundHeight;
            }
          }
        }

        // 중력 적용
        const groundHeight = getGroundHeightAt(x);

        if (y > groundHeight || velocityY !== 0) {
          // 공중에 있거나 점프 중
          velocityY -= GRAVITY;
          const newY = y + velocityY;

          // 지면 충돌 체크
          if (newY <= groundHeight) {
            if (y >= groundHeight) {
              // 위에서 떨어지는 경우 - 정상 착지
              y = groundHeight;
              velocityY = 0;
              isJumping = false;
            } else {
              // 블록보다 낮은 위치에서 충돌
              y = newY;
            }
          } else {
            y = newY;
          }
        } else if (y < groundHeight) {
          // 지면 위로 스냅 (걸어서 블록 위에 올라섰을 때만)
          if (groundHeight - y <= STEP_UP_HEIGHT) {
            y = groundHeight;
          }
        }

        // 걷기 애니메이션 프레임
        if (isWalking && isOnGround) {
          const animSpeed = isCrouching ? 6 : 4;
          walkFrame = (walkFrame + 1) % (3 * animSpeed);
        } else {
          walkFrame = 0;
        }

        return { x, y, velocityY, facingRight, isWalking, isRunning, isJumping, isCrouching, walkFrame };
      });
    }, 1000 / 60); // 60 FPS

    return () => clearInterval(gameLoop);
  }, [isInventoryOpen, isCraftingTableOpen, getGroundHeightAt]);

  // 슬롯 클릭 (아이템 들기/놓기)
  const handleSlotClick = useCallback((slotIndex: number) => {
    const currentHeld = heldItemRef.current;
    const clickedSlot = inventoryRef.current.slots[slotIndex];

    if (currentHeld === null) {
      // 아무것도 안 들고 있을 때: 슬롯에서 아이템 집기
      if (clickedSlot.type) {
        setHeldItem({
          type: clickedSlot.type,
          count: clickedSlot.count,
          sourceSlot: slotIndex
        });
        setPlayerInventory(prev => {
          const newSlots = [...prev.slots];
          newSlots[slotIndex] = { ...EMPTY_SLOT };
          return { ...prev, slots: newSlots };
        });
      }
    } else {
      // 아이템 들고 있을 때
      if (!clickedSlot.type) {
        // 빈 슬롯에 놓기
        setPlayerInventory(prev => {
          const newSlots = [...prev.slots];
          newSlots[slotIndex] = { type: currentHeld.type, count: currentHeld.count };
          return { ...prev, slots: newSlots };
        });
        setHeldItem(null);
      } else if (clickedSlot.type === currentHeld.type) {
        // 같은 아이템이면 합치기
        const maxStack = getMaxStack(currentHeld.type);
        const totalCount = clickedSlot.count + currentHeld.count;
        if (totalCount <= maxStack) {
          setPlayerInventory(prev => {
            const newSlots = [...prev.slots];
            newSlots[slotIndex] = { type: clickedSlot.type, count: totalCount };
            return { ...prev, slots: newSlots };
          });
          setHeldItem(null);
        } else {
          setPlayerInventory(prev => {
            const newSlots = [...prev.slots];
            newSlots[slotIndex] = { type: clickedSlot.type, count: maxStack };
            return { ...prev, slots: newSlots };
          });
          setHeldItem({ ...currentHeld, count: totalCount - maxStack });
        }
      } else {
        // 다른 아이템이면 교환
        const temp = { ...clickedSlot };
        setPlayerInventory(prev => {
          const newSlots = [...prev.slots];
          newSlots[slotIndex] = { type: currentHeld.type, count: currentHeld.count };
          return { ...prev, slots: newSlots };
        });
        setHeldItem({ type: temp.type!, count: temp.count, sourceSlot: slotIndex });
      }
    }
  }, []);

  // 우클릭 (절반만 놓기)
  const handleSlotRightClick = useCallback((slotIndex: number) => {
    const currentHeld = heldItemRef.current;
    const clickedSlot = inventoryRef.current.slots[slotIndex];

    if (currentHeld === null) {
      // 아무것도 안 들고 있을 때: 절반만 집기
      if (clickedSlot.type && clickedSlot.count > 1) {
        const halfCount = Math.floor(clickedSlot.count / 2);
        const remainCount = clickedSlot.count - halfCount;
        setHeldItem({
          type: clickedSlot.type,
          count: halfCount,
          sourceSlot: slotIndex
        });
        setPlayerInventory(prev => {
          const newSlots = [...prev.slots];
          newSlots[slotIndex] = { type: clickedSlot.type, count: remainCount };
          return { ...prev, slots: newSlots };
        });
      } else if (clickedSlot.type) {
        // 1개면 전부 집기
        setHeldItem({
          type: clickedSlot.type,
          count: clickedSlot.count,
          sourceSlot: slotIndex
        });
        setPlayerInventory(prev => {
          const newSlots = [...prev.slots];
          newSlots[slotIndex] = { ...EMPTY_SLOT };
          return { ...prev, slots: newSlots };
        });
      }
    } else {
      // 아이템 들고 있을 때: 1개만 놓기
      if (!clickedSlot.type) {
        setPlayerInventory(prev => {
          const newSlots = [...prev.slots];
          newSlots[slotIndex] = { type: currentHeld.type, count: 1 };
          return { ...prev, slots: newSlots };
        });
        if (currentHeld.count > 1) {
          setHeldItem({ ...currentHeld, count: currentHeld.count - 1 });
        } else {
          setHeldItem(null);
        }
      } else if (clickedSlot.type === currentHeld.type) {
        const maxStack = getMaxStack(currentHeld.type);
        if (clickedSlot.count < maxStack) {
          setPlayerInventory(prev => {
            const newSlots = [...prev.slots];
            newSlots[slotIndex] = { type: clickedSlot.type, count: clickedSlot.count + 1 };
            return { ...prev, slots: newSlots };
          });
          if (currentHeld.count > 1) {
            setHeldItem({ ...currentHeld, count: currentHeld.count - 1 });
          } else {
            setHeldItem(null);
          }
        }
      }
    }
  }, []);

  // 더블클릭: 같은 아이템 모두 모으기
  const handleSlotDoubleClick = useCallback((slotIndex: number) => {
    const clickedSlot = playerInventory.slots[slotIndex];
    if (!clickedSlot.type) return;

    const itemType = clickedSlot.type;
    const maxStack = getMaxStack(itemType);
    let totalCount = clickedSlot.count;

    setPlayerInventory(prev => {
      const newSlots = [...prev.slots];

      // 다른 슬롯에서 같은 아이템 모으기
      for (let i = 0; i < newSlots.length && totalCount < maxStack; i++) {
        if (i !== slotIndex && newSlots[i].type === itemType) {
          const canTake = Math.min(newSlots[i].count, maxStack - totalCount);
          totalCount += canTake;
          if (canTake >= newSlots[i].count) {
            newSlots[i] = { ...EMPTY_SLOT };
          } else {
            newSlots[i] = { ...newSlots[i], count: newSlots[i].count - canTake };
          }
        }
      }

      newSlots[slotIndex] = { type: itemType, count: totalCount };
      return { ...prev, slots: newSlots };
    });
  }, [playerInventory]);

  // 드래그 배치: 왼쪽 드래그 = 균등 배치, 오른쪽 드래그 = 1개씩 배치
  const handleDragDistribute = useCallback((slotIndices: number[], isRightDrag: boolean) => {
    if (!heldItem || slotIndices.length === 0) return;

    setPlayerInventory(prev => {
      const newSlots = [...prev.slots];
      let remainingCount = heldItem.count;

      if (isRightDrag) {
        // 오른쪽 드래그: 각 슬롯에 1개씩
        for (const idx of slotIndices) {
          if (remainingCount <= 0) break;
          const slot = newSlots[idx];
          const maxStack = getMaxStack(heldItem.type);

          if (!slot.type) {
            newSlots[idx] = { type: heldItem.type, count: 1 };
            remainingCount--;
          } else if (slot.type === heldItem.type && slot.count < maxStack) {
            newSlots[idx] = { ...slot, count: slot.count + 1 };
            remainingCount--;
          }
        }
      } else {
        // 왼쪽 드래그: 균등 배치
        const validSlots = slotIndices.filter(idx => {
          const slot = newSlots[idx];
          return !slot.type || slot.type === heldItem.type;
        });

        if (validSlots.length > 0) {
          const perSlot = Math.floor(heldItem.count / validSlots.length);
          let extra = heldItem.count % validSlots.length;

          for (const idx of validSlots) {
            const slot = newSlots[idx];
            const maxStack = getMaxStack(heldItem.type);
            let toAdd = perSlot + (extra > 0 ? 1 : 0);
            if (extra > 0) extra--;

            if (!slot.type) {
              const actual = Math.min(toAdd, maxStack);
              newSlots[idx] = { type: heldItem.type, count: actual };
              remainingCount -= actual;
            } else if (slot.type === heldItem.type) {
              const canAdd = Math.min(toAdd, maxStack - slot.count);
              newSlots[idx] = { ...slot, count: slot.count + canAdd };
              remainingCount -= canAdd;
            }
          }
        }
      }

      // 남은 아이템 처리
      if (remainingCount > 0) {
        setHeldItem({ ...heldItem, count: remainingCount });
      } else {
        setHeldItem(null);
      }

      return { ...prev, slots: newSlots };
    });
  }, [heldItem]);

  // 핫바 슬롯 선택
  const handleHotbarSelect = useCallback((index: number) => {
    setPlayerInventory(prev => ({ ...prev, hotbar: index }));
  }, []);

  // 월드 클릭으로 아이템 배치 (Grid 스냅)
  const handleWorldClick = useCallback((xPercent: number, bottomPercent: number) => {
    const selectedSlot = playerInventory.slots[playerInventory.hotbar];
    if (!selectedSlot.type || selectedSlot.count <= 0) return;

    // 클릭 위치를 Grid 좌표로 변환
    const { col, row } = percentToGrid(xPercent, bottomPercent);
    const stevePos = getSteveGridPos();

    // 배치 유효성 검사
    if (!isValidPlacement(worldGrid, col, row, stevePos.col, stevePos.row)) {
      return; // 배치 불가
    }

    // Grid에 블록 배치
    updateCell(col, row, { type: selectedSlot.type });

    // 인벤토리에서 아이템 감소
    setPlayerInventory(prev => {
      const newSlots = [...prev.slots];
      const slot = newSlots[prev.hotbar];
      if (slot.count > 1) {
        newSlots[prev.hotbar] = { ...slot, count: slot.count - 1 };
      } else {
        newSlots[prev.hotbar] = { type: null, count: 0 };
      }
      return { ...prev, slots: newSlots };
    });
  }, [playerInventory, worldGrid, getSteveGridPos, updateCell]);

  // 땅 블록 배치 (파인 구멍에 블록 채우기)
  const handleGroundBlockPlace = useCallback((col: number, row: number) => {
    const selectedSlot = playerInventory.slots[playerInventory.hotbar];
    if (!selectedSlot.type || selectedSlot.count <= 0) return;

    // 해당 위치에 이미 블록이 있으면 무시
    if (groundBlocks[row]?.[col] !== null) return;

    // 블록 배치
    setGroundBlocks(prev => {
      const newBlocks = prev.map(r => [...r]);
      newBlocks[row][col] = selectedSlot.type;
      return newBlocks;
    });

    // 인벤토리에서 아이템 감소
    setPlayerInventory(prev => {
      const newSlots = [...prev.slots];
      const slot = newSlots[prev.hotbar];
      if (slot.count > 1) {
        newSlots[prev.hotbar] = { ...slot, count: slot.count - 1 };
      } else {
        newSlots[prev.hotbar] = { type: null, count: 0 };
      }
      return { ...prev, slots: newSlots };
    });
  }, [playerInventory, groundBlocks]);

  // Grid 셀 우클릭 (상호작용)
  const handleCellRightClick = useCallback((col: number, row: number) => {
    const cell = worldGrid[row]?.[col];
    if (!cell) return;

    // 제작대 우클릭 시 3x3 제작 UI 열기
    if (cell.type === 'crafting_table') {
      setIsCraftingTableOpen(true);
    }
  }, [worldGrid]);

  // 제작 결과를 인벤토리에 추가
  const handleCraftResult = useCallback((item: { type: ItemType; count: number }) => {
    setPlayerInventory(prev => {
      const newSlots = [...prev.slots];
      let remaining = item.count;

      // 기존 슬롯에 같은 아이템 있으면 합치기
      for (let i = 0; i < newSlots.length && remaining > 0; i++) {
        if (newSlots[i].type === item.type) {
          const maxStack = getMaxStack(item.type);
          const canAdd = Math.min(remaining, maxStack - newSlots[i].count);
          if (canAdd > 0) {
            newSlots[i] = { ...newSlots[i], count: newSlots[i].count + canAdd };
            remaining -= canAdd;
          }
        }
      }

      // 빈 슬롯에 추가
      for (let i = 0; i < newSlots.length && remaining > 0; i++) {
        if (!newSlots[i].type) {
          const maxStack = getMaxStack(item.type);
          const toAdd = Math.min(remaining, maxStack);
          newSlots[i] = { type: item.type, count: toAdd };
          remaining -= toAdd;
        }
      }

      return { ...prev, slots: newSlots };
    });
  }, []);

  // 인벤토리에 아이템 추가 헬퍼 함수
  const addItemToInventory = useCallback((itemType: ItemType, count: number = 1) => {
    setPlayerInventory(prev => {
      const newSlots = [...prev.slots];
      let remaining = count;

      // 기존 슬롯에 같은 아이템 있으면 합치기
      for (let i = 0; i < newSlots.length && remaining > 0; i++) {
        if (newSlots[i].type === itemType) {
          const maxStack = getMaxStack(itemType);
          const canAdd = Math.min(remaining, maxStack - newSlots[i].count);
          if (canAdd > 0) {
            newSlots[i] = { ...newSlots[i], count: newSlots[i].count + canAdd };
            remaining -= canAdd;
          }
        }
      }

      // 빈 슬롯에 추가
      for (let i = 0; i < newSlots.length && remaining > 0; i++) {
        if (!newSlots[i].type) {
          const maxStack = getMaxStack(itemType);
          const toAdd = Math.min(remaining, maxStack);
          newSlots[i] = { type: itemType, count: toAdd };
          remaining -= toAdd;
        }
      }

      return { ...prev, slots: newSlots };
    });

    return true;
  }, []);

  // ========== 자원 채집 시스템 ==========
  // 블록은 시각적 효과, 아이템 획득은 시간 기반

  // ref로 추적 (의존성 루프 방지)
  const worldGridRef = useRef(worldGrid);
  const timeLeftRef = useRef(timeLeft);
  worldGridRef.current = worldGrid;
  timeLeftRef.current = timeLeft;

  // 자원 블록 스폰 및 위치 변경 (running 모드에서만)
  useEffect(() => {
    if (mode !== 'running') return;

    const spawnOrMoveBlock = () => {
      const elapsedMinutes = Math.floor((initialTime - timeLeftRef.current) / 60);
      const pool = getResourcePool(elapsedMinutes);
      const resourceType = selectRandomResource(pool);

      setWorldGrid(prev => {
        // 현재 자원 블록 수 확인
        let resourceCount = 0;
        const existingBlocks: { row: number; col: number }[] = [];
        for (let r = 0; r < GRID.ROWS; r++) {
          for (let c = 0; c < GRID.COLS; c++) {
            if (prev[r]?.[c]?.isResource) {
              resourceCount++;
              existingBlocks.push({ row: r, col: c });
            }
          }
        }

        // 빈 칸 찾기 (맨 아래 줄에서)
        const bottomRow = GRID.ROWS - 1;
        const emptyCols: number[] = [];
        for (let c = 0; c < GRID.COLS; c++) {
          if (!prev[bottomRow]?.[c]) {
            emptyCols.push(c);
          }
        }

        if (emptyCols.length === 0) return prev;

        const newGrid = prev.map(row => [...row]);

        // 최대 개수 미만이면 새 블록 추가
        if (resourceCount < MAX_RESOURCES_ON_SCREEN) {
          const randomCol = emptyCols[Math.floor(Math.random() * emptyCols.length)];
          newGrid[bottomRow][randomCol] = {
            type: resourceType,
            placedAt: Date.now(),
            isResource: true,
          };
        } else if (existingBlocks.length > 0) {
          // 기존 블록 하나를 새 위치로 이동
          const blockToMove = existingBlocks[Math.floor(Math.random() * existingBlocks.length)];
          const newCol = emptyCols[Math.floor(Math.random() * emptyCols.length)];

          // 기존 위치 제거
          newGrid[blockToMove.row][blockToMove.col] = null;
          // 새 위치에 블록 생성
          newGrid[bottomRow][newCol] = {
            type: resourceType,
            placedAt: Date.now(),
            isResource: true,
          };
        }

        return newGrid;
      });
    };

    // 초기 스폰
    spawnOrMoveBlock();

    // 주기적 위치 변경
    const moveInterval = setInterval(spawnOrMoveBlock, BLOCK_MOVE_INTERVAL);

    return () => clearInterval(moveInterval);
  }, [mode, initialTime, setWorldGrid]);

  // 시간 기반 아이템 획득 (running 모드에서만 - 클릭 여부와 무관)
  useEffect(() => {
    if (mode !== 'running') return;

    const gatherItem = () => {
      const elapsedMinutes = Math.floor((initialTime - timeLeftRef.current) / 60);
      const pool = getResourcePool(elapsedMinutes);
      const resourceType = selectRandomResource(pool);

      addItemToInventory(resourceType, 1);
      addToast('자원 획득', `${resourceType} +1`, resourceType, '#55FF55');
    };

    const gatherInterval = setInterval(gatherItem, TIME_BASED_GATHER_INTERVAL);

    return () => clearInterval(gatherInterval);
  }, [mode, initialTime, addItemToInventory, addToast]);

  // 채굴 취소 함수
  const cancelMining = useCallback(() => {
    if (miningIntervalRef.current) {
      clearInterval(miningIntervalRef.current);
      miningIntervalRef.current = null;
    }
    setMiningState(null);
  }, []);

  // 채굴 시작 (마우스 다운)
  const handleMiningStart = useCallback((col: number, row: number) => {
    const cell = worldGrid[row]?.[col];
    if (!cell) return;

    // 이미 채굴 중이면 무시
    if (miningIntervalRef.current) {
      return;
    }
    const startTime = Date.now();
    setMiningState({ col, row, progress: 0, startTime });

    // 채굴 진행 인터벌 시작
    miningIntervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / MINING_TIME) * 100, 100);

      if (progress >= 100) {
        // 채굴 완료
        const currentCell = worldGridRef.current[row]?.[col];
        if (currentCell) {
          // 블록 제거
          updateCell(col, row, null);

          // 드롭 아이템 생성
          const dropX = col * GRID.TILE_W + GRID.TILE_W / 2;
          const newDroppedItem: DroppedItem = {
            id: ++droppedItemIdRef.current,
            type: currentCell.type,
            x: dropX,
            y: 2,
          };
          setDroppedItems(prev => [...prev, newDroppedItem]);
        }

        // 인터벌 정리
        if (miningIntervalRef.current) {
          clearInterval(miningIntervalRef.current);
          miningIntervalRef.current = null;
        }
        setMiningState(null);
      } else {
        setMiningState({ col, row, progress, startTime });
      }
    }, 100);
  }, [worldGrid, updateCell]);

  // 땅 블록 채굴 시작
  const handleGroundMiningStart = useCallback((col: number, row: number) => {
    // 맨 아래 줄(row 3)은 채굴 불가
    if (row >= 3) return;

    const blockType = groundBlocks[row]?.[col];
    if (!blockType) return;

    // 이미 채굴 중이면 무시
    if (miningIntervalRef.current) {
      return;
    }

    const startTime = Date.now();
    // 땅 블록은 row를 음수로 표시해서 구분 (row 0 -> -1, row 1 -> -2, etc.)
    setMiningState({ col, row: -(row + 1), progress: 0, startTime });

    // 채굴 진행 인터벌 시작
    miningIntervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / MINING_TIME) * 100, 100);

      if (progress >= 100) {
        // 채굴 완료 - 땅 블록 제거
        setGroundBlocks(prev => {
          const newBlocks = prev.map(r => [...r]);
          newBlocks[row][col] = null;
          return newBlocks;
        });

        // 드롭 아이템 생성 (캔 블록 그대로 드롭)
        const dropX = col * 5 + 2.5;
        const newDroppedItem: DroppedItem = {
          id: ++droppedItemIdRef.current,
          type: blockType,
          x: dropX,
          y: 2,
        };
        setDroppedItems(prev => [...prev, newDroppedItem]);

        // 인터벌 정리
        if (miningIntervalRef.current) {
          clearInterval(miningIntervalRef.current);
          miningIntervalRef.current = null;
        }
        setMiningState(null);
      } else {
        setMiningState({ col, row: -(row + 1), progress, startTime });
      }
    }, 100);
  }, [groundBlocks]);

  // 전역 마우스업으로 채굴 취소
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      cancelMining();
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [cancelMining]);

  // Steve와 드롭 아이템 충돌 체크 (아이템 수집)
  useEffect(() => {
    if (droppedItems.length === 0) return;

    const pickupCheck = setInterval(() => {
      setDroppedItems(prev => {
        const remaining: DroppedItem[] = [];
        for (const item of prev) {
          const distance = Math.abs(item.x - steveState.x);
          if (distance < PICKUP_DISTANCE) {
            // 아이템 수집
            addItemToInventory(item.type, 1);
          } else {
            remaining.push(item);
          }
        }
        return remaining;
      });
    }, 100);

    return () => clearInterval(pickupCheck);
  }, [droppedItems.length, steveState.x, addItemToInventory]);

  const handleTimeChange = (time: number) => {
    setInitialTime(time);
    setTimeLeft(time);
  };

  const handleStart = () => setMode('running');
  const handlePause = () => setMode('paused');
  const handleReset = () => {
    setMode('idle');
    setTimeLeft(initialTime);
  };

  const handleDone = useCallback(() => {
    setMode('done');
    const minFocused = Math.floor((initialTime - timeLeft) / 60);

    // 화면의 자원 블록 제거 (시각적 정리만, 아이템은 이미 시간 기반으로 획득됨)
    setWorldGrid(prev => {
      const newGrid = prev.map(row => row.map(cell => {
        if (cell?.isResource) {
          return null;
        }
        return cell;
      }));
      return newGrid;
    });

    // 발전 과제 메시지 정의
    const achievements = {
      // 1-5분: 시작 단계
      starter: [
        { title: '발전 과제 달성!', desc: '성공적인 집중의 시작', icon: 'steve_stand', color: '#55FF55' },
        { title: '첫 발걸음!', desc: '천 리 길도 한 걸음부터', icon: 'wooden_pickaxe', color: '#55FF55' },
        { title: '워밍업 완료!', desc: '몸풀기는 끝났다', icon: 'coal', color: '#AAAAAA' },
      ],
      // 5-15분: 초반
      early: [
        { title: '집중 모드!', desc: '흐름을 타기 시작했다', icon: 'iron_pickaxe', color: '#55FFFF' },
        { title: '꾸준함의 힘!', desc: '작은 노력이 쌓인다', icon: 'cobblestone', color: '#AAAAAA' },
        { title: '채굴 시작!', desc: '다이아몬드를 향해', icon: 'stone_pickaxe', color: '#55FFFF' },
        { title: '불씨를 지피다', desc: '화로에 불이 붙었다', icon: 'coal', color: '#FF5555' },
      ],
      // 15-25분: 중반
      mid: [
        { title: '목표 달성!', desc: '시간은 금이다', icon: 'gold_ingot', color: '#FFFF55' },
        { title: '장인의 길!', desc: '숙련도가 상승했다', icon: 'iron_ingot', color: '#FFFFFF' },
        { title: '광맥 발견!', desc: '노력이 빛을 발하다', icon: 'diamond', color: '#55FFFF' },
        { title: '용광로 가동!', desc: '생산성 최대 출력', icon: 'iron_ingot', color: '#FFAA00' },
        { title: '네더 도달!', desc: '차원이 다른 집중력', icon: 'obsidian', color: '#5555FF' },
      ],
      // 25-45분: 후반
      late: [
        { title: '도전 완료!', desc: '도를 넘은 전념', icon: 'diamond', color: '#FF55FF' },
        { title: '엔더 드래곤!', desc: '최종 보스를 향해', icon: 'diamond_sword', color: '#FF55FF' },
        { title: '전설의 시작!', desc: '역사에 남을 집중', icon: 'emerald', color: '#55FF55' },
        { title: '마스터 등급!', desc: '집중력의 정점', icon: 'diamond_pickaxe', color: '#55FFFF' },
        { title: '비콘 활성화!', desc: '영역 전체에 버프 적용', icon: 'emerald', color: '#FFFF55' },
      ],
      // 45분+: 전설
      legendary: [
        { title: '하드코어 클리어!', desc: '불가능을 가능으로', icon: 'nether_star', color: '#FF55FF' },
        { title: '위더 처치!', desc: '한계를 초월하다', icon: 'nether_star', color: '#5555FF' },
        { title: '올 어드밴스먼트!', desc: '모든 발전과제 달성', icon: 'diamond_block', color: '#55FFFF' },
        { title: '스피드런 실패?', desc: '너무 오래 했잖아!', icon: 'clock', color: '#FFAA00' },
      ],
      // 랜덤 이벤트 (어느 시간대든 낮은 확률로)
      random: [
        { title: '크리퍼 회피!', desc: '쉬쉬쉬... 휴, 살았다', icon: 'gunpowder', color: '#55FF55' },
        { title: '행운 인챈트!', desc: '오늘 운이 좋군', icon: 'emerald', color: '#55FF55' },
        { title: '마을 발견!', desc: '거래할 준비 완료', icon: 'emerald', color: '#FFAA00' },
        { title: '던전 클리어!', desc: '몬스터 스포너 파괴', icon: 'bone', color: '#AAAAAA' },
        { title: '낚시의 달인!', desc: '인내심의 보상', icon: 'fishing_rod', color: '#55FFFF' },
        { title: '양털 수집가!', desc: '무지개 양을 찾아서', icon: 'white_wool', color: '#FFFFFF' },
        { title: '레드스톤 공학!', desc: '회로가 작동한다', icon: 'redstone', color: '#FF5555' },
        { title: '이것은 케이크!', desc: '거짓말이 아니에요', icon: 'cake', color: '#FF55FF' },
      ],
    };

    // 시간대별 발전과제 선택
    const pickRandom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

    // 10% 확률로 랜덤 이벤트
    if (Math.random() < 0.1) {
      const achievement = pickRandom(achievements.random);
      addToast(achievement.title, achievement.desc, achievement.icon, achievement.color);
    } else if (minFocused >= 45) {
      const achievement = pickRandom(achievements.legendary);
      addToast(achievement.title, achievement.desc, achievement.icon, achievement.color);
    } else if (minFocused >= 25) {
      const achievement = pickRandom(achievements.late);
      addToast(achievement.title, achievement.desc, achievement.icon, achievement.color);
    } else if (minFocused >= 15) {
      const achievement = pickRandom(achievements.mid);
      addToast(achievement.title, achievement.desc, achievement.icon, achievement.color);
    } else if (minFocused >= 5) {
      const achievement = pickRandom(achievements.early);
      addToast(achievement.title, achievement.desc, achievement.icon, achievement.color);
    } else if (minFocused >= 1) {
      const achievement = pickRandom(achievements.starter);
      addToast(achievement.title, achievement.desc, achievement.icon, achievement.color);
    }
  }, [initialTime, timeLeft, setWorldGrid, addToast]);

  // Timer loop
  useEffect(() => {
    let timerId: number | undefined;
    if (mode === 'running' && timeLeft > 0) {
      timerId = window.setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (mode === 'running' && timeLeft <= 0) {
      handleDone();
    }
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [mode, timeLeft, handleDone]);

  // Ghost Block 업데이트 (마우스 이동 시)
  const handleMouseMove = useCallback((xPercent: number, bottomPercent: number) => {
    const selectedSlot = playerInventory.slots[playerInventory.hotbar];
    if (!selectedSlot.type || selectedSlot.count <= 0) {
      setGhostBlock(null);
      return;
    }

    // 땅 영역 체크 (bottomPercent < 25%)
    if (bottomPercent < 25) {
      const groundCol = Math.floor(xPercent / 5);
      // 4줄 중 어느 줄인지 계산 (row 0 = 맨 위, row 3 = 맨 아래)
      const groundRowPercent = bottomPercent / 25 * 100; // 0~100% within ground area
      const groundRow = 3 - Math.floor(groundRowPercent / 25);

      if (groundCol >= 0 && groundCol < 21 && groundRow >= 0 && groundRow < 4) {
        // 빈 땅 칸이면 ghost block 표시
        if (groundBlocks[groundRow]?.[groundCol] === null) {
          setGhostBlock({
            col: groundCol,
            row: -(groundRow + 1), // 음수로 땅 블록 표시
            type: selectedSlot.type,
            isValid: true,
          });
          return;
        }
      }
      setGhostBlock(null);
      return;
    }

    const { col, row } = percentToGrid(xPercent, bottomPercent);

    // 이미 블록이 있는 셀에서는 ghost block 표시 안함
    if (worldGrid[row]?.[col]) {
      setGhostBlock(null);
      return;
    }

    const stevePos = getSteveGridPos();
    const isValid = isValidPlacement(worldGrid, col, row, stevePos.col, stevePos.row);

    setGhostBlock({
      col,
      row,
      type: selectedSlot.type,
      isValid,
    });
  }, [playerInventory, worldGrid, groundBlocks, getSteveGridPos]);

  // 마우스가 월드 밖으로 나가면 Ghost Block 제거
  const handleMouseLeave = useCallback(() => {
    setGhostBlock(null);
  }, []);

  // 시간에 따른 하늘 상태: 낮(100%~50%) → 노을(50%~30%) → 밤(30%~0%)
  const timeRatio = timeLeft / initialTime;
  const skyState = mode === 'running'
    ? (timeRatio > 0.5 ? 'day' : timeRatio > 0.3 ? 'sunset' : 'night')
    : 'day';
  const isNight = skyState === 'night';
  const isSunset = skyState === 'sunset';

  return (
    <div className="game-container">
      <h1 className="header">POMOCRAFT</h1>

      <ToastContainer toasts={toasts} />

      <Timer
        timeLeft={timeLeft}
        initialTime={initialTime}
        mode={mode}
        onTimeChange={handleTimeChange}
        onStart={handleStart}
        onPause={handlePause}
        onReset={handleReset}
        onDone={handleDone}
      />

      <WorldView
        worldGrid={worldGrid}
        groundBlocks={groundBlocks}
        ghostBlock={isInventoryOpen || miningState ? null : ghostBlock}
        mode={mode}
        isNight={isNight}
        isSunset={isSunset}
        selectedItem={isInventoryOpen ? null : playerInventory.slots[playerInventory.hotbar]}
        steveState={steveState}
        miningState={miningState}
        droppedItems={droppedItems}
        onWorldClick={isInventoryOpen ? () => {} : handleWorldClick}
        onMouseMove={isInventoryOpen ? () => {} : handleMouseMove}
        onMouseLeave={isInventoryOpen ? () => {} : handleMouseLeave}
        onCellRightClick={isInventoryOpen ? () => {} : handleCellRightClick}
        onCellMouseDown={isInventoryOpen ? () => {} : handleMiningStart}
        onGroundMouseDown={isInventoryOpen ? () => {} : handleGroundMiningStart}
        onGroundBlockPlace={isInventoryOpen ? () => {} : handleGroundBlockPlace}
      />

      {/* 핫바 UI */}
      <Hotbar
        inventory={playerInventory}
        onSlotSelect={handleHotbarSelect}
      />

      {/* 인벤토리 모달 */}
      <InventoryModal
        isOpen={isInventoryOpen}
        inventory={playerInventory}
        heldItem={heldItem}
        onClose={() => {
          if (heldItem) returnHeldItemToInventory();
          setIsInventoryOpen(false);
        }}
        onSlotClick={handleSlotClick}
        onSlotRightClick={handleSlotRightClick}
        onSlotDoubleClick={handleSlotDoubleClick}
        onDragDistribute={handleDragDistribute}
        onCraftResult={handleCraftResult}
        onSetHeldItem={setHeldItem}
      />

      {/* 제작대 모달 (3x3) */}
      <CraftingModal
        isOpen={isCraftingTableOpen}
        gridSize={3}
        onClose={() => {
          if (heldItem) returnHeldItemToInventory();
          setIsCraftingTableOpen(false);
        }}
        onCraft={(result) => {
          handleCraftResult(result);
        }}
      />

      {/* 들고 있는 아이템 (커서 따라다님) */}
      <HeldItemCursor heldItem={heldItem} />
    </div>
  );
}

export default App;
