import { useCallback, useEffect, useState } from 'react';
import { sentimentoService } from '@/services';
import { segundaDaSemana } from '@/utils/semana';

export function useSemanas() {
  const [semanas, setSemanas] = useState<string[]>(() => [segundaDaSemana()]);

  const recarregar = useCallback(async () => {
    try {
      const lista = await sentimentoService.listarSemanas();
      setSemanas([...new Set([segundaDaSemana(), ...lista])].sort().reverse());
    } catch {
      // mantém apenas a semana atual
    }
  }, []);

  useEffect(() => {
    void recarregar();
  }, [recarregar]);

  return { semanas, recarregar };
}
