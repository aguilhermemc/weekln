import type { SupabaseClient } from '@supabase/supabase-js';
import type { DadosEnvio } from '@/types/sentimento';
import type { IAdminSentimentoService } from './interfaces/IAdminSentimentoService';

export const CHAVE_ADMIN = 'admin_senha';

export class AdminSentimentoService implements IAdminSentimentoService {
  constructor(private readonly client: SupabaseClient) {}

  private senha(): string {
    return sessionStorage.getItem(CHAVE_ADMIN) ?? '';
  }

  async atualizar(id: string, d: DadosEnvio): Promise<void> {
    const { error } = await this.client.rpc('admin_editar', {
      p_senha: this.senha(),
      p_id: id,
      p_nome: d.nome,
      p_pal_seg: d.palavrasSegunda,
      p_foto_seg: d.fotoSegundaUrl,
      p_pal_sex: d.palavrasSexta,
      p_foto_sex: d.fotoSextaUrl,
    });
    if (error) throw error;
  }

  async excluir(id: string): Promise<void> {
    const { error } = await this.client.rpc('admin_excluir', {
      p_senha: this.senha(),
      p_id: id,
    });
    if (error) throw error;
  }
}