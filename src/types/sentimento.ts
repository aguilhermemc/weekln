export interface Envio {
  id: string;
  nome: string;
  semana: string; // YYYY-MM-DD (segunda-feira)
  palavras_segunda: string;
  foto_segunda_url: string | null;
  palavras_sexta: string;
  foto_sexta_url: string | null;
  criado_em: string;
  /** Se o envio é do usuário logado (vem da view sentimentos_publico). */
  meu?: boolean;
}

export interface DadosEnvio {
  nome: string;
  palavrasSegunda: string;
  fotoSegundaUrl: string | null;
  palavrasSexta: string;
  fotoSextaUrl: string | null;
}

// Estado de um momento (segunda ou sexta) em formulários
export interface MomentoForm {
  palavras: string;
  arquivo: File | null;
  fotoAtual: string | null;
}

// Estado de edição do admin
export interface RascunhoAdmin {
  nome: string;
  segunda: MomentoForm;
  sexta: MomentoForm;
}

export type CampoLog =
  | 'nome'
  | 'palavras_segunda'
  | 'palavras_sexta'
  | 'foto_segunda'
  | 'foto_sexta';

export interface LogEdicao {
  id: string;
  sentimento_id: string;
  campo: CampoLog;
  valor_anterior: string | null;
  valor_novo: string | null;
  editado_por: 'usuario' | 'admin';
  editado_em: string;
}
