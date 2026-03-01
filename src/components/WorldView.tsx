import { useRef, useEffect } from 'react';
import { WorldDecoration, DragInfo, TimerMode, InventorySlot, SteveState, SpriteType } from '../types';
import { PixelSprite } from './PixelSprite';

interface WorldViewProps {
  decorations: WorldDecoration[];
  mode: TimerMode;
  isNight: boolean;
  dragInfo: DragInfo | null;
  selectedItem: InventorySlot | null;
  steveState: SteveState;
  onDragStart: (info: DragInfo) => void;
  onDragMove: (deltaXPercent: number, deltaBottomPercent: number) => void;
  onDragEnd: () => void;
  onWorldClick: (xPercent: number, bottomPercent: number) => void;
  onEntityRightClick: (entityId: number) => void;
  onEntityClick: (entityId: number) => void;
}

export function WorldView({
  decorations,
  mode,
  isNight,
  dragInfo,
  selectedItem,
  steveState,
  onDragStart,
  onDragMove,
  onDragEnd,
  onWorldClick,
  onEntityRightClick,
  onEntityClick,
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
            onClick={(e) => {
              e.stopPropagation();
              onEntityClick(deco.id);
            }}
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

      {/* Steve 캐릭터 */}
      <div
        className={`steve-character ${steveState.isRunning ? 'steve-running' : ''} ${steveState.isCrouching ? 'steve-crouching' : ''}`}
        style={{
          position: 'absolute',
          bottom: `calc(22% + ${steveState.y}px)`,
          left: `${steveState.x}%`,
          zIndex: 78,
          pointerEvents: 'none',
          transform: `${steveState.facingRight ? '' : 'scaleX(-1)'} ${steveState.isCrouching ? 'scaleY(0.85) translateY(7px)' : ''}`,
          transition: 'transform 0.1s',
        }}
      >
        {(() => {
          // 스프라이트 선택 로직
          let spriteName: SpriteType = 'steve_stand';
          const animSpeed = steveState.isCrouching ? 6 : 4;

          if (steveState.isJumping) {
            spriteName = 'steve_jump';
          } else if (mode === 'running' && !steveState.isWalking) {
            // 타이머가 돌아가는 중이면 채굴 애니메이션
            return (
              <div className="anim-steve-wrapper">
                <PixelSprite name="steve_mine_1" size={96} className="frame-1" />
                <PixelSprite name="steve_mine_2" size={96} className="frame-2" />
              </div>
            );
          } else if (steveState.isWalking) {
            // 걷기 애니메이션 (3프레임 순환)
            const walkFrameIndex = Math.floor(steveState.walkFrame / animSpeed) % 3;
            const walkSprites: SpriteType[] = ['steve_walk_1', 'steve_walk_2', 'steve_walk_3'];
            spriteName = walkSprites[walkFrameIndex];
          }

          return <PixelSprite name={spriteName} size={96} />;
        })()}
      </div>
    </div>
  );
}
