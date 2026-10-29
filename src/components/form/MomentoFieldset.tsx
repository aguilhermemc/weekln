import { useEffect, useRef, useState } from 'react';
import { MAX_PALAVRAS, TAMANHO_MAX_FOTO_BYTES, TIPOS_FOTO_PERMITIDOS } from '@/config/constants';
import type { MomentoForm } from '@/types/sentimento';
import { validarFoto } from '@/utils/arquivo';
import { contarPalavras, normalizarDigitacao, validarPalavras } from '@/utils/palavras';

interface Props {
  legenda: string;
  valor: MomentoForm;
  onChange: (momento: MomentoForm) => void;
  desabilitado?: boolean;
  /** Cor (0 a 5) da bolinha ao lado da legenda. */
  tom?: number;
}

export default function MomentoFieldset({ legenda, valor, onChange, desabilitado, tom }: Props) {
  const [erroFoto, setErroFoto] = useState('');
  const [previa, setPrevia] = useState<string | null>(null);
  const inputArquivo = useRef<HTMLInputElement>(null);
  const palavras = contarPalavras(valor.palavras);
  // Só avisa depois que a pessoa começou a digitar
  const erroPalavras = valor.palavras.trim() ? validarPalavras(valor.palavras) : null;
  const imagem = previa ?? valor.fotoAtual;

  // Prévia do arquivo escolhido (liberada ao trocar ou desmontar)
  useEffect(() => {
    if (!valor.arquivo) {
      setPrevia(null);
      return;
    }
    const url = URL.createObjectURL(valor.arquivo);
    setPrevia(url);
    return () => URL.revokeObjectURL(url);
  }, [valor.arquivo]);

  // O X tira a foto nova e a já salva: o momento fica sem foto
  function removerFoto() {
    if (inputArquivo.current) inputArquivo.current.value = '';
    setErroFoto('');
    onChange({ ...valor, arquivo: null, fotoAtual: null });
  }

  return (
    <fieldset className={`momento${tom !== undefined ? ` tom-${tom}` : ''}`} disabled={desabilitado}>
      <legend>{legenda}</legend>
      <div className="campo-com-contador">
        <input
          className="campo"
          placeholder="até 3 palavras, separadas por vírgula"
          aria-label={`Palavras: ${legenda}`}
          aria-invalid={erroPalavras !== null}
          value={valor.palavras}
          onChange={(e) => onChange({ ...valor, palavras: normalizarDigitacao(e.target.value) })}
        />
        <span className={`contador-palavras${erroPalavras ? ' excedido' : ''}`} aria-live="polite">
          {palavras}/{MAX_PALAVRAS}
        </span>
      </div>
      {erroPalavras && (
        <small className="erro-campo" role="alert">
          {erroPalavras}
        </small>
      )}
      {imagem && (
        <div className="previa-wrap">
          <img className="previa" src={imagem} alt="" />
          {!desabilitado && (
            <button type="button" className="previa-remover" onClick={removerFoto} aria-label={`Remover foto: ${legenda}`}>
              ×
            </button>
          )}
        </div>
      )}
      <input
        ref={inputArquivo}
        className="arquivo"
        type="file"
        aria-label={`Foto: ${legenda}`}
        accept={TIPOS_FOTO_PERMITIDOS.join(',')}
        onChange={(e) => {
          const arquivo = e.target.files?.[0] ?? null;
          const erro = arquivo ? validarFoto(arquivo) : null;
          setErroFoto(erro ?? '');
          if (erro) e.target.value = '';
          onChange({ ...valor, arquivo: erro ? null : arquivo });
        }}
      />
      <small className="dica">
        PNG, JPG ou WEBP, até {TAMANHO_MAX_FOTO_BYTES / 1024 / 1024} MB
      </small>
      {erroFoto && (
        <small className="erro-campo" role="alert">
          {erroFoto}
        </small>
      )}
    </fieldset>
  );
}
