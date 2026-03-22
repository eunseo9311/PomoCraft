import { getItemImageUrl, ITEMS } from '../constants';
import { ItemType } from '../types';

interface ItemSpriteProps {
  itemId: ItemType;
  size?: number;
  className?: string;
}

// ITEMS에 없는 아이템도 텍스처 경로를 추정
function resolveImageUrl(itemId: string): string {
  // ITEMS에 등록된 아이템이면 그대로 사용
  const url = getItemImageUrl(itemId);
  if (url) return url;

  // 등록 안 된 아이템은 blocks/ 와 items/ 폴더에서 찾기 시도
  return `/textures/blocks/${itemId}.png`;
}

export function ItemSprite({ itemId, size = 32, className = '' }: ItemSpriteProps) {
  const imageUrl = resolveImageUrl(itemId);

  // size=0 means fill parent container
  const sizeStyle = size === 0
    ? { width: '100%', height: '100%' }
    : { width: size, height: size };

  return (
    <img
      src={imageUrl}
      alt={ITEMS[itemId]?.name || itemId}
      className={`item-sprite ${className}`}
      style={{
        ...sizeStyle,
        imageRendering: 'pixelated',
        objectFit: 'fill',
      }}
      draggable={false}
      onError={(e) => {
        // blocks/에서 못 찾으면 items/로 시도
        const target = e.currentTarget;
        if (target.src.includes('/blocks/')) {
          target.src = `/textures/items/${itemId}.png`;
        }
      }}
    />
  );
}
