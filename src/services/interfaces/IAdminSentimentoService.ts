import type { DadosEnvio } from '@/types/sentimento';

export interface IAdminSentimentoService {
  atualizar(id: string, dados: DadosEnvio): Promise<void>;
  excluir(id: string): Promise<void>;
}
