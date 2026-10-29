import type { SupabaseClient } from '@supabase/supabase-js';
import type { DadosEnvio } from '@/types/sentimento';
import type { IAdminSentimentoService } from './interfaces/IAdminSentimentoService';

export class AdminSentimentoService implements IAdminSentimentoService {
  constructor(private readonly client: SupabaseClient) {}

  async atualizar(id: string, d: DadosEnvio): Promise<void> {
    const { error } = await this.client
      .from('sentimentos')
      .update({
        nome: d.nome,
        palavras_segunda: d.palavrasSegunda,
        foto_segunda_url: d.fotoSegundaUrl,
        palavras_sexta: d.palavrasSexta,
        foto_sexta_url: d.fotoSextaUrl,
      })
      .eq('id', id);
    if (error) throw error;
  }

  async excluir(id: string): Promise<void> {
    const { error } = await this.client.from('sentimentos').delete().eq('id', id);
    if (error) throw error;
  }
}
