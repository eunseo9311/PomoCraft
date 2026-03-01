import { PlayerInventory } from '../types';
import { PixelSprite } from './PixelSprite';

interface HotbarProps {
  inventory: PlayerInventory;
  onSlotSelect: (index: number) => void;
}

export function Hotbar({ inventory, onSlotSelect }: HotbarProps) {
  return (
    <div className="hotbar-ui">
      {Array.from({ length: 9 }, (_, i) => {
        const slot = inventory.slots[i];
        const isSelected = inventory.hotbar === i;
        const slotClass = "hotbar-slot" + (isSelected ? " hotbar-slot-selected" : "");

        return (
          <div
            key={i}
            className={slotClass}
            onClick={() => onSlotSelect(i)}
          >
            <span className="hotbar-slot-number">{i + 1}</span>
            {slot.type && (
              <>
                <PixelSprite name={slot.type} size={36} />
                {slot.count > 1 && (
                  <span className="hotbar-slot-count">{slot.count}</span>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
