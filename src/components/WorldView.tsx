import { useRef, useEffect } from 'react';
import { WorldDecoration, DragInfo, TimerMode, InventorySlot } from '../types';
import { PixelSprite } from './PixelSprite';

interface WorldViewProps {
  decorations: WorldDecoration[];
  mode: TimerMode;
  isNight: boolean;
  dragInfo: DragInfo | null;
  selectedItem: InventorySlot | null;
  onDragStart: (info: DragInfo) => void;
  onDragMove: (deltaXPercent: number, deltaBottomPercent: number) => void;
  onDragEnd: () => void;
  onWorldClick: (xPercent: number, bottomPercent: number) => void;
  onEntityRightClick: (entityId: number) => void;
}

export function WorldView({
  decorations,
  mode,
  isNight,
  dragInfo,
  selectedItem,
  onDragStart,
  onDragMove,
  onDragEnd,
  onWorldClick,
  onEntityRightClick,
}: WorldViewProps) {
  const worldRef = useRef<HTMLDivElement>(null);

  // 월드 클릭으로 아이템 배치
  const handleWorldClick = (e: React.MouseEvent) => {
    if (!worldRef.current || !selectedItem?.type) return;

    const rect = worldRef.current.getBoundingClientRect();
    const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
    const yFromTop = ((e.clientY - rect.top) / rect.height) * 100;
    const bottomPercent = 100 - yFromTop;

    // 땅 위에만 배치 가능 (bottom 5% ~ 30%)
    if (bottomPercent >= 5 && bottomPercent <= 35) {
      onWorldClick(xPercent, bottomPercent);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragInfo || !worldRef.current) return;
      const rect = worldRef.current.getBoundingClientRect();
      const deltaX = e.clientX - dragInfo.startX;
      const deltaY = e.clientY - dragInfo.startY;

      const deltaXPercent = (deltaX / rect.width) * 100;
      const deltaBottomPercent = -(deltaY / rect.height) * 100;

      onDragMove(deltaXPercent, deltaBottomPercent);
    };

    const handleMouseUp = () => onDragEnd();

    if (dragInfo) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragInfo, onDragMove, onDragEnd]);

  const skyClass = isNight ? 'sky-night' : 'sky-day';
  const celestialClass = isNight ? 'moon' : 'sun';
  const cloudPaused = mode !== 'running' ? 'paused-anim' : '';

  // 커서 스타일 (아이템 들고 있으면 crosshair)
  const cursorStyle = selectedItem?.type ? 'crosshair' : 'default';

  return (
    <div
      className={`world-view ${skyClass}`}
      ref={worldRef}
      onClick={handleWorldClick}
      style={{ cursor: cursorStyle }}
    >
      <div className={`celestial ${celestialClass}`}></div>
      <div
        className={`mc-cloud ${cloudPaused}`}
        style={{ top: '15%', width: '120px', height: '40px', animationDuration: '30s' }}
      ></div>
      <div
        className={`mc-cloud ${cloudPaused}`}
        style={{
          top: '30%',
          width: '200px',
          height: '60px',
          animationDuration: '45s',
          animationDelay: '-15s',
        }}
      ></div>

      <div className="ground"></div>

      {[...decorations]
        .sort((a, b) => b.bottom - a.bottom)
        .map((deco) => (
          <div
            key={deco.id}
            className="entity"
            onMouseDown={(e) => {
              e.stopPropagation();
              onDragStart({
                id: deco.id,
                startX: e.clientX,
                startY: e.clientY,
                initX: deco.x,
                initBottom: deco.bottom,
              });
            }}
            onClick={(e) => e.stopPropagation()}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEntityRightClick(deco.id);
            }}
            style={{
              left: `${deco.x}%`,
              bottom: `${deco.bottom}%`,
              transform: deco.flip ? 'scaleX(-1)' : 'none',
              zIndex: dragInfo?.id === deco.id ? 999 : Math.round(100 - deco.bottom),
            }}
          >
            <PixelSprite name={deco.type} size={deco.size} />
          </div>
        ))}

      <div
        style={{
          position: 'absolute',
          bottom: '22%',
          left: '45%',
          zIndex: 78,
          pointerEvents: 'none',
        }}
      >
        {mode === 'running' ? (
          <div className="anim-steve-wrapper">
            <PixelSprite name="steve_mine_1" size={96} className="frame-1" />
            <PixelSprite name="steve_mine_2" size={96} className="frame-2" />
          </div>
        ) : (
          <PixelSprite name="steve_stand" size={96} />
        )}
      </div>
    </div>
  );
}
