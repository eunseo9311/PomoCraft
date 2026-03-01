import { Toast } from '../types';
import { PixelSprite } from './PixelSprite';

interface ToastContainerProps {
  toasts: Toast[];
}

export function ToastContainer({ toasts }: ToastContainerProps) {
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className="toast-box">
          <PixelSprite name={t.icon} size={48} />
          <div className="toast-texts">
            <div className="toast-title" style={{ color: t.titleColor }}>
              {t.title}
            </div>
            <div className="toast-desc">{t.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
