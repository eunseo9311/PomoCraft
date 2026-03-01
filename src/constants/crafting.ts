import { ItemType, InventorySlot } from '../types';

export interface Recipe {
  pattern: (ItemType | null)[][];
  result: { type: ItemType; count: number };
}

// 2x2 Crafting Recipes
export const RECIPES_2X2: Recipe[] = [
  // Oak Plank from Oak Log
  { pattern: [['oak_log']], result: { type: 'oak_plank', count: 4 } },

  // Stick from Planks
  { pattern: [['oak_plank'], ['oak_plank']], result: { type: 'stick', count: 4 } },

  // Crafting Table
  { pattern: [['oak_plank', 'oak_plank'], ['oak_plank', 'oak_plank']], result: { type: 'crafting_table', count: 1 } },

  // Torch
  { pattern: [['coal'], ['stick']], result: { type: 'torch', count: 4 } },

  // White Wool
  { pattern: [['string', 'string'], ['string', 'string']], result: { type: 'white_wool', count: 1 } },

  // Sandstone
  { pattern: [['sand', 'sand'], ['sand', 'sand']], result: { type: 'sandstone', count: 1 } },

  // Snow Block
  { pattern: [['snow', 'snow'], ['snow', 'snow']], result: { type: 'snow', count: 1 } },

  // Clay Block
  { pattern: [['clay_ball', 'clay_ball'], ['clay_ball', 'clay_ball']], result: { type: 'clay', count: 1 } },

  // Glowstone Block
  { pattern: [['redstone', 'redstone'], ['redstone', 'redstone']], result: { type: 'glowstone', count: 1 } },

  // Block of Quartz
  { pattern: [['nether_quartz', 'nether_quartz'], ['nether_quartz', 'nether_quartz']], result: { type: 'quartz_block', count: 1 } },

  // Flint and Steel
  { pattern: [['iron_ingot', null], [null, 'flint']], result: { type: 'flint_and_steel', count: 1 } },
];

// 3x3 Crafting Recipes
export const RECIPES_3X3: Recipe[] = [
  // === TOOLS ===
  // Wooden Tools
  { pattern: [['oak_plank', 'oak_plank', 'oak_plank'], [null, 'stick', null], [null, 'stick', null]], result: { type: 'wooden_pickaxe', count: 1 } },
  { pattern: [['oak_plank', 'oak_plank'], ['oak_plank', 'stick'], [null, 'stick']], result: { type: 'wooden_axe', count: 1 } },
  { pattern: [['oak_plank'], ['stick'], ['stick']], result: { type: 'wooden_shovel', count: 1 } },
  { pattern: [['oak_plank', 'oak_plank'], [null, 'stick'], [null, 'stick']], result: { type: 'wooden_hoe', count: 1 } },
  { pattern: [['oak_plank'], ['oak_plank'], ['stick']], result: { type: 'wooden_sword', count: 1 } },

  // Stone Tools
  { pattern: [['cobblestone', 'cobblestone', 'cobblestone'], [null, 'stick', null], [null, 'stick', null]], result: { type: 'stone_pickaxe', count: 1 } },
  { pattern: [['cobblestone', 'cobblestone'], ['cobblestone', 'stick'], [null, 'stick']], result: { type: 'stone_axe', count: 1 } },
  { pattern: [['cobblestone'], ['stick'], ['stick']], result: { type: 'stone_shovel', count: 1 } },
  { pattern: [['cobblestone', 'cobblestone'], [null, 'stick'], [null, 'stick']], result: { type: 'stone_hoe', count: 1 } },
  { pattern: [['cobblestone'], ['cobblestone'], ['stick']], result: { type: 'stone_sword', count: 1 } },

  // Iron Tools
  { pattern: [['iron_ingot', 'iron_ingot', 'iron_ingot'], [null, 'stick', null], [null, 'stick', null]], result: { type: 'iron_pickaxe', count: 1 } },
  { pattern: [['iron_ingot', 'iron_ingot'], ['iron_ingot', 'stick'], [null, 'stick']], result: { type: 'iron_axe', count: 1 } },
  { pattern: [['iron_ingot'], ['stick'], ['stick']], result: { type: 'iron_shovel', count: 1 } },
  { pattern: [['iron_ingot', 'iron_ingot'], [null, 'stick'], [null, 'stick']], result: { type: 'iron_hoe', count: 1 } },
  { pattern: [['iron_ingot'], ['iron_ingot'], ['stick']], result: { type: 'iron_sword', count: 1 } },

  // Gold Tools
  { pattern: [['gold_ingot', 'gold_ingot', 'gold_ingot'], [null, 'stick', null], [null, 'stick', null]], result: { type: 'gold_pickaxe', count: 1 } },
  { pattern: [['gold_ingot', 'gold_ingot'], ['gold_ingot', 'stick'], [null, 'stick']], result: { type: 'gold_axe', count: 1 } },
  { pattern: [['gold_ingot'], ['stick'], ['stick']], result: { type: 'gold_shovel', count: 1 } },
  { pattern: [['gold_ingot', 'gold_ingot'], [null, 'stick'], [null, 'stick']], result: { type: 'gold_hoe', count: 1 } },
  { pattern: [['gold_ingot'], ['gold_ingot'], ['stick']], result: { type: 'gold_sword', count: 1 } },

  // Diamond Tools
  { pattern: [['diamond', 'diamond', 'diamond'], [null, 'stick', null], [null, 'stick', null]], result: { type: 'diamond_pickaxe', count: 1 } },
  { pattern: [['diamond', 'diamond'], ['diamond', 'stick'], [null, 'stick']], result: { type: 'diamond_axe', count: 1 } },
  { pattern: [['diamond'], ['stick'], ['stick']], result: { type: 'diamond_shovel', count: 1 } },
  { pattern: [['diamond', 'diamond'], [null, 'stick'], [null, 'stick']], result: { type: 'diamond_hoe', count: 1 } },
  { pattern: [['diamond'], ['diamond'], ['stick']], result: { type: 'diamond_sword', count: 1 } },

  // === ARMOR ===
  // Leather Armor
  { pattern: [['leather', 'leather', 'leather'], ['leather', null, 'leather']], result: { type: 'leather_helmet', count: 1 } },
  { pattern: [['leather', null, 'leather'], ['leather', 'leather', 'leather'], ['leather', 'leather', 'leather']], result: { type: 'leather_chestplate', count: 1 } },
  { pattern: [['leather', 'leather', 'leather'], ['leather', null, 'leather'], ['leather', null, 'leather']], result: { type: 'leather_leggings', count: 1 } },
  { pattern: [['leather', null, 'leather'], ['leather', null, 'leather']], result: { type: 'leather_boots', count: 1 } },

  // Iron Armor
  { pattern: [['iron_ingot', 'iron_ingot', 'iron_ingot'], ['iron_ingot', null, 'iron_ingot']], result: { type: 'iron_helmet', count: 1 } },
  { pattern: [['iron_ingot', null, 'iron_ingot'], ['iron_ingot', 'iron_ingot', 'iron_ingot'], ['iron_ingot', 'iron_ingot', 'iron_ingot']], result: { type: 'iron_chestplate', count: 1 } },
  { pattern: [['iron_ingot', 'iron_ingot', 'iron_ingot'], ['iron_ingot', null, 'iron_ingot'], ['iron_ingot', null, 'iron_ingot']], result: { type: 'iron_leggings', count: 1 } },
  { pattern: [['iron_ingot', null, 'iron_ingot'], ['iron_ingot', null, 'iron_ingot']], result: { type: 'iron_boots', count: 1 } },

  // Gold Armor
  { pattern: [['gold_ingot', 'gold_ingot', 'gold_ingot'], ['gold_ingot', null, 'gold_ingot']], result: { type: 'gold_helmet', count: 1 } },
  { pattern: [['gold_ingot', null, 'gold_ingot'], ['gold_ingot', 'gold_ingot', 'gold_ingot'], ['gold_ingot', 'gold_ingot', 'gold_ingot']], result: { type: 'gold_chestplate', count: 1 } },
  { pattern: [['gold_ingot', 'gold_ingot', 'gold_ingot'], ['gold_ingot', null, 'gold_ingot'], ['gold_ingot', null, 'gold_ingot']], result: { type: 'gold_leggings', count: 1 } },
  { pattern: [['gold_ingot', null, 'gold_ingot'], ['gold_ingot', null, 'gold_ingot']], result: { type: 'gold_boots', count: 1 } },

  // Diamond Armor
  { pattern: [['diamond', 'diamond', 'diamond'], ['diamond', null, 'diamond']], result: { type: 'diamond_helmet', count: 1 } },
  { pattern: [['diamond', null, 'diamond'], ['diamond', 'diamond', 'diamond'], ['diamond', 'diamond', 'diamond']], result: { type: 'diamond_chestplate', count: 1 } },
  { pattern: [['diamond', 'diamond', 'diamond'], ['diamond', null, 'diamond'], ['diamond', null, 'diamond']], result: { type: 'diamond_leggings', count: 1 } },
  { pattern: [['diamond', null, 'diamond'], ['diamond', null, 'diamond']], result: { type: 'diamond_boots', count: 1 } },

  // === BLOCKS ===
  // Storage Blocks
  { pattern: [['iron_ingot', 'iron_ingot', 'iron_ingot'], ['iron_ingot', 'iron_ingot', 'iron_ingot'], ['iron_ingot', 'iron_ingot', 'iron_ingot']], result: { type: 'iron_block', count: 1 } },
  { pattern: [['gold_ingot', 'gold_ingot', 'gold_ingot'], ['gold_ingot', 'gold_ingot', 'gold_ingot'], ['gold_ingot', 'gold_ingot', 'gold_ingot']], result: { type: 'gold_block', count: 1 } },
  { pattern: [['diamond', 'diamond', 'diamond'], ['diamond', 'diamond', 'diamond'], ['diamond', 'diamond', 'diamond']], result: { type: 'diamond_block', count: 1 } },
  { pattern: [['emerald', 'emerald', 'emerald'], ['emerald', 'emerald', 'emerald'], ['emerald', 'emerald', 'emerald']], result: { type: 'emerald_block', count: 1 } },
  { pattern: [['coal', 'coal', 'coal'], ['coal', 'coal', 'coal'], ['coal', 'coal', 'coal']], result: { type: 'coal_ore', count: 1 } },
  { pattern: [['redstone', 'redstone', 'redstone'], ['redstone', 'redstone', 'redstone'], ['redstone', 'redstone', 'redstone']], result: { type: 'redstone_block', count: 1 } },

  // Functional Blocks
  { pattern: [['cobblestone', 'cobblestone', 'cobblestone'], ['cobblestone', null, 'cobblestone'], ['cobblestone', 'cobblestone', 'cobblestone']], result: { type: 'furnace', count: 1 } },
  { pattern: [['oak_plank', 'oak_plank', 'oak_plank'], ['oak_plank', null, 'oak_plank'], ['oak_plank', 'oak_plank', 'oak_plank']], result: { type: 'chest', count: 1 } },
  { pattern: [['oak_plank', 'oak_plank', 'oak_plank'], ['book', 'book', 'book'], ['oak_plank', 'oak_plank', 'oak_plank']], result: { type: 'bookshelf', count: 1 } },

  // === FOOD ===
  { pattern: [['wheat', 'wheat', 'wheat']], result: { type: 'bread', count: 1 } },
  { pattern: [['milk_bucket', 'milk_bucket', 'milk_bucket'], ['sugar', 'egg', 'sugar'], ['wheat', 'wheat', 'wheat']], result: { type: 'cake', count: 1 } },
  { pattern: [['wheat', 'brown_dye', 'wheat']], result: { type: 'cookie', count: 8 } },
  { pattern: [['gold_nugget', 'gold_nugget', 'gold_nugget'], ['gold_nugget', 'apple', 'gold_nugget'], ['gold_nugget', 'gold_nugget', 'gold_nugget']], result: { type: 'golden_apple', count: 1 } },
  { pattern: [['bowl'], ['brown_mushroom'], ['red_mushroom']], result: { type: 'mushroom_stew', count: 1 } },

  // === MISC ===
  // Bow
  { pattern: [[null, 'stick', 'string'], ['stick', null, 'string'], [null, 'stick', 'string']], result: { type: 'bow', count: 1 } },

  // Arrow
  { pattern: [['flint'], ['stick'], ['feather']], result: { type: 'arrow', count: 4 } },

  // Fishing Rod
  { pattern: [[null, null, 'stick'], [null, 'stick', 'string'], ['stick', null, 'string']], result: { type: 'fishing_rod', count: 1 } },

  // Bucket
  { pattern: [['iron_ingot', null, 'iron_ingot'], [null, 'iron_ingot', null]], result: { type: 'bucket', count: 1 } },

  // Bowl
  { pattern: [['oak_plank', null, 'oak_plank'], [null, 'oak_plank', null]], result: { type: 'bowl', count: 4 } },

  // Ladder
  { pattern: [['stick', null, 'stick'], ['stick', 'stick', 'stick'], ['stick', null, 'stick']], result: { type: 'ladder', count: 3 } },

  // Door
  { pattern: [['oak_plank', 'oak_plank'], ['oak_plank', 'oak_plank'], ['oak_plank', 'oak_plank']], result: { type: 'door', count: 3 } },

  // Iron Door
  { pattern: [['iron_ingot', 'iron_ingot'], ['iron_ingot', 'iron_ingot'], ['iron_ingot', 'iron_ingot']], result: { type: 'iron_door', count: 3 } },

  // Sign
  { pattern: [['oak_plank', 'oak_plank', 'oak_plank'], ['oak_plank', 'oak_plank', 'oak_plank'], [null, 'stick', null]], result: { type: 'sign', count: 3 } },

  // Bed
  { pattern: [['white_wool', 'white_wool', 'white_wool'], ['oak_plank', 'oak_plank', 'oak_plank']], result: { type: 'bed', count: 1 } },

  // Boat
  { pattern: [['oak_plank', null, 'oak_plank'], ['oak_plank', 'oak_plank', 'oak_plank']], result: { type: 'boat', count: 1 } },

  // Minecart
  { pattern: [['iron_ingot', null, 'iron_ingot'], ['iron_ingot', 'iron_ingot', 'iron_ingot']], result: { type: 'minecart', count: 1 } },

  // Rail
  { pattern: [['iron_ingot', null, 'iron_ingot'], ['iron_ingot', 'stick', 'iron_ingot'], ['iron_ingot', null, 'iron_ingot']], result: { type: 'rail', count: 16 } },

  // TNT
  { pattern: [['gunpowder', 'sand', 'gunpowder'], ['sand', 'gunpowder', 'sand'], ['gunpowder', 'sand', 'gunpowder']], result: { type: 'tnt', count: 1 } },

  // Painting
  { pattern: [['stick', 'stick', 'stick'], ['stick', 'white_wool', 'stick'], ['stick', 'stick', 'stick']], result: { type: 'painting', count: 1 } },

  // Paper
  { pattern: [['seeds', 'seeds', 'seeds']], result: { type: 'paper', count: 3 } },

  // Book
  { pattern: [['paper'], ['paper'], ['paper']], result: { type: 'book', count: 1 } },

  // Compass
  { pattern: [[null, 'iron_ingot', null], ['iron_ingot', 'redstone', 'iron_ingot'], [null, 'iron_ingot', null]], result: { type: 'compass', count: 1 } },

  // Clock
  { pattern: [[null, 'gold_ingot', null], ['gold_ingot', 'redstone', 'gold_ingot'], [null, 'gold_ingot', null]], result: { type: 'clock', count: 1 } },

  // Map
  { pattern: [['paper', 'paper', 'paper'], ['paper', 'compass', 'paper'], ['paper', 'paper', 'paper']], result: { type: 'map', count: 1 } },

  // Shears
  { pattern: [[null, 'iron_ingot'], ['iron_ingot', null]], result: { type: 'shears', count: 1 } },

  // Glass Bottle
  { pattern: [['glass', null, 'glass'], [null, 'glass', null]], result: { type: 'glass_bottle', count: 3 } },
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
  const pw = pattern[0]?.length || 0;
  if (ph === 0 || pw === 0) return false;

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
