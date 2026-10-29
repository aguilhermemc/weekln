import { formatarSemana } from '@/utils/semana';

interface Props {
  semanas: string[];
  valor: string;
  onChange: (semana: string) => void;
}

export default function SemanaSelect({ semanas, valor, onChange }: Props) {
  return (
    <select className="seletor" aria-label="Semana" value={valor} onChange={(e) => onChange(e.target.value)}>
      {semanas.map((s) => (
        <option key={s} value={s}>
          Semana de {formatarSemana(s)}
        </option>
      ))}
    </select>
  );
}
