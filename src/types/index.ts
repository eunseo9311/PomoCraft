export type TimerMode = 'idle' | 'running' | 'paused' | 'done';

// 아이템 타입 (오픈소스에서 추가 예정)
export type ItemType = string;

// 스프라이트 타입
export type SpriteType = string;

// Steve 상태
export interface SteveState {
  x: number;           // X 위치 (%)
  y: number;           // Y 위치 (점프용, 0 = 땅)
  velocityY: number;   // Y 속도 (점프/낙하)
  facingRight: boolean; // 오른쪽 보기
  isWalking: boolean;  // 걷는 중
  isRunning: boolean;  // 달리는 중
  isJumping: boolean;  // 점프 중
  isCrouching: boolean; // 웅크리기 중
  walkFrame: number;   // 걷기 애니메이션 프레임
}

// 인벤토리 슬롯
export interface InventorySlot {
  type: ItemType | null;
  count: number;
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

// 레거시: 자유 배치 (마이그레이션용)
export interface WorldDecoration {
  id: number;
  type: ItemType;
  x: number;
  bottom: number;
  size: number;
  flip: boolean;
  spawnedAt?: number;   // 생성 시간 (자원 블록 디스폰용)
  isResource?: boolean; // 자원 블록 여부
}

// Grid 시스템: 셀 데이터
export interface GridCell {
  type: ItemType;
  placedAt?: number;    // 배치 시간 (자원 디스폰용)
  isResource?: boolean; // 자원 블록 여부
}

// Grid 시스템: 2D 월드 배열
export type WorldGrid = (GridCell | null)[][];

// Ghost Block: 배치 미리보기
export interface GhostBlock {
  col: number;
  row: number;
  type: ItemType;
  isValid: boolean;
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

// 드롭된 아이템 (바닥에 떠있는 상태)
export interface DroppedItem {
  id: number;
  type: ItemType;
  x: number;      // X 위치 (%)
  y: number;      // 지면으로부터 높이 (%)
}

// 채굴 진행 상태
export interface MiningState {
  col: number;
  row: number;
  progress: number;   // 0~100%
  startTime: number;
}
