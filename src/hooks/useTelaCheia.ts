import { useCallback, useEffect, useState } from 'react';

export function useTelaCheia() {
  const [ativa, setAtiva] = useState(() => document.fullscreenElement !== null);

  useEffect(() => {
    const onChange = () => setAtiva(document.fullscreenElement !== null);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const alternar = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen?.();
  }, []);

  return { ativa, alternar };
}
