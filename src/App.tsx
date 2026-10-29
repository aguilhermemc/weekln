import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import RotaProtegida from '@/components/layout/RotaProtegida';
import { ROTAS, rotaApresentacao } from '@/config/rotas';
import { AuthProvider } from '@/hooks/useAuth';
import { ToastProvider } from '@/hooks/useToast';
import AdminPage from '@/pages/AdminPage';
import ApresentacaoPage from '@/pages/ApresentacaoPage';
import EnvioPage from '@/pages/EnvioPage';
import LoginPage from '@/pages/LoginPage';
import { segundaDaSemana } from '@/utils/semana';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path={ROTAS.login} element={<LoginPage />} />
            {/* Todo o resto exige login */}
            <Route element={<RotaProtegida />}>
              <Route element={<Layout />}>
                <Route path={ROTAS.envio} element={<EnvioPage />} />
                {/* /apresentacao abre a semana atual */}
                <Route
                  path={ROTAS.apresentacao}
                  element={<Navigate to={rotaApresentacao(segundaDaSemana())} replace />}
                />
                <Route path={`${ROTAS.apresentacao}/:semana`} element={<ApresentacaoPage />} />
                <Route
                  path={ROTAS.admin}
                  element={
                    <RotaProtegida apenasAdmin>
                      <AdminPage />
                    </RotaProtegida>
                  }
                />
                <Route path="*" element={<Navigate to={ROTAS.envio} replace />} />
              </Route>
            </Route>
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
