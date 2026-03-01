import { EntityType, Inventory, ItemType, InventorySlot, PlayerInventory } from '../types';

export { PALETTE } from './palette';
export { SPRITES_DATA } from './sprites';

export const ENTITY_NAMES: Record<EntityType, string> = {
  flower: '꽃',
  tree: '나무',
  dog: '강아지',
  cat: '고양이',
  horse: '말',
  zombie: '좀비',
  skeleton: '스켈레톤',
  creeper: '크리퍼',
  stone_block: '돌 블록'
};

// 모든 아이템 이름
export const ITEM_NAMES: Partial<Record<ItemType, string>> = {
  // 엔티티
  flower: '꽃',
  tree: '나무',
  dog: '강아지',
  cat: '고양이',
  horse: '말',
  zombie: '좀비',
  skeleton: '스켈레톤',
  creeper: '크리퍼',
  stone_block: '돌 블록',
  // 자원
  wood: '원목',
  plank: '나무 판자',
  stick: '막대기',
  stone: '돌',
  cobblestone: '조약돌',
  // 설치물
  crafting_table: '제작대',
  furnace: '화로',
  chest: '상자'
};

// 최대 스택 수
export const MAX_STACK: Partial<Record<ItemType, number>> = {
  wood: 64,
  plank: 64,
  stick: 64,
  stone: 64,
  cobblestone: 64,
  crafting_table: 64,
  furnace: 64,
  chest: 64,
  // 몹은 1개만
  dog: 1,
  cat: 1,
  horse: 1,
  zombie: 1,
  skeleton: 1,
  creeper: 1,
  flower: 64,
  tree: 64
};

export const DEFAULT_INVENTORY: Inventory = {
  flower: 0,
  tree: 0,
  dog: 0,
  cat: 0,
  horse: 0,
  zombie: 0,
  skeleton: 0,
  creeper: 0,
  stone_block: 0
};

// 빈 슬롯
export const EMPTY_SLOT: InventorySlot = { type: null, count: 0 };

// 기본 플레이어 인벤토리 (36슬롯)
export const createEmptyInventory = (): PlayerInventory => ({
  slots: Array(36).fill(null).map(() => ({ ...EMPTY_SLOT })),
  hotbar: 0
});

// 테스트용 초기 인벤토리
export const createTestInventory = (): PlayerInventory => {
  const inv = createEmptyInventory();
  inv.slots[0] = { type: 'wood', count: 10 };
  inv.slots[1] = { type: 'plank', count: 8 };
  inv.slots[2] = { type: 'stick', count: 16 };
  inv.slots[3] = { type: 'cobblestone', count: 32 };
  inv.slots[4] = { type: 'crafting_table', count: 1 };
  return inv;
};

export const STORAGE_KEY = 'pomocraft_world_data';
export const INVENTORY_STORAGE_KEY = 'pomocraft_inventory';
