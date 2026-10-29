import type { LogEdicao } from '@/types/sentimento';
import { formatarDataHora } from '@/utils/semana';

const ROTULOS: Record<LogEdicao['campo'], string> = {
  nome: 'Nome',
  palavras_segunda: 'Palavras (segunda)',
  palavras_sexta: 'Palavras (sexta)',
  foto_segunda: 'Foto (segunda)',
  foto_sexta: 'Foto (sexta)',
};

function descrever(l: LogEdicao): string {
  if (l.campo.startsWith('foto')) return 'foto alterada';
  return `de "${l.valor_anterior ?? ''}" para "${l.valor_novo ?? ''}"`;
}

interface Props {
  logs: LogEdicao[];
  nomePorId: (id: string) => string;
}

export default function LogList({ logs, nomePorId }: Props) {
  if (logs.length === 0) return <p className="vazio-admin">Nenhuma edição registrada.</p>;

  return (
    <ul className="log">
      {logs.map((l) => (
        <li key={l.id}>
          {formatarDataHora(l.editado_em)} · {nomePorId(l.sentimento_id)} · {ROTULOS[l.campo]}:{' '}
          {descrever(l)} · por {l.editado_por}
        </li>
      ))}
    </ul>
  );
}
