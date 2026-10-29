import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { authService } from '@/services';
import type { Usuario } from '@/types/auth';

interface EstadoAuth {
  usuario: Usuario | null;
  ehAdmin: boolean;
  /** Enquanto a sessão (e o papel de admin) ainda não foram verificados. */
  carregando: boolean;
  entrar: (email: string, senha: string) => Promise<void>;
  sair: () => Promise<void>;
}

const AuthContext = createContext<EstadoAuth | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [sessaoVerificada, setSessaoVerificada] = useState(false);
  // Guarda para qual usuário o papel foi verificado, para não usar o de um login anterior
  const [admin, setAdmin] = useState<{ id: string; valor: boolean } | null>(null);
  const id = usuario?.id ?? null;

  useEffect(() => {
    void authService.obterUsuario().then((u) => {
      setUsuario(u);
      setSessaoVerificada(true);
    });
    return authService.aoMudar(setUsuario);
  }, []);

  useEffect(() => {
    if (!id) return;
    let ativo = true;
    authService
      .ehAdmin()
      .catch(() => false)
      .then((valor) => {
        if (ativo) setAdmin({ id, valor });
      });
    return () => {
      ativo = false;
    };
  }, [id]);

  const entrar = useCallback((email: string, senha: string) => authService.entrar(email, senha), []);
  const sair = useCallback(() => authService.sair(), []);

  const valor = useMemo<EstadoAuth>(
    () => ({
      usuario,
      ehAdmin: id !== null && admin?.id === id && admin.valor,
      carregando: !sessaoVerificada || (id !== null && admin?.id !== id),
      entrar,
      sair,
    }),
    [usuario, id, admin, sessaoVerificada, entrar, sair]
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth(): EstadoAuth {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>');
  return ctx;
}
