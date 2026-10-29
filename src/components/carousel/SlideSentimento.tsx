import type { Envio } from '@/types/sentimento';
import { tomDaPessoa } from '@/utils/tom';

interface BlocoProps {
  titulo: string;
  dica: string;
  palavras: string;
  foto: string | null;
}

function Bloco({ titulo, dica, palavras, foto }: BlocoProps) {
  return (
    <div className="bloco">
      <div className="bloco-titulo">
        <h3>{titulo}</h3>
        <span>{dica}</span>
      </div>
      {foto ? (
        <>
          <img src={foto} alt={palavras} />
          <p className="palavras">{palavras}</p>
        </>
      ) : (
        <>
          {/* Sem foto: as palavras ocupam o quadro da imagem, no mesmo tamanho de fonte */}
          <div className="sem-foto">
            <p className="palavras">{palavras}</p>
          </div>
          {/* Reserva a linha de baixo para os dois blocos terem a mesma altura */}
          <p className="palavras palavras-reserva" aria-hidden="true">
            {palavras}
          </p>
        </>
      )}
    </div>
  );
}

interface Props {
  envio: Envio;
  posicao: number;
  total: number;
}

export default function SlideSentimento({ envio, posicao, total }: Props) {
  return (
    <section className={`slide tom-${tomDaPessoa(envio.nome)}`}>
      <div className="slide-topo">
        <h2>{envio.nome}</h2>
        <span className="contador">
          {posicao} de {total}
        </span>
      </div>
      <div className="blocos">
        <Bloco
          titulo="Segunda"
          dica="Como estou"
          palavras={envio.palavras_segunda}
          foto={envio.foto_segunda_url}
        />
        <Bloco
          titulo="Sexta"
          dica="Como espero estar"
          palavras={envio.palavras_sexta}
          foto={envio.foto_sexta_url}
        />
      </div>
    </section>
  );
}
