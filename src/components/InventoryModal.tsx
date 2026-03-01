import { PlayerInventory, HeldItem } from '../types';
import { PixelSprite } from './PixelSprite';

interface InventoryModalProps {
  isOpen: boolean;
  inventory: PlayerInventory;
  heldItem: HeldItem | null;
  onClose: () => void;
  onSlotClick: (slotIndex: number) => void;
  onSlotRightClick: (slotIndex: number) => void;
}

export function InventoryModal({
  isOpen,
  inventory,
  heldItem: _heldItem, // 나중에 제작 시스템에서 사용
  onClose,
  onSlotClick,
  onSlotRightClick,
}: InventoryModalProps) {
  void _heldItem; // unused for now
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const renderSlot = (slotIndex: number, isHotbar = false) => {
    const slot = inventory.slots[slotIndex];
    const isSelected = isHotbar && inventory.hotbar === slotIndex;
    const slotClass = "inv-slot" + (isSelected ? " inv-slot-selected" : "");

    return (
      <div
        key={slotIndex}
        className={slotClass}
        onClick={() => onSlotClick(slotIndex)}
        onContextMenu={(e) => {
          e.preventDefault();
          onSlotRightClick(slotIndex);
        }}
      >
        {slot.type && (
          <>
            <PixelSprite name={slot.type} size={32} />
            {slot.count > 1 && (
              <span className="inv-slot-count">{slot.count}</span>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="inv-modal-backdrop" onClick={handleBackdropClick}>
      <div className="inv-modal">
        <div className="inv-modal-header">
          <span>인벤토리</span>
          <span className="inv-close-hint">[E] 또는 [ESC]로 닫기</span>
        </div>

        {/* 2x2 제작 그리드 */}
        <div className="inv-section">
          <div className="inv-section-title">제작</div>
          <div className="inv-craft-area">
            <div className="inv-craft-grid">
              {[0, 1, 2, 3].map((i) => (
                <div key={"craft-" + i} className="inv-slot inv-craft-slot">
                </div>
              ))}
            </div>
            <div className="inv-craft-arrow">→</div>
            <div className="inv-slot inv-craft-result">
            </div>
          </div>
        </div>

        {/* 메인 인벤토리 (27슬롯: 9-35) */}
        <div className="inv-section">
          <div className="inv-section-title">인벤토리</div>
          <div className="inv-grid inv-main">
            {Array.from({ length: 27 }, (_, i) => renderSlot(i + 9))}
          </div>
        </div>

        {/* 핫바 (9슬롯: 0-8) */}
        <div className="inv-section">
          <div className="inv-section-title">핫바</div>
          <div className="inv-grid inv-hotbar">
            {Array.from({ length: 9 }, (_, i) => renderSlot(i, true))}
          </div>
        </div>
      </div>
    </div>
  );
}
