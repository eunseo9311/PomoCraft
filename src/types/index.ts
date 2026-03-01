export type TimerMode = 'idle' | 'running' | 'paused' | 'done';

// 기존 엔티티 (몹/장식)
export type EntityType = 'flower' | 'tree' | 'dog' | 'cat' | 'horse' | 'zombie' | 'skeleton' | 'creeper' | 'stone_block';

// 자원 아이템
export type ResourceType = 'wood' | 'stone' | 'plank' | 'stick' | 'cobblestone';

// 설치 가능한 아이템
export type PlaceableType = 'crafting_table' | 'furnace' | 'chest';

// 모든 아이템 타입
export type ItemType = EntityType | ResourceType | PlaceableType;

export type SpriteType = ItemType | 'steve_stand' | 'steve_mine_1' | 'steve_mine_2' | 'steve_walk_1' | 'steve_walk_2' | 'steve_walk_3' | 'steve_jump';

// Steve 상태
export interface SteveState {
  x: number;           // X 위치 (%)
  y: number;           // Y 위치 (점프용, 0 = 땅)
  velocityY: number;   // Y 속도 (점프/낙하)
  facingRight: boolean; // 오른쪽 보기
  isWalking: boolean;  // 걷는 중
  isRunning: boolean;  // 달리는 중
  isJumping: boolean;  // 점프 중
  walkFrame: number;   // 걷기 애니메이션 프레임
}

// 인벤토리 슬롯
export interface InventorySlot {
  type: ItemType | null;
  count: number;
}

// 기존 인벤토리 (호환성)
export interface Inventory {
  flower: number;
  tree: number;
  dog: number;
  cat: number;
  horse: number;
  zombie: number;
  skeleton: number;
  creeper: number;
  stone_block: number;
}

// 새로운 인벤토리 시스템 (슬롯 기반)
export interface PlayerInventory {
  slots: InventorySlot[];  // 36슬롯 (9x4)
  hotbar: number;          // 현재 선택된 핫바 슬롯 (0-8)
}

// 들고 있는 아이템
export interface HeldItem {
  type: ItemType;
  count: number;
  sourceSlot: number;  // 원래 슬롯 인덱스
}

export interface WorldDecoration {
  id: number;
  type: ItemType;  // EntityType | PlaceableType 모두 가능
  x: number;
  bottom: number;
  size: number;
  flip: boolean;
}

export interface Toast {
  id: number;
  title: string;
  desc: string;
  icon: SpriteType;
  titleColor: string;
}

export interface DragInfo {
  id: number;
  startX: number;
  startY: number;
  initX: number;
  initBottom: number;
}

export interface SaveData {
  inv: Inventory;
  decos: WorldDecoration[];
}
