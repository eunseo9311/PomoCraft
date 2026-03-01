import { useState, useEffect, useCallback, useRef } from 'react';
import { TimerMode, DragInfo, EntityType, PlayerInventory, HeldItem, ItemType, SteveState } from './types';
import { DEFAULT_INVENTORY, createTestInventory, EMPTY_SLOT, MAX_STACK, INVENTORY_STORAGE_KEY } from './constants';
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
const JUMP_VELOCITY = 12;      // 점프 초기 속도
const GRAVITY = 0.8;           // 중력
const GROUND_Y = 0;            // 땅 높이

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

  // E키, ESC키, 숫자키 처리
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // E키: 인벤토리 토글
      if (e.key === 'e' || e.key === 'E' || e.key === 'ㄷ') {
        e.preventDefault();
        setIsInventoryOpen(prev => !prev);
        if (heldItem) setHeldItem(null); // 인벤토리 닫을 때 들고 있는 아이템 드롭
      }

      // ESC키: 인벤토리 닫기
      if (e.key === 'Escape' && isInventoryOpen) {
        setIsInventoryOpen(false);
        if (heldItem) setHeldItem(null);
      }

      // 숫자키 1-9: 핫바 슬롯 선택
      if (!isInventoryOpen && e.key >= '1' && e.key <= '9') {
        const slotIndex = parseInt(e.key) - 1;
        setPlayerInventory(prev => ({ ...prev, hotbar: slotIndex }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isInventoryOpen, heldItem]);

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

  // WASD 이동 + 점프 키 핸들러
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

      // W 떼면 달리기 중지
      if (key === 'w' || key === 'ㅈ') {
        setSteveState(prev => ({ ...prev, isRunning: false }));
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
        let { x, y, velocityY, facingRight, isWalking, isRunning, isJumping, walkFrame } = prev;

        // 이동 입력 처리
        const moveLeft = keysPressed.current.has('a') || keysPressed.current.has('ㅁ');
        const moveRight = keysPressed.current.has('d') || keysPressed.current.has('ㅇ');
        const moveForward = keysPressed.current.has('w') || keysPressed.current.has('ㅈ');

        // 현재 이동 속도 계산
        const speed = isRunning ? STEVE_RUN_SPEED : STEVE_SPEED;

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

        // 걷기 애니메이션 프레임
        if (isWalking) {
          walkFrame = (walkFrame + 1) % 12; // 3프레임 x 4 (속도 조절)
        } else {
          walkFrame = 0;
        }

        return { x, y, velocityY, facingRight, isWalking, isRunning, isJumping, walkFrame };
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
          const maxStack = MAX_STACK[heldItem.type] || 64;
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
          const maxStack = MAX_STACK[heldItem.type] || 64;
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

  // 핫바 슬롯 선택
  const handleHotbarSelect = useCallback((index: number) => {
    setPlayerInventory(prev => ({ ...prev, hotbar: index }));
  }, []);

  // 월드 클릭으로 아이템 배치
  const handleWorldClick = useCallback((xPercent: number, bottomPercent: number) => {
    const selectedSlot = playerInventory.slots[playerInventory.hotbar];
    if (!selectedSlot.type || selectedSlot.count <= 0) return;

    // 배치 가능한 아이템 타입 확인 (설치물)
    const placeableTypes = ['crafting_table', 'furnace', 'chest', 'flower', 'tree'];
    if (!placeableTypes.includes(selectedSlot.type)) return;

    // 새로운 월드 장식 추가
    const newDeco = {
      id: Date.now() + Math.random(),
      type: selectedSlot.type as EntityType,
      x: Math.max(2, Math.min(95, xPercent)),
      bottom: bottomPercent,
      size: selectedSlot.type === 'tree' ? 80 : selectedSlot.type === 'crafting_table' ? 48 : 40,
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

  // 엔티티 클릭 (채집)
  const handleEntityClick = useCallback((entityId: number) => {
    const entity = worldDecorations.find(d => d.id === entityId);
    if (!entity) return;

    // 채집 가능한 자원 정의
    const harvestableResources: Record<string, { resource: ItemType; minAmount: number; maxAmount: number }> = {
      tree: { resource: 'wood', minAmount: 1, maxAmount: 3 },
      stone_block: { resource: 'stone', minAmount: 1, maxAmount: 2 },
    };

    const harvestInfo = harvestableResources[entity.type];
    if (!harvestInfo) return;

    // 랜덤 수량 계산
    const amount = Math.floor(Math.random() * (harvestInfo.maxAmount - harvestInfo.minAmount + 1)) + harvestInfo.minAmount;

    // 인벤토리에 자원 추가
    setPlayerInventory(prev => {
      const newSlots = [...prev.slots];
      let remaining = amount;

      // 기존 슬롯에 같은 아이템 있으면 합치기
      for (let i = 0; i < newSlots.length && remaining > 0; i++) {
        if (newSlots[i].type === harvestInfo.resource) {
          const maxStack = MAX_STACK[harvestInfo.resource] || 64;
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
          const maxStack = MAX_STACK[harvestInfo.resource] || 64;
          const toAdd = Math.min(remaining, maxStack);
          newSlots[i] = { type: harvestInfo.resource, count: toAdd };
          remaining -= toAdd;
        }
      }

      return { ...prev, slots: newSlots };
    });

    // 자원 제거 (나무/돌 사라짐)
    setWorldDecorations(prev => prev.filter(d => d.id !== entityId));

    // 토스트 표시
    addToast(
      '자원 획득!',
      `${harvestInfo.resource} x${amount}`,
      harvestInfo.resource,
      '#55FF55'
    );
  }, [worldDecorations, setWorldDecorations, addToast]);

  // 제작 결과를 인벤토리에 추가
  const handleCraftResult = useCallback((item: { type: ItemType; count: number }) => {
    setPlayerInventory(prev => {
      const newSlots = [...prev.slots];
      let remaining = item.count;

      // 기존 슬롯에 같은 아이템 있으면 합치기
      for (let i = 0; i < newSlots.length && remaining > 0; i++) {
        if (newSlots[i].type === item.type) {
          const maxStack = MAX_STACK[item.type] || 64;
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
          const maxStack = MAX_STACK[item.type] || 64;
          const toAdd = Math.min(remaining, maxStack);
          newSlots[i] = { type: item.type, count: toAdd };
          remaining -= toAdd;
        }
      }

      return { ...prev, slots: newSlots };
    });
  }, []);

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
    const rewards = { ...DEFAULT_INVENTORY };

    let gotMob = false;

    if (minFocused >= 1) {
      rewards.flower = Math.floor(Math.random() * 3) + 1;
      rewards.tree = Math.floor(Math.random() * 2) + 1;

      const mobCount = minFocused >= 25 ? 3 : minFocused >= 15 ? 2 : 1;
      for (let i = 0; i < mobCount; i++) {
        const r = Math.random();
        if (r < 0.15) rewards.dog++;
        else if (r < 0.35) rewards.cat++;
        else if (r < 0.55) rewards.horse++;
        else if (r < 0.75) {
          rewards.zombie++;
          gotMob = true;
        } else if (r < 0.9) {
          rewards.skeleton++;
          gotMob = true;
        } else {
          rewards.creeper++;
          gotMob = true;
        }
      }
    }

    // Show achievement toasts
    if (minFocused >= 1 && minFocused < 15) {
      addToast('발전 과제 달성!', '성공적인 집중의 시작', 'tree', '#55FF55');
    }
    if (minFocused >= 15 && minFocused < 25) {
      addToast('목표 달성!', '시간은 금이다', 'flower', '#FFFF55');
    }
    if (minFocused >= 25) {
      addToast('도전 완료!', '도를 넘은 전념', 'creeper', '#FF55FF');
    }
    if (gotMob) {
      setTimeout(
        () => addToast('발전 과제 달성!', '몬스터 헌터', 'zombie', '#FFFF55'),
        800
      );
    }

    // 새로운 인벤토리 시스템에 자원 추가 (집중 보상으로 wood, stone 획득)
    if (minFocused >= 1) {
      const woodReward = minFocused >= 25 ? 8 : minFocused >= 15 ? 5 : 3;
      const stoneReward = minFocused >= 25 ? 6 : minFocused >= 15 ? 4 : 2;

      setPlayerInventory(prev => {
        const newSlots = [...prev.slots];
        // 빈 슬롯 찾아서 자원 추가
        const addToInventory = (itemType: string, count: number) => {
          // 기존 슬롯에 같은 아이템 있으면 합치기
          for (let i = 0; i < newSlots.length; i++) {
            if (newSlots[i].type === itemType && newSlots[i].count < 64) {
              const canAdd = Math.min(count, 64 - newSlots[i].count);
              newSlots[i] = { ...newSlots[i], count: newSlots[i].count + canAdd };
              count -= canAdd;
              if (count <= 0) return;
            }
          }
          // 빈 슬롯에 추가
          for (let i = 0; i < newSlots.length && count > 0; i++) {
            if (!newSlots[i].type) {
              const toAdd = Math.min(count, 64);
              newSlots[i] = { type: itemType as any, count: toAdd };
              count -= toAdd;
            }
          }
        };

        addToInventory('wood', woodReward);
        addToInventory('stone', stoneReward);
        return { ...prev, slots: newSlots };
      });
    }

    const newDecos = (Object.entries(rewards) as [EntityType, number][]).flatMap(
      ([type, count]) => {
        const decos = [];
        for (let i = 0; i < count; i++) {
          let baseBottom = 12 + Math.random() * 10;
          let size = 32 + Math.random() * 10;
          const newX = 5 + Math.random() * 85;

          if (type === 'tree') {
            size = 60 + Math.random() * 90;
          } else if (
            ['dog', 'cat', 'zombie', 'creeper', 'skeleton', 'horse'].includes(type)
          ) {
            size = 48 + Math.random() * 15;
            if (type === 'horse') size += 20;
          }

          decos.push({
            id: Date.now() + Math.random(),
            type,
            x: newX,
            bottom: baseBottom,
            size,
            flip: Math.random() > 0.5,
          });
        }
        return decos;
      }
    );

    // 집중 시간에 따라 돌 블록도 생성
    if (minFocused >= 1) {
      const stoneBlockCount = minFocused >= 25 ? 3 : minFocused >= 15 ? 2 : 1;
      for (let i = 0; i < stoneBlockCount; i++) {
        newDecos.push({
          id: Date.now() + Math.random() + 1000,
          type: 'stone_block' as EntityType,
          x: 5 + Math.random() * 85,
          bottom: 12 + Math.random() * 8,
          size: 48 + Math.random() * 16,
          flip: false,
        });
      }
    }

    setWorldDecorations((prev) => [...prev, ...newDecos]);
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
        onEntityClick={isInventoryOpen ? () => {} : handleEntityClick}
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
