import { useState } from 'react';
import { PlayerInventory } from '../types';
import { getItemName } from '../constants';
import { ItemSprite } from './ItemSprite';

interface HotbarProps {
  inventory: PlayerInventory;
  onSlotSelect: (index: number) => void;
}

export function Hotbar({ inventory, onSlotSelect }: HotbarProps) {
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null);
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
            onMouseEnter={() => setHoveredSlot(i)}
            onMouseLeave={() => setHoveredSlot(null)}
          >
            <span className="hotbar-slot-number">{i + 1}</span>
            {slot.type && (
              <>
                <ItemSprite itemId={slot.type} size={36} />
                {slot.count > 1 && (
                  <span className="hotbar-slot-count">{slot.count}</span>
                )}
              </>
            )}
            {hoveredSlot === i && slot.type && (
              <div className="hotbar-item-name">
                {getItemName(slot.type)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
