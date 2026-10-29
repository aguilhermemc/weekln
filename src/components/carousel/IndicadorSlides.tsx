import type { Envio } from '@/types/sentimento';
import { tomDaPessoa } from '@/utils/tom';

interface Props {
  envios: Envio[];
  indice: number;
  onSelecionar: (indice: number) => void;
}

export default function IndicadorSlides({ envios, indice, onSelecionar }: Props) {
  return (
    <div className="indicador">
      <div className="indicador-pontos">
        {envios.map((e, i) => (
          <button
            key={e.id}
            type="button"
            className={`ponto tom-${tomDaPessoa(e.nome)}${i === indice ? ' ativo' : ''}`}
            onClick={() => onSelecionar(i)}
            aria-label={`Ir para ${e.nome}`}
            aria-current={i === indice}
            title={e.nome}
          />
        ))}
      </div>
    </div>
  );
}
