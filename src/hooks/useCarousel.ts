import { useCallback, useEffect, useState } from 'react';

// Navegação só manual: setas da tela, ← → e espaço (avança)
export function useCarousel(total: number) {
  const [indice, setIndice] = useState(0);

  const proximo = useCallback(() => setIndice((i) => (total ? (i + 1) % total : 0)), [total]);
  const anterior = useCallback(
    () => setIndice((i) => (total ? (i - 1 + total) % total : 0)),
    [total]
  );
  const reiniciar = useCallback(() => setIndice(0), []);
  const irPara = useCallback((i: number) => setIndice(i), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') proximo();
      if (e.key === 'ArrowLeft') anterior();
      if (e.key === ' ') {
        e.preventDefault();
        proximo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [proximo, anterior]);

  // A lista pode diminuir (envio excluído) enquanto a apresentação está aberta
  return { indice: total ? Math.min(indice, total - 1) : 0, proximo, anterior, reiniciar, irPara };
}
