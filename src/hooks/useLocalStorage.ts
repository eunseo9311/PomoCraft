import { useState, useEffect } from 'react';
import { WorldDecoration } from '../types';
import { STORAGE_KEY } from '../constants';

export function useLocalStorage() {
  const [worldDecorations, setWorldDecorations] = useState<WorldDecoration[]>([]);

  // Load data on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.decos) setWorldDecorations(data.decos);
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  // Save data on changes
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ decos: worldDecorations })
    );
  }, [worldDecorations]);

  const clearData = () => {
    setWorldDecorations([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    worldDecorations,
    setWorldDecorations,
    clearData,
  };
}
