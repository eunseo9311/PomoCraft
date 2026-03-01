import { ItemType, InventorySlot } from '../types';

export interface Recipe {
  pattern: (ItemType | null)[][];
  result: { type: ItemType; count: number };
}

// 2x2 레시피 (인벤토리에서 제작 가능)
export const RECIPES_2X2: Recipe[] = [
  {
    pattern: [['wood']],
    result: { type: 'plank', count: 4 }
  },
  {
    pattern: [['plank'], ['plank']],
    result: { type: 'stick', count: 4 }
  },
  {
    pattern: [['plank', 'plank'], ['plank', 'plank']],
    result: { type: 'crafting_table', count: 1 }
  },
];

// 3x3 레시피 (제작대에서만)
export const RECIPES_3X3: Recipe[] = [
  ...RECIPES_2X2,
  {
    pattern: [
      ['cobblestone', 'cobblestone', 'cobblestone'],
      ['cobblestone', null, 'cobblestone'],
      ['cobblestone', 'cobblestone', 'cobblestone']
    ],
    result: { type: 'furnace', count: 1 }
  },
  {
    pattern: [
      ['plank', 'plank', 'plank'],
      ['plank', null, 'plank'],
      ['plank', 'plank', 'plank']
    ],
    result: { type: 'chest', count: 1 }
  },
];

export function matchRecipe(grid: InventorySlot[], gridSize: 2 | 3, recipes: Recipe[]): Recipe | null {
  const gridTypes: (ItemType | null)[][] = [];
  for (let row = 0; row < gridSize; row++) {
    const rowData: (ItemType | null)[] = [];
    for (let col = 0; col < gridSize; col++) {
      rowData.push(grid[row * gridSize + col].type);
    }
    gridTypes.push(rowData);
  }

  for (const recipe of recipes) {
    if (matchPattern(gridTypes, recipe.pattern, gridSize)) {
      return recipe;
    }
  }
  return null;
}

function matchPattern(grid: (ItemType | null)[][], pattern: (ItemType | null)[][], gridSize: number): boolean {
  const ph = pattern.length;
  const pw = pattern[0].length;

  for (let ro = 0; ro <= gridSize - ph; ro++) {
    for (let co = 0; co <= gridSize - pw; co++) {
      let match = true;
      for (let r = 0; r < ph && match; r++) {
        for (let c = 0; c < pw && match; c++) {
          if (grid[ro + r][co + c] !== pattern[r][c]) match = false;
        }
      }
      if (match) {
        let allEmpty = true;
        for (let r = 0; r < gridSize; r++) {
          for (let c = 0; c < gridSize; c++) {
            const inP = r >= ro && r < ro + ph && c >= co && c < co + pw;
            if (!inP && grid[r][c] !== null) allEmpty = false;
          }
        }
        if (allEmpty) return true;
      }
    }
  }
  return false;
}
