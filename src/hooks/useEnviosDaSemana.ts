import { useCallback, useEffect, useState } from 'react';
import { sentimentoService } from '@/services';
import type { Envio } from '@/types/sentimento';
import { mensagemDeErro } from '@/utils/erro';

/** Envios da semana; com `intervaloMs`, recarrega periodicamente enquanto a aba está visível. */
export function useEnviosDaSemana(semana: string, intervaloMs?: number) {
  const [envios, setEnvios] = useState<Envio[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const recarregar = useCallback(async () => {
    try {
      const novos = await sentimentoService.listarPorSemana(semana);
      // Mantém a mesma referência se nada mudou, para não re-renderizar a cada verificação
      setEnvios((atuais) => (JSON.stringify(atuais) === JSON.stringify(novos) ? atuais : novos));
      setErro('');
    } catch (e) {
      setErro(mensagemDeErro(e));
    } finally {
      setCarregando(false);
    }
  }, [semana]);

  useEffect(() => {
    setCarregando(true);
    void recarregar();
  }, [recarregar]);

  useEffect(() => {
    if (!intervaloMs) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') void recarregar();
    }, intervaloMs);
    return () => window.clearInterval(timer);
  }, [intervaloMs, recarregar]);

  return { envios, carregando, erro, recarregar };
}
