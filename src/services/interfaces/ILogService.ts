import type { LogEdicao } from '@/types/sentimento';

export interface ILogService {
  listarPorEnvios(ids: string[]): Promise<LogEdicao[]>;
}
