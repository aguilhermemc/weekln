import { Link } from 'react-router-dom';
import type { Toast } from '@/types/toast';

interface Props {
  toasts: Toast[];
  onFechar: (id: number) => void;
}

export default function Toasts({ toasts, onFechar }: Props) {
  return (
    <div className="toasts" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast${t.tom !== undefined ? ` tom-${t.tom}` : ''}`}>
          <span className="toast-ponto" aria-hidden="true" />
          <p>{t.texto}</p>
          {t.acao && (
            <Link className="toast-acao" to={t.acao.para} onClick={() => onFechar(t.id)}>
              {t.acao.rotulo}
            </Link>
          )}
          <button type="button" className="toast-fechar" onClick={() => onFechar(t.id)} aria-label="Fechar aviso">
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
