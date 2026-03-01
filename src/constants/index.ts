import { InventorySlot, PlayerInventory } from '../types';

export { PALETTE } from './palette';
export { SPRITES_DATA } from './sprites';
export { ITEMS, getItemImageUrl, getItemName, getMaxStack } from './items';
export type { ItemData } from './items';
export { RECIPES_2X2, RECIPES_3X3, matchRecipe } from './crafting';
export type { Recipe } from './crafting';

// 빈 슬롯
export const EMPTY_SLOT: InventorySlot = { type: null, count: 0 };

// 기본 플레이어 인벤토리 (36슬롯)
export const createEmptyInventory = (): PlayerInventory => ({
  slots: Array(36).fill(null).map(() => ({ ...EMPTY_SLOT })),
  hotbar: 0
});

// 초기 인벤토리
export const createTestInventory = (): PlayerInventory => {
  return createEmptyInventory();
};

export const STORAGE_KEY = 'pomocraft_world_data';
export const INVENTORY_STORAGE_KEY = 'pomocraft_inventory';
