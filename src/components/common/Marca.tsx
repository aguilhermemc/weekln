import type { CSSProperties } from 'react';
import { TOTAL_TONS } from '@/utils/tom';

interface Props {
  /** Bolinhas pulam em sequência ao carregar e ao passar o mouse. */
  animada?: boolean;
}

export default function Marca({ animada }: Props) {
  return (
    <span className={`marca${animada ? ' marca-animada' : ''}`} aria-hidden="true">
      {Array.from({ length: TOTAL_TONS }, (_, i) => (
        <span key={i} className={`tom-${i}`} style={{ '--i': i } as CSSProperties} />
      ))}
    </span>
  );
}
