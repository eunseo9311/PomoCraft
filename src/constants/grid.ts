// Grid System Configuration
export const GRID = {
  COLS: 20,           // 가로 20칸 (5% x 20 = 100%)
  ROWS: 12,           // 세로 12칸 (플레이 가능 영역)
  GROUND_ROWS: 4,     // 땅 영역 (하단 4칸)
  TILE_W: 5,          // 타일 너비 (%)
  TILE_H: 6,          // 타일 높이 (%)
  GROUND_OFFSET: 25,  // 시각적 지면 높이 (%) - 블록이 이 위에 렌더링됨
} as const;

// Grid 좌표 → 화면 퍼센트 변환
export function gridToPercent(col: number, row: number): { x: number; bottom: number } {
  return {
    x: col * GRID.TILE_W + GRID.TILE_W / 2,  // 타일 중앙
    bottom: (GRID.ROWS - 1 - row) * GRID.TILE_H + GRID.GROUND_OFFSET,  // 지면 오프셋 추가
  };
}

// 화면 퍼센트 → Grid 좌표 변환
export function percentToGrid(xPercent: number, bottomPercent: number): { col: number; row: number } {
  const col = Math.floor(xPercent / GRID.TILE_W);
  // 지면 오프셋을 빼고 그리드 좌표 계산
  const adjustedBottom = bottomPercent - GRID.GROUND_OFFSET;
  const row = GRID.ROWS - 1 - Math.floor(adjustedBottom / GRID.TILE_H);

  return {
    col: Math.max(0, Math.min(GRID.COLS - 1, col)),
    row: Math.max(0, Math.min(GRID.ROWS - 1, row)),
  };
}

// 빈 그리드 생성
export function createEmptyGrid(): (import('../types').GridCell | null)[][] {
  return Array.from({ length: GRID.ROWS }, () =>
    Array(GRID.COLS).fill(null)
  );
}

// 그리드 셀 가져오기 (bounds check 포함)
export function getCell(
  grid: (import('../types').GridCell | null)[][],
  col: number,
  row: number
): import('../types').GridCell | null {
  if (col < 0 || col >= GRID.COLS || row < 0 || row >= GRID.ROWS) {
    return null;
  }
  return grid[row]?.[col] ?? null;
}

// 그리드 셀 설정 (새 그리드 반환)
export function setCell(
  grid: (import('../types').GridCell | null)[][],
  col: number,
  row: number,
  cell: import('../types').GridCell | null
): (import('../types').GridCell | null)[][] {
  if (col < 0 || col >= GRID.COLS || row < 0 || row >= GRID.ROWS) {
    return grid;
  }

  const newGrid = grid.map(r => [...r]);
  newGrid[row][col] = cell;
  return newGrid;
}

// 셀이 비어있는지 확인
export function isCellEmpty(
  grid: (import('../types').GridCell | null)[][],
  col: number,
  row: number
): boolean {
  return getCell(grid, col, row) === null;
}

// 아래에 지지대가 있는지 확인 (땅 또는 블록)
export function hasSupport(
  grid: (import('../types').GridCell | null)[][],
  col: number,
  row: number
): boolean {
  // 땅 위 (하단 절반, row 6-11)는 항상 배치 가능
  // 시각적 ground가 25%에 있으므로 충분한 범위 허용
  if (row >= GRID.ROWS / 2) return true;

  // 상단 (row 0-5)은 아래에 블록이 있어야 배치 가능
  return !isCellEmpty(grid, col, row + 1);
}

// 배치 유효성 검사
export function isValidPlacement(
  grid: (import('../types').GridCell | null)[][],
  col: number,
  row: number,
  steveCol: number,
  steveRow: number
): boolean {
  // 범위 체크
  if (col < 0 || col >= GRID.COLS || row < 0 || row >= GRID.ROWS) {
    return false;
  }

  // 이미 블록이 있으면 불가
  if (!isCellEmpty(grid, col, row)) {
    return false;
  }

  // 지지대 확인
  if (!hasSupport(grid, col, row)) {
    return false;
  }

  // Steve 위치와 겹치면 불가 (Steve는 2칸 높이)
  if (col === steveCol && (row === steveRow || row === steveRow - 1)) {
    return false;
  }

  return true;
}
