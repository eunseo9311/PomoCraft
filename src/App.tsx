import { useState, useEffect, useCallback, useRef } from 'react';
import { TimerMode, DragInfo, PlayerInventory, HeldItem, ItemType, SteveState } from './types';
import { createTestInventory, EMPTY_SLOT, INVENTORY_STORAGE_KEY, getMaxStack } from './constants';
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
const JUMP_VELOCITY = 12;      // 점프 초기 속도
const GRAVITY = 0.8;           // 중력
const GROUND_Y = 0;            // 땅 높이

// 자원 채집 상수
const RESOURCE_SPAWN_INTERVAL = 3000;   // 자원 스폰 간격 (ms)
const AUTO_GATHER_INTERVAL = 5000;      // 자동 채집 간격 (ms)
const RESOURCE_DESPAWN_TIME = 30000;    // 자원 디스폰 시간 (ms)
const MAX_RESOURCES_ON_SCREEN = 8;      // 화면에 최대 자원 블록 수

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
  const [dragInfo, setDragInfo] = useState<DragInfo | null>(null);

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

  const { toasts, addToast } = useToast();
  const {
    worldDecorations,
    setWorldDecorations,
  } = useLocalStorage();

  // 플레이어 인벤토리 저장
  useEffect(() => {
    localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(playerInventory));
  }, [playerInventory]);

  // 아이템 버리기 함수
  const dropItem = useCallback((dropAll: boolean) => {
    const currentSlot = playerInventory.slots[playerInventory.hotbar];
    if (!currentSlot.type || currentSlot.count <= 0) return;

    const dropCount = dropAll ? currentSlot.count : 1;

    // 월드에 아이템 드롭 (Steve 위치 근처)
    const droppedItem = {
      id: Date.now() + Math.random(),
      type: currentSlot.type,
      x: steveState.x + (steveState.facingRight ? 5 : -5),
      bottom: 15 + Math.random() * 5,
      size: 32,
      flip: false,
    };
    setWorldDecorations(prev => [...prev, droppedItem]);

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
  }, [playerInventory, steveState, setWorldDecorations, addToast]);

  // E키, ESC키, 숫자키, Q키, F키 처리
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // E키: 인벤토리 토글
      if (e.key === 'e' || e.key === 'E' || e.key === 'ㄷ') {
        e.preventDefault();
        setIsInventoryOpen(prev => !prev);
        if (heldItem) setHeldItem(null); // 인벤토리 닫을 때 들고 있는 아이템 드롭
      }

      // ESC키: 인벤토리/제작대 닫기
      if (e.key === 'Escape') {
        if (isCraftingTableOpen) {
          setIsCraftingTableOpen(false);
        } else if (isInventoryOpen) {
          setIsInventoryOpen(false);
          if (heldItem) setHeldItem(null);
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
  }, [isInventoryOpen, isCraftingTableOpen, heldItem, dropItem]);

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
          if (!prev.isJumping && prev.y === GROUND_Y) {
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
  }, [isInventoryOpen, isCraftingTableOpen]);

  // Steve 게임 루프 (물리 + 애니메이션)
  useEffect(() => {
    if (isInventoryOpen || isCraftingTableOpen) return;

    const gameLoop = setInterval(() => {
      setSteveState(prev => {
        let { x, y, velocityY, facingRight, isWalking, isRunning, isJumping, isCrouching, walkFrame } = prev;

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

        // 이동 처리
        if (moveLeft) {
          x = Math.max(2, x - speed);
          facingRight = false;
          isWalking = true;
        } else if (moveRight) {
          x = Math.min(95, x + speed);
          facingRight = true;
          isWalking = true;
        } else if (moveForward) {
          // W키만 누르면 바라보는 방향으로 이동
          if (facingRight) {
            x = Math.min(95, x + speed);
          } else {
            x = Math.max(2, x - speed);
          }
          isWalking = true;
        } else if (moveBackward) {
          // S키: 뒤로 이동 (바라보는 반대 방향)
          if (facingRight) {
            x = Math.max(2, x - speed * 0.7); // 후진은 더 느림
          } else {
            x = Math.min(95, x + speed * 0.7);
          }
          isWalking = true;
        } else {
          isWalking = false;
        }

        // 중력 및 점프 물리
        if (isJumping || y > GROUND_Y) {
          velocityY -= GRAVITY;
          y = Math.max(GROUND_Y, y + velocityY * 0.1);

          if (y === GROUND_Y) {
            isJumping = false;
            velocityY = 0;
          }
        }

        // 걷기 애니메이션 프레임 (웅크리기 시 더 느리게)
        if (isWalking) {
          const animSpeed = isCrouching ? 6 : 4;
          walkFrame = (walkFrame + 1) % (3 * animSpeed);
        } else {
          walkFrame = 0;
        }

        return { x, y, velocityY, facingRight, isWalking, isRunning, isJumping, isCrouching, walkFrame };
      });
    }, 1000 / 60); // 60 FPS

    return () => clearInterval(gameLoop);
  }, [isInventoryOpen, isCraftingTableOpen]);

  // 슬롯 클릭 (아이템 들기/놓기)
  const handleSlotClick = useCallback((slotIndex: number) => {
    setPlayerInventory(prev => {
      const newSlots = [...prev.slots];
      const clickedSlot = newSlots[slotIndex];

      if (heldItem === null) {
        // 아무것도 안 들고 있을 때: 슬롯에서 아이템 집기
        if (clickedSlot.type) {
          setHeldItem({
            type: clickedSlot.type,
            count: clickedSlot.count,
            sourceSlot: slotIndex
          });
          newSlots[slotIndex] = { ...EMPTY_SLOT };
        }
      } else {
        // 아이템 들고 있을 때
        if (!clickedSlot.type) {
          // 빈 슬롯에 놓기
          newSlots[slotIndex] = { type: heldItem.type, count: heldItem.count };
          setHeldItem(null);
        } else if (clickedSlot.type === heldItem.type) {
          // 같은 아이템이면 합치기
          const maxStack = getMaxStack(heldItem.type);
          const totalCount = clickedSlot.count + heldItem.count;
          if (totalCount <= maxStack) {
            newSlots[slotIndex] = { type: clickedSlot.type, count: totalCount };
            setHeldItem(null);
          } else {
            newSlots[slotIndex] = { type: clickedSlot.type, count: maxStack };
            setHeldItem({ ...heldItem, count: totalCount - maxStack });
          }
        } else {
          // 다른 아이템이면 교환
          const temp = { ...clickedSlot };
          newSlots[slotIndex] = { type: heldItem.type, count: heldItem.count };
          setHeldItem({ type: temp.type!, count: temp.count, sourceSlot: slotIndex });
        }
      }

      return { ...prev, slots: newSlots };
    });
  }, [heldItem]);

  // 우클릭 (절반만 놓기)
  const handleSlotRightClick = useCallback((slotIndex: number) => {
    setPlayerInventory(prev => {
      const newSlots = [...prev.slots];
      const clickedSlot = newSlots[slotIndex];

      if (heldItem === null) {
        // 아무것도 안 들고 있을 때: 절반만 집기
        if (clickedSlot.type && clickedSlot.count > 1) {
          const halfCount = Math.floor(clickedSlot.count / 2);
          const remainCount = clickedSlot.count - halfCount;
          setHeldItem({
            type: clickedSlot.type,
            count: halfCount,
            sourceSlot: slotIndex
          });
          newSlots[slotIndex] = { type: clickedSlot.type, count: remainCount };
        } else if (clickedSlot.type) {
          // 1개면 전부 집기
          setHeldItem({
            type: clickedSlot.type,
            count: clickedSlot.count,
            sourceSlot: slotIndex
          });
          newSlots[slotIndex] = { ...EMPTY_SLOT };
        }
      } else {
        // 아이템 들고 있을 때: 1개만 놓기
        if (!clickedSlot.type) {
          newSlots[slotIndex] = { type: heldItem.type, count: 1 };
          if (heldItem.count > 1) {
            setHeldItem({ ...heldItem, count: heldItem.count - 1 });
          } else {
            setHeldItem(null);
          }
        } else if (clickedSlot.type === heldItem.type) {
          const maxStack = getMaxStack(heldItem.type);
          if (clickedSlot.count < maxStack) {
            newSlots[slotIndex] = { type: clickedSlot.type, count: clickedSlot.count + 1 };
            if (heldItem.count > 1) {
              setHeldItem({ ...heldItem, count: heldItem.count - 1 });
            } else {
              setHeldItem(null);
            }
          }
        }
      }

      return { ...prev, slots: newSlots };
    });
  }, [heldItem]);

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

  // 월드 클릭으로 아이템 배치
  const handleWorldClick = useCallback((xPercent: number, bottomPercent: number) => {
    const selectedSlot = playerInventory.slots[playerInventory.hotbar];
    if (!selectedSlot.type || selectedSlot.count <= 0) return;

    // 새로운 월드 장식 추가
    const newDeco = {
      id: Date.now() + Math.random(),
      type: selectedSlot.type,
      x: Math.max(2, Math.min(95, xPercent)),
      bottom: bottomPercent,
      size: 48,
      flip: false,
    };

    setWorldDecorations(prev => [...prev, newDeco]);

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
  }, [playerInventory, setWorldDecorations]);

  // 엔티티 우클릭 (상호작용)
  const handleEntityRightClick = useCallback((entityId: number) => {
    const entity = worldDecorations.find(d => d.id === entityId);
    if (!entity) return;

    // 제작대 우클릭 시 3x3 제작 UI 열기
    if (entity.type === 'crafting_table') {
      setIsCraftingTableOpen(true);
    }
  }, [worldDecorations]);

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

  // 자원 블록 스폰 (running 모드에서만)
  useEffect(() => {
    if (mode !== 'running') return;

    const spawnResource = () => {
      const elapsedMinutes = Math.floor((initialTime - timeLeft) / 60);
      const pool = getResourcePool(elapsedMinutes);
      const resourceType = selectRandomResource(pool);

      // 현재 자원 블록 수 확인
      const currentResourceCount = worldDecorations.filter(d => d.isResource).length;
      if (currentResourceCount >= MAX_RESOURCES_ON_SCREEN) return;

      const newResource = {
        id: Date.now() + Math.random(),
        type: resourceType,
        x: 5 + Math.random() * 85,  // 화면 5%~90% 범위
        bottom: 15 + Math.random() * 15, // 땅 위 15%~30%
        size: 40,
        flip: false,
        spawnedAt: Date.now(),
        isResource: true,
      };

      setWorldDecorations(prev => [...prev, newResource]);
    };

    // 초기 스폰
    spawnResource();

    // 주기적 스폰
    const spawnInterval = setInterval(spawnResource, RESOURCE_SPAWN_INTERVAL);

    return () => clearInterval(spawnInterval);
  }, [mode, initialTime, timeLeft, worldDecorations, setWorldDecorations]);

  // 자동 채집 (running 모드에서만)
  useEffect(() => {
    if (mode !== 'running') return;

    const autoGather = () => {
      const elapsedMinutes = Math.floor((initialTime - timeLeft) / 60);
      const pool = getResourcePool(elapsedMinutes);
      const resourceType = selectRandomResource(pool);

      addItemToInventory(resourceType, 1);
      addToast('자동 채집', `${resourceType} +1`, resourceType, '#8B4513');
    };

    const gatherInterval = setInterval(autoGather, AUTO_GATHER_INTERVAL);

    return () => clearInterval(gatherInterval);
  }, [mode, initialTime, timeLeft, addItemToInventory, addToast]);

  // 자원 블록 디스폰 (시간 경과 후 삭제)
  useEffect(() => {
    const despawnCheck = setInterval(() => {
      const now = Date.now();
      setWorldDecorations(prev =>
        prev.filter(d => {
          if (!d.isResource || !d.spawnedAt) return true;
          return now - d.spawnedAt < RESOURCE_DESPAWN_TIME;
        })
      );
    }, 1000);

    return () => clearInterval(despawnCheck);
  }, [setWorldDecorations]);

  // 자원 블록 채굴 (클릭 시) - running 모드에서만 채굴 가능
  const handleMineResource = useCallback((entityId: number) => {
    const entity = worldDecorations.find(d => d.id === entityId);
    if (!entity) return;

    // running 모드가 아니면 채굴 불가
    if (mode !== 'running') {
      // 일반 아이템 줍기 (자원 블록이 아닌 경우)
      if (!entity.isResource) {
        addItemToInventory(entity.type, 1);
        setWorldDecorations(prev => prev.filter(d => d.id !== entityId));
      }
      return;
    }

    // 자원 블록 채굴
    addItemToInventory(entity.type, 1);
    setWorldDecorations(prev => prev.filter(d => d.id !== entityId));

    // 채굴 토스트
    if (entity.isResource) {
      addToast('채굴 완료!', `${entity.type} +1`, entity.type, '#55FF55');
    }
  }, [mode, worldDecorations, addItemToInventory, setWorldDecorations, addToast]);

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
  }, [mode, timeLeft]);

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

  const handleDone = () => {
    setMode('done');
    const minFocused = Math.floor((initialTime - timeLeft) / 60);

    // 집중 시간에 따른 토스트 표시
    if (minFocused >= 1 && minFocused < 15) {
      addToast('발전 과제 달성!', '성공적인 집중의 시작', 'steve_stand', '#55FF55');
    }
    if (minFocused >= 15 && minFocused < 25) {
      addToast('목표 달성!', '시간은 금이다', 'steve_stand', '#FFFF55');
    }
    if (minFocused >= 25) {
      addToast('도전 완료!', '도를 넘은 전념', 'steve_stand', '#FF55FF');
    }
  };

  const handleDragStart = useCallback((info: DragInfo) => {
    setDragInfo(info);
  }, []);

  const handleDragMove = useCallback(
    (deltaXPercent: number, deltaBottomPercent: number) => {
      if (!dragInfo) return;
      setWorldDecorations((prev) =>
        prev.map((d) =>
          d.id === dragInfo.id
            ? {
                ...d,
                x: Math.max(0, Math.min(95, dragInfo.initX + deltaXPercent)),
                bottom: Math.max(
                  5,
                  Math.min(90, dragInfo.initBottom + deltaBottomPercent)
                ),
              }
            : d
        )
      );
    },
    [dragInfo, setWorldDecorations]
  );

  const handleDragEnd = useCallback(() => {
    setDragInfo(null);
  }, []);

  const isNight = mode === 'running' && timeLeft / initialTime < 0.3;

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
        decorations={worldDecorations}
        mode={mode}
        isNight={isNight}
        dragInfo={isInventoryOpen ? null : dragInfo}
        selectedItem={isInventoryOpen ? null : playerInventory.slots[playerInventory.hotbar]}
        steveState={steveState}
        onDragStart={isInventoryOpen ? () => {} : handleDragStart}
        onDragMove={isInventoryOpen ? () => {} : handleDragMove}
        onDragEnd={isInventoryOpen ? () => {} : handleDragEnd}
        onWorldClick={isInventoryOpen ? () => {} : handleWorldClick}
        onEntityRightClick={isInventoryOpen ? () => {} : handleEntityRightClick}
        onEntityClick={isInventoryOpen ? () => {} : handleMineResource}
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
          setIsInventoryOpen(false);
          if (heldItem) setHeldItem(null);
        }}
        onSlotClick={handleSlotClick}
        onSlotRightClick={handleSlotRightClick}
        onSlotDoubleClick={handleSlotDoubleClick}
        onDragDistribute={handleDragDistribute}
        onCraftResult={handleCraftResult}
      />

      {/* 제작대 모달 (3x3) */}
      <CraftingModal
        isOpen={isCraftingTableOpen}
        gridSize={3}
        onClose={() => setIsCraftingTableOpen(false)}
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
