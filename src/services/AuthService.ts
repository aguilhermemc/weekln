import type { SupabaseClient } from '@supabase/supabase-js';
import type { Usuario } from '@/types/auth';
import type { IAuthService } from './interfaces/IAuthService';
import { CHAVE_ADMIN } from './AdminSentimentoService';

export class AuthService implements IAuthService {
  constructor(private readonly client: SupabaseClient) {}

  async obterUsuario(): Promise<Usuario | null> {
    return null;
  }

  aoMudar(_callback: (usuario: Usuario | null) => void): () => void {
    return () => {};
  }

  async ehAdmin(): Promise<boolean> {
    const senha = sessionStorage.getItem(CHAVE_ADMIN);
    if (!senha) return false;
    const { data, error } = await this.client.rpc('admin_validar', { p_senha: senha });
    if (error) return false;
    return data === true;
  }

  async entrar(_email: string, senha: string): Promise<void> {
    const { data, error } = await this.client.rpc('admin_validar', { p_senha: senha });
    if (error) throw error;
    if (data !== true) throw new Error('Senha inválida');
    sessionStorage.setItem(CHAVE_ADMIN, senha);
  }

  async sair(): Promise<void> {
    sessionStorage.removeItem(CHAVE_ADMIN);
  }
}