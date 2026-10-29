import { useEffect, useRef } from 'react';
import { INTERVALO_VERIFICACAO_MS } from '@/config/constants';
import { rotaApresentacao } from '@/config/rotas';
import { sentimentoService } from '@/services';
import { segundaDaSemana } from '@/utils/semana';
import { tomDaPessoa } from '@/utils/tom';
import { useToast } from './useToast';

/**
 * Consulta o servidor periodicamente e mostra um aviso quando alguém envia o sentimento da semana.
 * A primeira consulta só registra o que já existe; os próprios envios não geram aviso.
 */
export function useAvisoNovosEnvios() {
  const avisar = useToast();
  const conhecidos = useRef<{ semana: string; ids: Set<string> } | null>(null);

  useEffect(() => {
    let cancelado = false;

    async function verificar() {
      if (document.visibilityState === 'hidden') return;
      const semana = segundaDaSemana();
      try {
        const envios = await sentimentoService.listarPorSemana(semana);
        if (cancelado) return;
        const anteriores = conhecidos.current?.semana === semana ? conhecidos.current.ids : null;
        conhecidos.current = { semana, ids: new Set(envios.map((e) => e.id)) };
        if (!anteriores) return;
        for (const e of envios) {
          if (anteriores.has(e.id) || e.meu) continue;
          avisar({
            texto: `${e.nome} enviou o sentimento da semana`,
            tom: tomDaPessoa(e.nome),
            acao: { rotulo: 'Ver', para: rotaApresentacao(semana) },
          });
        }
      } catch {
        // falha de rede: tenta de novo no próximo ciclo
      }
    }

    void verificar();
    const timer = window.setInterval(verificar, INTERVALO_VERIFICACAO_MS);
    // Ao voltar para a aba, verifica na hora (o que chegou enquanto estava fora vira aviso)
    const aoVoltar = () => void verificar();
    document.addEventListener('visibilitychange', aoVoltar);
    return () => {
      cancelado = true;
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', aoVoltar);
    };
  }, [avisar]);
}
