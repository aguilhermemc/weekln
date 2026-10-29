import type { DadosEnvio, Envio } from '@/types/sentimento';

export interface ISentimentoService {
  listarPorSemana(semana: string): Promise<Envio[]>;
  /** Semanas que possuem envios, da mais recente para a mais antiga. */
  listarSemanas(): Promise<string[]>;
  /** Envio do usuário logado na semana informada. */
  buscarMeu(semana: string): Promise<Envio | null>;
  enviar(semana: string, dados: DadosEnvio): Promise<void>;
  /** Edição pelo dono do envio (permitida apenas no dia do envio). */
  editar(id: string, dados: DadosEnvio): Promise<void>;
}
