import type { ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { ROTAS } from '@/config/rotas';
import { useAuth } from '@/hooks/useAuth';

interface Props {
  /** Só admins acessam; os demais voltam para a tela de envio. */
  apenasAdmin?: boolean;
  /** Sem children, renderiza as rotas filhas. */
  children?: ReactNode;
}

export default function RotaProtegida({ apenasAdmin, children }: Props) {
  const { usuario, ehAdmin, carregando } = useAuth();
  const local = useLocation();

  if (carregando) return <p className="pagina">Carregando...</p>;
  if (!usuario) {
    return <Navigate to={ROTAS.login} replace state={{ de: local.pathname + local.search }} />;
  }
  if (apenasAdmin && !ehAdmin) return <Navigate to={ROTAS.envio} replace />;
  return <>{children ?? <Outlet />}</>;
}
