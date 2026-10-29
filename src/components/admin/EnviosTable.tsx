import type { Envio, RascunhoAdmin } from '@/types/sentimento';
import LinhaEnvio from './LinhaEnvio';

interface Props {
  envios: Envio[];
  onSalvar: (id: string, rascunho: RascunhoAdmin) => Promise<boolean>;
  onExcluir: (envio: Envio) => void;
}

export default function EnviosTable({ envios, onSalvar, onExcluir }: Props) {
  if (envios.length === 0) return <p className="vazio-admin">Nenhum envio nesta semana.</p>;

  return (
    <div className="tabela-wrap">
      <table className="tabela">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Segunda</th>
            <th>Sexta</th>
            <th>Enviado em</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {envios.map((e) => (
            <LinhaEnvio key={e.id} envio={e} onSalvar={onSalvar} onExcluir={onExcluir} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
