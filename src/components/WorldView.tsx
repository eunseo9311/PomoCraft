import { useRef } from 'react';
import { WorldGrid, GhostBlock, TimerMode, InventorySlot, SteveState, SpriteType, MiningState, DroppedItem } from '../types';
import { GRID, gridToPercent } from '../constants/grid';
import { PixelSprite } from './PixelSprite';
import { ItemSprite } from './ItemSprite';

interface WorldViewProps {
  worldGrid: WorldGrid;
  groundBlocks: (string | null)[][];
  ghostBlock: GhostBlock | null;
  mode: TimerMode;
  isNight: boolean;
  isSunset?: boolean;
  selectedItem: InventorySlot | null;
  steveState: SteveState;
  miningState: MiningState | null;
  droppedItems: DroppedItem[];
  onWorldClick: (xPercent: number, bottomPercent: number) => void;
  onMouseMove: (xPercent: number, bottomPercent: number) => void;
  onMouseLeave: () => void;
  onCellRightClick: (col: number, row: number) => void;
  onCellMouseDown: (col: number, row: number) => void;
  onGroundMouseDown: (col: number, row: number) => void;
  onGroundBlockPlace: (col: number, row: number) => void;
}

export function WorldView({
  worldGrid,
  groundBlocks,
  ghostBlock,
  mode,
  isNight,
  isSunset = false,
  selectedItem,
  steveState,
  miningState,
  droppedItems,
  onWorldClick,
  onMouseMove,
  onMouseLeave,
  onCellRightClick,
  onCellMouseDown,
  onGroundMouseDown,
  onGroundBlockPlace,
}: WorldViewProps) {
  const worldRef = useRef<HTMLDivElement>(null);

  // 좌표 계산 헬퍼
  const getPercentFromEvent = (e: React.MouseEvent) => {
    if (!worldRef.current) return null;
    const rect = worldRef.current.getBoundingClientRect();
    const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
    const yFromTop = ((e.clientY - rect.top) / rect.height) * 100;
    const bottomPercent = 100 - yFromTop;
    return { xPercent, bottomPercent };
  };

  // 월드 클릭으로 아이템 배치
  const handleWorldClick = (e: React.MouseEvent) => {
    const coords = getPercentFromEvent(e);
    if (!coords || !selectedItem?.type) return;

    // 클릭 가능 범위 (그리드 영역: 25%~97%)
    const gridTop = GRID.GROUND_OFFSET + GRID.ROWS * GRID.TILE_H;
    if (coords.bottomPercent >= GRID.GROUND_OFFSET && coords.bottomPercent <= gridTop) {
      onWorldClick(coords.xPercent, coords.bottomPercent);
    }
  };

  // 마우스 이동 (Ghost Block 업데이트)
  const handleMouseMove = (e: React.MouseEvent) => {
    const coords = getPercentFromEvent(e);
    if (!coords) return;
    onMouseMove(coords.xPercent, coords.bottomPercent);
  };

  const skyClass = isNight ? 'sky-night' : isSunset ? 'sky-sunset' : 'sky-day';
  const celestialClass = isNight ? 'moon' : isSunset ? 'sun-sunset' : 'sun';
  const cloudPaused = mode !== 'running' ? 'paused-anim' : '';

  // 별 생성 (고정 위치)
  const stars = [
    { x: 5, y: 10, size: 'small' }, { x: 12, y: 25, size: 'medium' },
    { x: 20, y: 8, size: 'small' }, { x: 28, y: 35, size: 'large' },
    { x: 35, y: 15, size: 'small' }, { x: 42, y: 45, size: 'medium' },
    { x: 48, y: 5, size: 'small' }, { x: 55, y: 30, size: 'small' },
    { x: 62, y: 12, size: 'medium' }, { x: 68, y: 40, size: 'small' },
    { x: 75, y: 20, size: 'large' }, { x: 82, y: 8, size: 'small' },
    { x: 88, y: 32, size: 'medium' }, { x: 95, y: 18, size: 'small' },
    { x: 8, y: 50, size: 'small' }, { x: 18, y: 55, size: 'medium' },
    { x: 32, y: 60, size: 'small' }, { x: 45, y: 52, size: 'small' },
    { x: 58, y: 58, size: 'large' }, { x: 72, y: 48, size: 'small' },
    { x: 85, y: 55, size: 'medium' }, { x: 92, y: 62, size: 'small' },
    { x: 15, y: 42, size: 'small' }, { x: 38, y: 22, size: 'small' },
    { x: 52, y: 38, size: 'small' }, { x: 78, y: 28, size: 'small' },
  ];


  // 커서 스타일 (아이템 들고 있으면 crosshair)
  const cursorStyle = selectedItem?.type ? 'crosshair' : 'default';

  // 채굴 금 단계 계산 (0-5)
  const getMiningCrackLevel = (col: number, row: number): number => {
    if (!miningState || miningState.col !== col || miningState.row !== row) return 0;
    const level = Math.min(5, Math.floor(miningState.progress / 20) + 1);
    return level;
  };

  // Grid 블록 렌더링
  const renderGridBlocks = () => {
    const blocks: JSX.Element[] = [];

    for (let row = 0; row < GRID.ROWS; row++) {
      for (let col = 0; col < GRID.COLS; col++) {
        const cell = worldGrid[row]?.[col];
        if (!cell) continue;

        const pos = gridToPercent(col, row);
        const crackLevel = getMiningCrackLevel(col, row);
        const isMining = crackLevel > 0;

        blocks.push(
          <div
            key={`grid-${row}-${col}`}
            className={`grid-block ${cell.isResource ? 'resource-block' : ''} ${isMining ? 'grid-block-mining' : ''}`}
            onMouseDown={(e) => {
              if (e.button === 0) {
                e.stopPropagation();
                onCellMouseDown(col, row);
              }
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onCellRightClick(col, row);
            }}
            style={{
              left: `${col * GRID.TILE_W}%`,
              bottom: `${pos.bottom}%`,
              width: `${GRID.TILE_W}%`,
              height: `${GRID.TILE_H}%`,
              zIndex: Math.round(100 - pos.bottom),
            }}
          >
            <ItemSprite itemId={cell.type} size={0} className="grid-item-fill" />
            {crackLevel > 0 && (
              <div className={`mining-crack mining-crack-${crackLevel}`} />
            )}
          </div>
        );
      }
    }

    return blocks;
  };

  // Ghost Block 렌더링
  const renderGhostBlock = () => {
    if (!ghostBlock) return null;

    // 땅 블록 위치 (음수 row)
    if (ghostBlock.row < 0) {
      const groundRow = -(ghostBlock.row + 1); // -1 -> 0, -2 -> 1, etc.
      return (
        <div
          className={`ghost-block ${ghostBlock.isValid ? 'ghost-valid' : 'ghost-invalid'}`}
          style={{
            position: 'absolute',
            left: `${ghostBlock.col * 5}%`,
            bottom: `${(3 - groundRow) * 6.25}%`, // ground area is 0-25%
            width: '5.2%',
            height: '6.5%',
            zIndex: 150,
          }}
        >
          <ItemSprite itemId={ghostBlock.type} size={0} className="grid-item-fill" />
        </div>
      );
    }

    const pos = gridToPercent(ghostBlock.col, ghostBlock.row);

    return (
      <div
        className={`ghost-block ${ghostBlock.isValid ? 'ghost-valid' : 'ghost-invalid'}`}
        style={{
          left: `${ghostBlock.col * GRID.TILE_W}%`,
          bottom: `${pos.bottom}%`,
          width: `${GRID.TILE_W}%`,
          height: `${GRID.TILE_H}%`,
          zIndex: 150,
        }}
      >
        <ItemSprite itemId={ghostBlock.type} size={0} className="grid-item-fill" />
      </div>
    );
  };

  return (
    <div
      className={`world-view ${skyClass}`}
      ref={worldRef}
      onClick={handleWorldClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ cursor: cursorStyle }}
    >
      {/* 별 (밤에만 보임) */}
      <div className="stars-container">
        {stars.map((star, i) => (
          <div
            key={`star-${i}`}
            className={`star star-${star.size}`}
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              animationDelay: `${(i * 0.3) % 3}s`,
            }}
          />
        ))}
      </div>

      <div className={`celestial ${celestialClass}`}></div>

      {/* 픽셀 구름 */}
      <div
        className={`mc-cloud ${cloudPaused}`}
        style={{ top: '12%', width: '100px', height: '30px', animationDuration: '35s' }}
      ></div>
      <div
        className={`mc-cloud ${cloudPaused}`}
        style={{
          top: '22%',
          width: '150px',
          height: '45px',
          animationDuration: '50s',
          animationDelay: '-20s',
        }}
      ></div>
      <div
        className={`mc-cloud ${cloudPaused}`}
        style={{
          top: '8%',
          width: '80px',
          height: '25px',
          animationDuration: '40s',
          animationDelay: '-10s',
        }}
      ></div>

      {/* 땅 블록 렌더링 - 4줄 (맨 위 잔디, 나머지 흙) */}
      <div className="ground-blocks">
        {groundBlocks.map((row, rowIdx) =>
          row.map((blockType, col) => {
            // 빈 칸이면 클릭 가능한 placeholder 렌더링
            if (!blockType) {
              return (
                <div
                  key={`ground-empty-${rowIdx}-${col}`}
                  className="ground-block-empty"
                  style={{
                    left: `${col * 5}%`,
                    bottom: `${(3 - rowIdx) * 25}%`,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onGroundBlockPlace(col, rowIdx);
                  }}
                />
              );
            }

            // 채굴 중인지 확인 (ground blocks use negative row: -(rowIdx + 1))
            const isBeingMined = miningState &&
              miningState.row === -(rowIdx + 1) &&
              miningState.col === col;

            const isMineable = rowIdx < 3; // 맨 아래 줄은 캘 수 없음

            return (
              <img
                key={`ground-${rowIdx}-${col}`}
                src={blockType === 'grass_side' ? "/textures/blocks/grass_side.png" : "/textures/blocks/dirt.png"}
                alt={blockType}
                className={`ground-block ${isBeingMined ? 'ground-block-mining' : ''} ${isMineable ? 'ground-block-mineable' : ''}`}
                style={{
                  left: `${col * 5}%`,
                  bottom: `${(3 - rowIdx) * 25}%`,
                }}
                onMouseDown={(e) => {
                  if (e.button === 0 && isMineable) {
                    e.stopPropagation();
                    onGroundMouseDown(col, rowIdx);
                  }
                }}
              />
            );
          })
        )}
      </div>

      {/* Grid 블록 렌더링 */}
      {renderGridBlocks()}

      {/* 드롭된 아이템 */}
      {droppedItems.map(item => (
        <div
          key={`drop-${item.id}`}
          className="dropped-item"
          style={{
            left: `${item.x}%`,
            bottom: `calc(25% + ${item.y}%)`,
            transform: 'translateX(-50%)',
          }}
        >
          <ItemSprite itemId={item.type} size={28} />
        </div>
      ))}

      {/* Ghost Block */}
      {renderGhostBlock()}

      {/* Steve 캐릭터 */}
      <div
        className={`steve-character ${steveState.isRunning ? 'steve-running' : ''} ${steveState.isCrouching ? 'steve-crouching' : ''}`}
        style={{
          position: 'absolute',
          // Steve y는 ground=0부터의 높이(%), 25%는 시각적 ground 표면
          bottom: `calc(25% + ${steveState.y}%)`,
          left: `${steveState.x}%`,
          transform: `translateX(-50%) ${steveState.facingRight ? '' : 'scaleX(-1)'} ${steveState.isCrouching ? 'scaleY(0.85) translateY(7px)' : ''}`,
          zIndex: 78,
          pointerEvents: 'none',
          transition: 'transform 0.1s',
        }}
      >
        {(() => {
          // 스프라이트 선택 로직
          let spriteName: SpriteType = 'steve_stand';
          const animSpeed = steveState.isCrouching ? 6 : 4;
          const steveSize = 140; // Steve 크기
          const heldItemSize = 32; // 손에 든 아이템 크기

          // 손에 든 아이템 렌더링 함수 (running 모드일 때는 스프라이트에 곡괭이가 포함되어 있으므로 표시 안함)
          const renderHeldItem = () => {
            if (mode === 'running') return null; // 채굴 스프라이트에 곡괭이 포함됨
            if (!selectedItem?.type) return null;
            return (
              <div
                className="steve-held-item"
                style={{
                  position: 'absolute',
                  right: -8,
                  bottom: 45,
                  width: heldItemSize,
                  height: heldItemSize,
                  transform: 'rotate(-15deg)',
                  zIndex: 1,
                }}
              >
                <ItemSprite itemId={selectedItem.type} size={heldItemSize} />
              </div>
            );
          };

          if (steveState.isJumping) {
            spriteName = 'steve_jump';
          } else if (mode === 'running' && !steveState.isWalking) {
            // 타이머가 돌아가는 중이면 채굴 애니메이션 (스프라이트에 곡괭이 포함됨)
            return (
              <div className="anim-steve-wrapper" style={{ width: steveSize, height: steveSize, position: 'relative' }}>
                <PixelSprite name="steve_mine_1" size={steveSize} className="frame-1" />
                <PixelSprite name="steve_mine_2" size={steveSize} className="frame-2" />
              </div>
            );
          } else if (steveState.isWalking) {
            // 걷기 애니메이션 (3프레임 순환)
            const walkFrameIndex = Math.floor(steveState.walkFrame / animSpeed) % 3;
            const walkSprites: SpriteType[] = ['steve_walk_1', 'steve_walk_2', 'steve_walk_3'];
            spriteName = walkSprites[walkFrameIndex];
          }

          return (
            <div style={{ position: 'relative', width: steveSize, height: steveSize }}>
              <PixelSprite name={spriteName} size={steveSize} />
              {renderHeldItem()}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
