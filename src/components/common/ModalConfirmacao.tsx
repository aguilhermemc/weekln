import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

interface Props {
  aberto: boolean;
  titulo: string;
  children: ReactNode;
  textoConfirmar: string;
  /** Texto do botão enquanto a ação está em andamento. */
  textoOcupado?: string;
  ocupado?: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}

export default function ModalConfirmacao({
  aberto,
  titulo,
  children,
  textoConfirmar,
  textoOcupado,
  ocupado,
  onConfirmar,
  onCancelar,
}: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (aberto && !dialog.open) dialog.showModal();
    if (!aberto && dialog.open) dialog.close();
  }, [aberto]);

  function cancelar() {
    if (!ocupado) onCancelar();
  }

  return (
    <dialog
      ref={ref}
      className="modal"
      aria-labelledby="modal-titulo"
      onCancel={(e) => {
        e.preventDefault(); // Esc: fecha pelo estado do React
        cancelar();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) cancelar(); // clique fora da caixa
      }}
    >
      <div className="modal-corpo">
        <h2 id="modal-titulo">{titulo}</h2>
        <div className="modal-texto">{children}</div>
        <div className="modal-acoes">
          <button type="button" className="botao-sec" onClick={cancelar} disabled={ocupado} autoFocus>
            Cancelar
          </button>
          <button type="button" className="botao botao-erro" onClick={onConfirmar} disabled={ocupado}>
            {ocupado && textoOcupado ? textoOcupado : textoConfirmar}
          </button>
        </div>
      </div>
    </dialog>
  );
}
