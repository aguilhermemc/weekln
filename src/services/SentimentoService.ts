import type { SupabaseClient } from '@supabase/supabase-js';
import type { DadosEnvio, Envio } from '@/types/sentimento';
import type { ISentimentoService } from './interfaces/ISentimentoService';

// O dono do envio é o usuário logado (auth.uid() nas funções do banco)
export class SentimentoService implements ISentimentoService {
  constructor(private readonly client: SupabaseClient) {}

  async listarPorSemana(semana: string): Promise<Envio[]> {
    const { data, error } = await this.client
      .from('sentimentos_publico')
      .select('*')
      .eq('semana', semana)
      .order('criado_em', { ascending: true });
    if (error) throw error;
    return (data ?? []) as Envio[];
  }

  async listarSemanas(): Promise<string[]> {
    const { data, error } = await this.client.from('sentimentos_publico').select('semana');
    if (error) throw error;
    const unicas = new Set((data ?? []).map((r) => r.semana as string));
    return [...unicas].sort().reverse();
  }

  async buscarMeu(semana: string): Promise<Envio | null> {
    const { data, error } = await this.client.rpc('meu_envio', { p_semana: semana });
    if (error) throw error;
    return ((data as Envio[] | null) ?? [])[0] ?? null;
  }

  async enviar(semana: string, d: DadosEnvio): Promise<void> {
    const { error } = await this.client.rpc('enviar_sentimento', {
      p_nome: d.nome,
      p_semana: semana,
      p_pal_seg: d.palavrasSegunda,
      p_foto_seg: d.fotoSegundaUrl,
      p_pal_sex: d.palavrasSexta,
      p_foto_sex: d.fotoSextaUrl,
    });
    if (error) throw error;
  }

  async editar(id: string, d: DadosEnvio): Promise<void> {
    const { error } = await this.client.rpc('editar_sentimento', {
      p_id: id,
      p_nome: d.nome,
      p_pal_seg: d.palavrasSegunda,
      p_foto_seg: d.fotoSegundaUrl,
      p_pal_sex: d.palavrasSexta,
      p_foto_sex: d.fotoSextaUrl,
    });
    if (error) throw error;
  }
}
