import { Navigate, useLocation } from 'react-router-dom';
import LoginForm from '@/components/auth/LoginForm';
import { ROTAS } from '@/config/rotas';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const { usuario, carregando, entrar } = useAuth();
  // Depois do login, volta para a página que a pessoa tentou abrir
  const destino = (useLocation().state as { de?: string } | null)?.de ?? ROTAS.envio;

  if (carregando) return <p className="pagina">Carregando...</p>;
  if (usuario) return <Navigate to={destino} replace />;
  return <LoginForm onEntrar={entrar} />;
}
