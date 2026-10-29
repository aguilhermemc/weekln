import { Link } from 'react-router-dom';
import MomentoFieldset from '@/components/form/MomentoFieldset';
import { rotaApresentacao } from '@/config/rotas';
import { useFormularioEnvio } from '@/hooks/useFormularioEnvio';
import { formatarSemana } from '@/utils/semana';

export default function EnvioPage() {
  const f = useFormularioEnvio();

  return (
    <div className="pagina">
      <header className="topo">
        <p className="sobretitulo">Semana de {formatarSemana(f.semana)}</p>
        <h1>Como você está nesta semana?</h1>
        <p>Escreva de 1 a 3 palavras para segunda e para sexta. A foto é opcional.</p>
      </header>

      <div className="cartao">
        <label className="rotulo">
          Seu nome
          <input
            className="campo"
            value={f.nome}
            onChange={(e) => f.setNome(e.target.value)}
            disabled={f.bloqueado}
          />
        </label>

        <div className="momentos">
          <MomentoFieldset
            legenda="Segunda: como estou"
            valor={f.segunda}
            onChange={f.setSegunda}
            desabilitado={f.bloqueado}
            tom={0}
          />
          <MomentoFieldset
            legenda="Sexta: como espero estar"
            valor={f.sexta}
            onChange={f.setSexta}
            desabilitado={f.bloqueado}
            tom={3}
          />
        </div>

        {f.bloqueado && (
          <p className="mensagem">Você já enviou nesta semana. Depois do dia do envio, só o admin edita.</p>
        )}
        <div className="acoes">
          <button className="botao" onClick={() => void f.submeter()} disabled={f.salvando || f.bloqueado}>
            {f.salvando ? 'Salvando...' : f.envio ? 'Atualizar' : 'Enviar'}
          </button>
          {f.envio && (
            <Link className="botao-sec" to={rotaApresentacao(f.semana)}>
              Ver na apresentação
            </Link>
          )}
          {f.mensagem && (
            <p className="mensagem" role="status">
              {f.mensagem}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
