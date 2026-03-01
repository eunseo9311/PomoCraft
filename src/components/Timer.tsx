import { TimerMode } from '../types';

interface TimerProps {
  timeLeft: number;
  initialTime: number;
  mode: TimerMode;
  onTimeChange: (time: number) => void;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onDone: () => void;
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60).toString().padStart(2, '0');
  const s = (sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export function Timer({
  timeLeft,
  initialTime,
  mode,
  onTimeChange,
  onStart,
  onPause,
  onReset,
  onDone,
}: TimerProps) {
  return (
    <div className="mc-ui left-panel">
      <h2 style={{ margin: '0 0 10px 0', borderBottom: '2px solid #555' }}>
        TIMER
      </h2>
      <div className="timer-text">{formatTime(timeLeft)}</div>

      {mode === 'idle' && (
        <div style={{ marginBottom: '20px', fontSize: '22px' }}>
          <label>집중 시간(분): </label>
          <input
            type="number"
            min="1"
            max="120"
            value={initialTime / 60}
            onChange={(e) => {
              const val = Math.max(1, parseInt(e.target.value) || 1) * 60;
              onTimeChange(val);
            }}
            style={{
              width: '60px',
              fontFamily: 'inherit',
              fontSize: '22px',
              background: '#000',
              color: '#fff',
              border: '2px solid #555',
              textAlign: 'center',
            }}
          />
        </div>
      )}

      <div style={{ marginTop: '20px' }}>
        {mode === 'idle' && (
          <button className="mc-btn" onClick={onStart}>
            ▶ 시작 (Start)
          </button>
        )}
        {mode === 'running' && (
          <button className="mc-btn" onClick={onPause}>
            ⏸ 정지 (Pause)
          </button>
        )}
        {mode === 'paused' && (
          <button className="mc-btn" onClick={onStart}>
            ▶ 계속 (Resume)
          </button>
        )}
        <button className="mc-btn" onClick={onReset} disabled={mode === 'idle'}>
          🔄 초기화
        </button>
        <button
          className="mc-btn"
          onClick={onDone}
          disabled={mode === 'idle' || mode === 'done'}
          style={{ color: '#8b0000' }}
        >
          ■ 완료 (Done)
        </button>
      </div>

      <div
        style={{
          marginTop: 'auto',
          background: '#000',
          color: '#fff',
          padding: '15px',
          fontSize: '20px',
          border: '2px solid #555',
        }}
      >
        상태:{' '}
        <span style={{ color: mode === 'running' ? '#5b8731' : '#fff' }}>
          {mode.toUpperCase()}
        </span>
      </div>
    </div>
  );
}
