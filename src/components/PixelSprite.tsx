import { PALETTE, SPRITES_DATA } from '../constants';
import { SpriteType } from '../types';

interface PixelSpriteProps {
  name: SpriteType;
  size?: number;
  className?: string;
}

export function PixelSprite({ name, size = 32, className = '' }: PixelSpriteProps) {
  const data = SPRITES_DATA[name];
  if (!data) return null;

  const width = data[0].length;
  const height = data.length;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={size}
      height={(size / width) * height}
      className={`pixel-sprite ${className}`}
      style={{ shapeRendering: 'crispEdges' }}
    >
      {data.map((row, y) =>
        row.split('').map((char, x) => {
          if (char === '.') return null;
          return (
            <rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width="1"
              height="1"
              fill={PALETTE[char]}
            />
          );
        })
      )}
    </svg>
  );
}
