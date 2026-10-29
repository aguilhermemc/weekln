import { useCallback, useEffect, useState } from 'react';
import { temaService } from '@/services';
import type { Tema } from '@/types/tema';

export function useTema() {
  const [tema, setTema] = useState<Tema>(() => temaService.obter());

  useEffect(() => {
    document.documentElement.dataset.tema = tema;
  }, [tema]);

  const alternar = useCallback(() => {
    setTema((atual) => {
      const novo: Tema = atual === 'escuro' ? 'claro' : 'escuro';
      temaService.salvar(novo);
      return novo;
    });
  }, []);

  return { tema, alternar };
}
