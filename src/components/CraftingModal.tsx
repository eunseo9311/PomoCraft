import { useState, useEffect } from 'react';
import { InventorySlot, ItemType } from '../types';
import { EMPTY_SLOT } from '../constants';
import { matchRecipe, RECIPES_2X2, RECIPES_3X3, Recipe } from '../constants/crafting';
import { PixelSprite } from './PixelSprite';

interface CraftingModalProps {
  isOpen: boolean;
  gridSize: 2 | 3;
  onClose: () => void;
  onCraft: (result: { type: ItemType; count: number }, consumed: number) => void;
}

export function CraftingModal({ isOpen, gridSize, onClose, onCraft }: CraftingModalProps) {
  const [grid, setGrid] = useState<InventorySlot[]>(
    Array(gridSize * gridSize).fill(null).map(() => ({ ...EMPTY_SLOT }))
  );
  const [result, setResult] = useState<Recipe | null>(null);

  useEffect(() => {
    setGrid(Array(gridSize * gridSize).fill(null).map(() => ({ ...EMPTY_SLOT })));
    setResult(null);
  }, [isOpen, gridSize]);

  useEffect(() => {
    const recipes = gridSize === 3 ? RECIPES_3X3 : RECIPES_2X2;
    setResult(matchRecipe(grid, gridSize, recipes));
  }, [grid, gridSize]);

  const handleSlotClick = (index: number) => {
    // 간단한 토글 (실제로는 인벤토리에서 아이템 가져와야 함)
    setGrid(prev => {
      const newGrid = [...prev];
      if (newGrid[index].type) {
        newGrid[index] = { ...EMPTY_SLOT };
      }
      return newGrid;
    });
  };

  const handleCraft = () => {
    if (!result) return;
    onCraft(result.result, grid.filter(s => s.type).length);
    setGrid(Array(gridSize * gridSize).fill(null).map(() => ({ ...EMPTY_SLOT })));
  };

  if (!isOpen) return null;

  return (
    <div className="inv-modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="inv-modal crafting-modal">
        <div className="inv-modal-header">
          <span>{gridSize === 3 ? '제작대' : '제작'}</span>
          <span className="inv-close-hint">[ESC]로 닫기</span>
        </div>

        <div className="crafting-area">
          <div className={gridSize === 3 ? 'craft-grid-3x3' : 'craft-grid-2x2'}>
            {grid.map((slot, i) => (
              <div
                key={i}
                className="inv-slot"
                onClick={() => handleSlotClick(i)}
              >
                {slot.type && (
                  <>
                    <PixelSprite name={slot.type} size={32} />
                    {slot.count > 1 && <span className="inv-slot-count">{slot.count}</span>}
                  </>
                )}
              </div>
            ))}
          </div>

          <div className="craft-arrow">→</div>

          <div
            className="inv-slot craft-result"
            onClick={result ? handleCraft : undefined}
            style={{ cursor: result ? 'pointer' : 'default' }}
          >
            {result && (
              <>
                <PixelSprite name={result.result.type} size={32} />
                {result.result.count > 1 && (
                  <span className="inv-slot-count">{result.result.count}</span>
                )}
              </>
            )}
          </div>
        </div>

        <div className="crafting-help">
          아이템을 드래그하여 제작 그리드에 배치하세요
        </div>
      </div>
    </div>
  );
}
