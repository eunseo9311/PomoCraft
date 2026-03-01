import { getItemImageUrl, ITEMS } from '../constants';
import { ItemType } from '../types';

interface ItemSpriteProps {
  itemId: ItemType;
  size?: number;
  className?: string;
}

export function ItemSprite({ itemId, size = 32, className = '' }: ItemSpriteProps) {
  const imageUrl = getItemImageUrl(itemId);

  // size=0 means fill parent container
  const sizeStyle = size === 0
    ? { width: '100%', height: '100%' }
    : { width: size, height: size };

  if (!imageUrl || !ITEMS[itemId]) {
    // Fallback: display item ID as text if no image found
    return (
      <div
        className={`item-sprite item-sprite-fallback ${className}`}
        style={{
          ...sizeStyle,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: size === 0 ? 12 : size * 0.3,
          backgroundColor: '#555',
          color: '#fff',
          borderRadius: 2,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
        title={itemId}
      >
        {itemId.slice(0, 3)}
      </div>
    );
  }

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
    />
  );
}
