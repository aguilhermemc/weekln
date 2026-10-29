import type { Usuario } from '@/types/auth';

export interface IAuthService {
  obterUsuario(): Promise<Usuario | null>;
  /** Observa mudanças de login. Retorna a função para cancelar a observação. */
  aoMudar(callback: (usuario: Usuario | null) => void): () => void;
  /** Se o usuário logado está na lista de admins. */
  ehAdmin(): Promise<boolean>;
  entrar(email: string, senha: string): Promise<void>;
  sair(): Promise<void>;
}
