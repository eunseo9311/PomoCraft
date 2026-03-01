import { useState, useEffect } from 'react';
import { WorldDecoration, WorldGrid, GridCell } from '../types';
import { STORAGE_KEY } from '../constants';
import { GRID, createEmptyGrid, percentToGrid } from '../constants/grid';

const GRID_VERSION_KEY = 'pomocraft_grid_version';
const CURRENT_VERSION = 1;

// 레거시 데이터를 Grid로 마이그레이션
function migrateDecorations(decos: WorldDecoration[]): WorldGrid {
  const grid = createEmptyGrid();

  for (const deco of decos) {
    const { col, row } = percentToGrid(deco.x, deco.bottom);

    // 범위 체크 & 빈 셀인지 확인
    if (col >= 0 && col < GRID.COLS && row >= 0 && row < GRID.ROWS) {
      if (grid[row][col] === null) {
        grid[row][col] = {
          type: deco.type,
          placedAt: deco.spawnedAt,
          isResource: deco.isResource,
        };
      }
    }
  }

  return grid;
}

export function useLocalStorage() {
  const [worldGrid, setWorldGrid] = useState<WorldGrid>(() => createEmptyGrid());

  // Load data on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const version = localStorage.getItem(GRID_VERSION_KEY);

    if (saved) {
      try {
        const data = JSON.parse(saved);

        if (version && parseInt(version) >= CURRENT_VERSION && data.grid) {
          // 이미 Grid 형식
          setWorldGrid(data.grid);
        } else if (data.decos) {
          // 레거시 형식 → 마이그레이션
          const migrated = migrateDecorations(data.decos);
          setWorldGrid(migrated);
          console.log('Migrated legacy decorations to grid format');
        }
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  // Save data on changes
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ grid: worldGrid })
    );
    localStorage.setItem(GRID_VERSION_KEY, String(CURRENT_VERSION));
  }, [worldGrid]);

  const clearData = () => {
    setWorldGrid(createEmptyGrid());
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(GRID_VERSION_KEY);
  };

  // Grid 셀 업데이트 헬퍼
  const updateCell = (col: number, row: number, cell: GridCell | null) => {
    if (col < 0 || col >= GRID.COLS || row < 0 || row >= GRID.ROWS) return;

    setWorldGrid(prev => {
      const newGrid = prev.map(r => [...r]);
      newGrid[row][col] = cell;
      return newGrid;
    });
  };

  // Grid 셀 가져오기
  const getCell = (col: number, row: number): GridCell | null => {
    if (col < 0 || col >= GRID.COLS || row < 0 || row >= GRID.ROWS) return null;
    return worldGrid[row]?.[col] ?? null;
  };

  return {
    worldGrid,
    setWorldGrid,
    updateCell,
    getCell,
    clearData,
  };
}
