import { Inventory, EntityType } from '../types';
import { DEFAULT_INVENTORY } from '../constants';
import { PixelSprite } from './PixelSprite';

interface InventoryPanelProps {
  inventory: Inventory;
  logs: string[];
  onClearWorld: () => void;
}

export function InventoryPanel({ inventory, logs, onClearWorld }: InventoryPanelProps) {
  return (
    <div className="mc-ui right-panel">
      <h2
        style={{
          margin: '0 0 10px 0',
          borderBottom: '2px solid #555',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        INVENTORY
        <button
          onClick={onClearWorld}
          style={{
            fontSize: '14px',
            cursor: 'pointer',
            padding: '4px',
            fontFamily: 'inherit',
            background: '#e74c3c',
            color: 'white',
            border: '2px solid #c0392b',
          }}
        >
          월드 초기화
        </button>
      </h2>

      <div className="inventory-list">
        {(Object.keys(DEFAULT_INVENTORY) as EntityType[]).map((key) => (
          <div
            key={key}
            className="inventory-item"
            style={{ opacity: inventory[key] > 0 ? 1 : 0.4 }}
          >
            <PixelSprite name={key} size={40} />
            <div
              style={{
                color: '#fff',
                textShadow: '2px 2px 0 #000',
                fontSize: '24px',
                marginTop: '5px',
              }}
            >
              {inventory[key] || 0}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          background: '#000',
          color: '#ccc',
          padding: '10px',
          fontSize: '16px',
          border: '2px solid #555',
          height: '110px',
          overflowY: 'auto',
          marginTop: '10px',
        }}
      >
        {logs.map((l, i) => (
          <div key={i} style={{ marginBottom: '5px' }}>
            {l}
          </div>
        ))}
      </div>
    </div>
  );
}
