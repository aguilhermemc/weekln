import type { SupabaseClient, User } from '@supabase/supabase-js';
import type { Usuario } from '@/types/auth';
import type { IAuthService } from './interfaces/IAuthService';

function paraUsuario(user: User | null | undefined): Usuario | null {
  return user ? { id: user.id, email: user.email ?? null } : null;
}

export class AuthService implements IAuthService {
  constructor(private readonly client: SupabaseClient) {}

  async obterUsuario(): Promise<Usuario | null> {
    const { data } = await this.client.auth.getSession();
    return paraUsuario(data.session?.user);
  }

  aoMudar(callback: (usuario: Usuario | null) => void): () => void {
    const { data } = this.client.auth.onAuthStateChange((_evento, sessao) => {
      callback(paraUsuario(sessao?.user));
    });
    return () => data.subscription.unsubscribe();
  }

  async ehAdmin(): Promise<boolean> {
    const { data, error } = await this.client.rpc('e_admin');
    if (error) throw error;
    return data === true;
  }

  async entrar(email: string, senha: string): Promise<void> {
    const { error } = await this.client.auth.signInWithPassword({ email, password: senha });
    if (error) throw error;
  }

  async sair(): Promise<void> {
    const { error } = await this.client.auth.signOut();
    if (error) throw error;
  }
}
