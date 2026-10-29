import { CHAVE_TEMA_LOCAL } from '@/config/constants';
import type { Tema } from '@/types/tema';
import type { ITemaService } from './interfaces/ITemaService';

export class TemaLocalService implements ITemaService {
  obter(): Tema {
    try {
      const salvo = localStorage.getItem(CHAVE_TEMA_LOCAL);
      if (salvo === 'claro' || salvo === 'escuro') return salvo;
    } catch {
      // armazenamento indisponível: usa o tema do sistema
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'escuro' : 'claro';
  }

  salvar(tema: Tema): void {
    try {
      localStorage.setItem(CHAVE_TEMA_LOCAL, tema);
    } catch {
      // sem persistência; o tema vale só nesta visita
    }
  }
}
