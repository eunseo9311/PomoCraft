import { useState, useCallback } from 'react';
import { Toast, SpriteType } from '../types';

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    (title: string, desc: string, icon: SpriteType, titleColor: string) => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, title, desc, icon, titleColor }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 5000);
    },
    []
  );

  return { toasts, addToast };
}
