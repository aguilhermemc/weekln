import { createContext, useCallback, useContext, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import Toasts from '@/components/common/Toasts';
import { DURACAO_TOAST_MS } from '@/config/constants';
import type { NovoToast, Toast } from '@/types/toast';

const MAX_TOASTS = 4;

const ToastContext = createContext<((toast: NovoToast) => void) | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const proximoId = useRef(0);

  const fechar = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const avisar = useCallback(
    (toast: NovoToast) => {
      const id = ++proximoId.current;
      setToasts((t) => [...t, { ...toast, id }].slice(-MAX_TOASTS));
      window.setTimeout(() => fechar(id), DURACAO_TOAST_MS);
    },
    [fechar]
  );

  return (
    <ToastContext.Provider value={avisar}>
      {children}
      <Toasts toasts={toasts} onFechar={fechar} />
    </ToastContext.Provider>
  );
}

/** Retorna a função que mostra um aviso no canto da tela. */
export function useToast(): (toast: NovoToast) => void {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast precisa estar dentro de <ToastProvider>');
  return ctx;
}
