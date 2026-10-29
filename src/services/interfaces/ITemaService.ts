import type { Tema } from '@/types/tema';

export interface ITemaService {
  /** Tema salvo no navegador ou, se não houver, o tema do sistema operacional. */
  obter(): Tema;
  salvar(tema: Tema): void;
}
