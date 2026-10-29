import type { SupabaseClient } from '@supabase/supabase-js';
import type { LogEdicao } from '@/types/sentimento';
import type { ILogService } from './interfaces/ILogService';

export class LogService implements ILogService {
  constructor(private readonly client: SupabaseClient) {}

  async listarPorEnvios(ids: string[]): Promise<LogEdicao[]> {
    if (ids.length === 0) return [];
    const { data, error } = await this.client
      .from('sentimentos_log')
      .select('*')
      .in('sentimento_id', ids)
      .order('editado_em', { ascending: false });
    if (error) throw error;
    return (data ?? []) as LogEdicao[];
  }
}
