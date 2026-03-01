import { useEffect, useState } from 'react';
import { HeldItem } from '../types';
import { ItemSprite } from './ItemSprite';

interface HeldItemCursorProps {
  heldItem: HeldItem | null;
}

export function HeldItemCursor({ heldItem }: HeldItemCursorProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  if (!heldItem) return null;

  return (
    <div
      className="held-item-cursor"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      <ItemSprite itemId={heldItem.type} size={32} />
      {heldItem.count > 1 && (
        <span className="held-item-count">{heldItem.count}</span>
      )}
    </div>
  );
}
