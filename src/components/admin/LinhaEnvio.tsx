import { useState } from 'react';
import MomentoFieldset from '@/components/form/MomentoFieldset';
import type { Envio, RascunhoAdmin } from '@/types/sentimento';
import { formatarDataHora } from '@/utils/semana';

interface Props {
  envio: Envio;
  onSalvar: (id: string, rascunho: RascunhoAdmin) => Promise<boolean>;
  onExcluir: (envio: Envio) => void;
}

function criarRascunho(e: Envio): RascunhoAdmin {
  return {
    nome: e.nome,
    segunda: { palavras: e.palavras_segunda, arquivo: null, fotoAtual: e.foto_segunda_url },
    sexta: { palavras: e.palavras_sexta, arquivo: null, fotoAtual: e.foto_sexta_url },
  };
}

function CelulaMomento({ palavras, foto }: { palavras: string; foto: string | null }) {
  return (
    <div className="celula-foto">
      {foto && <img className="miniatura" src={foto} alt="" />}
      <span>{palavras}</span>
    </div>
  );
}

export default function LinhaEnvio({ envio, onSalvar, onExcluir }: Props) {
  const [rascunho, setRascunho] = useState<RascunhoAdmin | null>(null);

  async function salvar() {
    if (rascunho && (await onSalvar(envio.id, rascunho))) setRascunho(null);
  }

  if (rascunho) {
    return (
      <tr>
        <td>
          <input
            className="campo"
            aria-label="Nome"
            value={rascunho.nome}
            onChange={(e) => setRascunho({ ...rascunho, nome: e.target.value })}
          />
        </td>
        <td>
          <MomentoFieldset
            legenda="Segunda"
            valor={rascunho.segunda}
            onChange={(m) => setRascunho({ ...rascunho, segunda: m })}
          />
        </td>
        <td>
          <MomentoFieldset
            legenda="Sexta"
            valor={rascunho.sexta}
            onChange={(m) => setRascunho({ ...rascunho, sexta: m })}
          />
        </td>
        <td>{formatarDataHora(envio.criado_em)}</td>
        <td>
          <div className="celula-acoes">
            <button className="botao botao-peq" onClick={salvar}>
              Salvar
            </button>
            <button className="botao-sec botao-peq" onClick={() => setRascunho(null)}>
              Cancelar
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td>{envio.nome}</td>
      <td>
        <CelulaMomento palavras={envio.palavras_segunda} foto={envio.foto_segunda_url} />
      </td>
      <td>
        <CelulaMomento palavras={envio.palavras_sexta} foto={envio.foto_sexta_url} />
      </td>
      <td>{formatarDataHora(envio.criado_em)}</td>
      <td>
        <div className="celula-acoes">
          <button className="botao-sec botao-peq" onClick={() => setRascunho(criarRascunho(envio))}>
            Editar
          </button>
          <button className="botao-perigo botao-peq" onClick={() => onExcluir(envio)}>
            Excluir
          </button>
        </div>
      </td>
    </tr>
  );
}
