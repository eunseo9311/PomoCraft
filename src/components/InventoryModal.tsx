import { useState, useEffect } from 'react';
import { PlayerInventory, HeldItem, InventorySlot, ItemType } from '../types';
import { EMPTY_SLOT } from '../constants';
import { matchRecipe, RECIPES_2X2 } from '../constants/crafting';
import { PixelSprite } from './PixelSprite';
import { ItemSprite } from './ItemSprite';

// 갑옷 슬롯 아이콘들 (SVG)
const HelmetIcon = () => (
  <svg viewBox="0 0 16 16" width="24" height="24" style={{ opacity: 0.3 }}>
    <path fill="#555" d="M4,6 L12,6 L12,4 L4,4 Z M3,7 L13,7 L13,12 L11,12 L11,10 L5,10 L5,12 L3,12 Z"/>
  </svg>
);

const ChestplateIcon = () => (
  <svg viewBox="0 0 16 16" width="24" height="24" style={{ opacity: 0.3 }}>
    <path fill="#555" d="M3,3 L6,3 L6,5 L10,5 L10,3 L13,3 L13,13 L10,13 L10,8 L6,8 L6,13 L3,13 Z"/>
  </svg>
);

const LeggingsIcon = () => (
  <svg viewBox="0 0 16 16" width="24" height="24" style={{ opacity: 0.3 }}>
    <path fill="#555" d="M4,2 L12,2 L12,5 L10,5 L10,14 L8,14 L8,5 L8,5 L6,14 L4,14 L4,5 L4,2 Z"/>
  </svg>
);

const BootsIcon = () => (
  <svg viewBox="0 0 16 16" width="24" height="24" style={{ opacity: 0.3 }}>
    <path fill="#555" d="M3,4 L6,4 L6,10 L2,10 L2,8 L3,8 Z M10,4 L13,4 L13,8 L14,8 L14,10 L10,10 Z"/>
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 16 16" width="24" height="24" style={{ opacity: 0.3 }}>
    <path fill="#555" d="M4,2 L12,2 L12,4 L13,4 L13,8 L12,10 L10,12 L8,13 L6,12 L4,10 L3,8 L3,4 L4,4 Z M5,4 L5,8 L6,9 L8,10 L10,9 L11,8 L11,4 Z"/>
  </svg>
);

interface InventoryModalProps {
  isOpen: boolean;
  inventory: PlayerInventory;
  heldItem: HeldItem | null;
  onClose: () => void;
  onSlotClick: (slotIndex: number) => void;
  onSlotRightClick: (slotIndex: number) => void;
  onSlotDoubleClick: (slotIndex: number) => void;
  onDragDistribute: (slotIndices: number[], isRightDrag: boolean) => void;
  onCraftResult: (item: { type: ItemType; count: number }) => void;
}

export function InventoryModal({
  isOpen,
  inventory,
  heldItem,
  onClose,
  onSlotClick,
  onSlotRightClick,
  onSlotDoubleClick,
  onDragDistribute,
  onCraftResult,
}: InventoryModalProps) {
  const [craftGrid, setCraftGrid] = useState<InventorySlot[]>(
    Array(4).fill(null).map(() => ({ ...EMPTY_SLOT }))
  );

  // 드래그 상태
  const [isDragging, setIsDragging] = useState(false);
  const [isRightDrag, setIsRightDrag] = useState(false);
  const [draggedSlots, setDraggedSlots] = useState<number[]>([]);

  // 제작 결과 계산
  const craftResult = matchRecipe(craftGrid, 2, RECIPES_2X2);

  // 모달 닫힐 때 제작 그리드 초기화
  useEffect(() => {
    if (!isOpen) {
      setCraftGrid(Array(4).fill(null).map(() => ({ ...EMPTY_SLOT })));
    }
  }, [isOpen]);

  // 제작 슬롯 클릭
  const handleCraftSlotClick = (index: number) => {
    if (heldItem) {
      // 들고 있는 아이템을 제작 슬롯에 놓기
      setCraftGrid(prev => {
        const newGrid = [...prev];
        if (!newGrid[index].type) {
          newGrid[index] = { type: heldItem.type, count: 1 };
        } else if (newGrid[index].type === heldItem.type) {
          newGrid[index] = { ...newGrid[index], count: newGrid[index].count + 1 };
        }
        return newGrid;
      });
    } else if (craftGrid[index].type) {
      // 제작 슬롯에서 아이템 집기 (인벤토리로 돌려보내기)
      const item = craftGrid[index];
      onCraftResult({ type: item.type!, count: item.count });
      setCraftGrid(prev => {
        const newGrid = [...prev];
        newGrid[index] = { ...EMPTY_SLOT };
        return newGrid;
      });
    }
  };

  // 제작 결과 클릭
  const handleCraftResultClick = () => {
    if (!craftResult) return;

    // 결과물 인벤토리에 추가
    onCraftResult(craftResult.result);

    // 재료 소모
    setCraftGrid(prev => {
      const newGrid = [...prev];
      for (let i = 0; i < newGrid.length; i++) {
        if (newGrid[i].type) {
          if (newGrid[i].count > 1) {
            newGrid[i] = { ...newGrid[i], count: newGrid[i].count - 1 };
          } else {
            newGrid[i] = { ...EMPTY_SLOT };
          }
        }
      }
      return newGrid;
    });
  };

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // 드래그 시작
  const handleMouseDown = (slotIndex: number, e: React.MouseEvent) => {
    if (heldItem && (e.button === 0 || e.button === 2)) {
      setIsDragging(true);
      setIsRightDrag(e.button === 2);
      setDraggedSlots([slotIndex]);
    }
  };

  // 드래그 중 슬롯 진입
  const handleMouseEnter = (slotIndex: number) => {
    if (isDragging && heldItem && !draggedSlots.includes(slotIndex)) {
      const slot = inventory.slots[slotIndex];
      // 빈 슬롯이거나 같은 아이템인 경우만 추가
      if (!slot.type || slot.type === heldItem.type) {
        setDraggedSlots(prev => [...prev, slotIndex]);
      }
    }
  };

  // 드래그 종료
  const handleMouseUp = () => {
    if (isDragging && draggedSlots.length > 0) {
      onDragDistribute(draggedSlots, isRightDrag);
    }
    setIsDragging(false);
    setDraggedSlots([]);
  };

  // 마우스 업 이벤트 (전역)
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseUp = () => handleMouseUp();
      window.addEventListener('mouseup', handleGlobalMouseUp);
      return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
    }
  }, [isDragging, draggedSlots]);

  const renderSlot = (slotIndex: number, isHotbar = false) => {
    const slot = inventory.slots[slotIndex];
    const isSelected = isHotbar && inventory.hotbar === slotIndex;
    const isDragTarget = draggedSlots.includes(slotIndex);
    const slotClass = "inv-slot" + (isSelected ? " inv-slot-selected" : "") + (isDragTarget ? " inv-slot-dragging" : "");

    return (
      <div
        key={slotIndex}
        className={slotClass}
        onClick={() => onSlotClick(slotIndex)}
        onDoubleClick={() => onSlotDoubleClick(slotIndex)}
        onMouseDown={(e) => handleMouseDown(slotIndex, e)}
        onMouseEnter={() => handleMouseEnter(slotIndex)}
        onContextMenu={(e) => {
          e.preventDefault();
          if (!isDragging) {
            onSlotRightClick(slotIndex);
          }
        }}
      >
        {slot.type && (
          <>
            <ItemSprite itemId={slot.type} size={32} />
            {slot.count > 1 && (
              <span className="inv-slot-count">{slot.count}</span>
            )}
          </>
        )}
      </div>
    );
  };

  // 갑옷 슬롯 아이콘 (placeholder)
  const armorIcons = ['helmet', 'chestplate', 'leggings', 'boots'];

  return (
    <div className="inv-modal-backdrop" onClick={handleBackdropClick}>
      <div className="inv-modal inv-modal-mc">
        {/* 상단 영역: 캐릭터 + 제작 */}
        <div className="inv-top-area">
          {/* 왼쪽: 갑옷 슬롯 + Steve 미리보기 */}
          <div className="inv-character-section">
            {/* 갑옷 슬롯 (4개) */}
            <div className="inv-armor-slots">
              {armorIcons.map((icon, i) => (
                <div key={icon} className="inv-slot inv-armor-slot">
                  <div className="armor-icon-placeholder" data-type={icon}>
                    {i === 0 && <HelmetIcon />}
                    {i === 1 && <ChestplateIcon />}
                    {i === 2 && <LeggingsIcon />}
                    {i === 3 && <BootsIcon />}
                  </div>
                </div>
              ))}
            </div>

            {/* Steve 미리보기 */}
            <div className="inv-steve-preview">
              <PixelSprite name="steve_stand" size={80} />
            </div>

            {/* 방패 슬롯 */}
            <div className="inv-shield-slot">
              <div className="inv-slot">
                <ShieldIcon />
              </div>
            </div>
          </div>

          {/* 오른쪽: 제작 그리드 */}
          <div className="inv-crafting-section">
            <div className="inv-section-title">Crafting</div>
            <div className="inv-craft-area">
              <div className="inv-craft-grid">
                {craftGrid.map((slot, i) => (
                  <div
                    key={"craft-" + i}
                    className="inv-slot inv-craft-slot"
                    onClick={() => handleCraftSlotClick(i)}
                  >
                    {slot.type && (
                      <>
                        <ItemSprite itemId={slot.type} size={32} />
                        {slot.count > 1 && <span className="inv-slot-count">{slot.count}</span>}
                      </>
                    )}
                  </div>
                ))}
              </div>
              <div className="inv-craft-arrow">→</div>
              <div
                className="inv-slot inv-craft-result"
                onClick={handleCraftResultClick}
                style={{ cursor: craftResult ? 'pointer' : 'default' }}
              >
                {craftResult && (
                  <>
                    <ItemSprite itemId={craftResult.result.type} size={32} />
                    {craftResult.result.count > 1 && (
                      <span className="inv-slot-count">{craftResult.result.count}</span>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 메인 인벤토리 (27슬롯: 9-35) */}
        <div className="inv-section">
          <div className="inv-grid inv-main">
            {Array.from({ length: 27 }, (_, i) => renderSlot(i + 9))}
          </div>
        </div>

        {/* 핫바 (9슬롯: 0-8) */}
        <div className="inv-section inv-hotbar-section">
          <div className="inv-grid inv-hotbar">
            {Array.from({ length: 9 }, (_, i) => renderSlot(i, true))}
          </div>
        </div>
      </div>
    </div>
  );
}
