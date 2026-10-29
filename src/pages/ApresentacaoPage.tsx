import { useEffect } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import IndicadorSlides from '@/components/carousel/IndicadorSlides';
import SlideSentimento from '@/components/carousel/SlideSentimento';
import SemanaSelect from '@/components/common/SemanaSelect';
import { INTERVALO_VERIFICACAO_MS } from '@/config/constants';
import { ROTAS, rotaApresentacao } from '@/config/rotas';
import { useCarousel } from '@/hooks/useCarousel';
import { useEnviosDaSemana } from '@/hooks/useEnviosDaSemana';
import { useSemanas } from '@/hooks/useSemanas';
import { useTelaCheia } from '@/hooks/useTelaCheia';
import { formatarSemana, normalizarSemana, segundaDaSemana } from '@/utils/semana';
import '@/styles/apresentacao.css';

// Valida a semana da URL: data inválida vai para a semana atual; outro dia da semana vai para a segunda.
export default function ApresentacaoPage() {
  const { semana: param } = useParams();
  const semana = normalizarSemana(param);

  if (!semana) return <Navigate to={rotaApresentacao(segundaDaSemana())} replace />;
  if (semana !== param) return <Navigate to={rotaApresentacao(semana)} replace />;
  return <Apresentacao semana={semana} />;
}

function Apresentacao({ semana }: { semana: string }) {
  const navigate = useNavigate();
  const { semanas } = useSemanas();
  // Novos envios entram no fim da lista sem mudar o slide atual
  const { envios, carregando } = useEnviosDaSemana(semana, INTERVALO_VERIFICACAO_MS);
  const telaCheia = useTelaCheia();
  const { indice, proximo, anterior, reiniciar, irPara } = useCarousel(envios.length);

  useEffect(() => {
    reiniciar();
  }, [semana, reiniciar]);

  // Semana aberta pela URL pode ainda não ter envios: garante que apareça no seletor
  const opcoes = semanas.includes(semana) ? semanas : [semana, ...semanas].sort().reverse();
  const atual = envios[indice];

  return (
    <div className="apresentacao">
      <header className="apresentacao-topo">
        <div>
          <p className="sobretitulo">Apresentação</p>
          <h1>Semana de {formatarSemana(semana)}</h1>
        </div>
        <div className="apresentacao-controles">
          <SemanaSelect semanas={opcoes} valor={semana} onChange={(s) => navigate(rotaApresentacao(s))} />
          <button className="botao-sec" onClick={telaCheia.alternar}>
            {telaCheia.ativa ? 'Sair da tela cheia' : 'Tela cheia'}
          </button>
        </div>
      </header>

      {carregando ? (
        <div className="slide slide-esqueleto" aria-label="Carregando" />
      ) : !atual ? (
        <div className="vazio">
          <p>Ninguém enviou o sentimento desta semana ainda.</p>
          <button className="botao" onClick={() => navigate(ROTAS.envio)}>
            Enviar o meu
          </button>
        </div>
      ) : (
        <>
          <div className="palco">
            <button className="seta" onClick={anterior} aria-label="Anterior">
              ‹
            </button>
            <SlideSentimento key={atual.id} envio={atual} posicao={indice + 1} total={envios.length} />
            <button className="seta" onClick={proximo} aria-label="Próximo">
              ›
            </button>
          </div>
          <IndicadorSlides envios={envios} indice={indice} onSelecionar={irPara} />
        </>
      )}
    </div>
  );
}
