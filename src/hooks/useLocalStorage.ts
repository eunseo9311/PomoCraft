import { useState, useEffect } from 'react';
import { Inventory, WorldDecoration, SaveData } from '../types';
import { DEFAULT_INVENTORY, STORAGE_KEY } from '../constants';

export function useLocalStorage() {
  const [inventory, setInventory] = useState<Inventory>(DEFAULT_INVENTORY);
  const [worldDecorations, setWorldDecorations] = useState<WorldDecoration[]>([]);

  // Load data on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const { inv, decos }: SaveData = JSON.parse(saved);
        if (inv) setInventory({ ...DEFAULT_INVENTORY, ...inv });
        if (decos) setWorldDecorations(decos);
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  // Save data on changes
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ inv: inventory, decos: worldDecorations })
    );
  }, [inventory, worldDecorations]);

  const clearData = () => {
    setInventory(DEFAULT_INVENTORY);
    setWorldDecorations([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    inventory,
    setInventory,
    worldDecorations,
    setWorldDecorations,
    clearData,
  };
}
