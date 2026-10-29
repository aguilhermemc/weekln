import { NavLink, Outlet, useLocation } from 'react-router-dom';
import Marca from '@/components/common/Marca';
import { MENU, ROTAS } from '@/config/rotas';
import { useAuth } from '@/hooks/useAuth';
import { useAvisoNovosEnvios } from '@/hooks/useAvisoNovosEnvios';
import { useTema } from '@/hooks/useTema';
import BotaoTema from './BotaoTema';

export default function Layout() {
  const { tema, alternar } = useTema();
  const { usuario, sair } = useAuth();
  useAvisoNovosEnvios();
  // Anima a troca de tela só quando muda a seção (não ao trocar de semana)
  const secao = useLocation().pathname.split('/')[1];

  return (
    <div className="app">
      <header className="nav">
        <NavLink to={ROTAS.envio} className="nav-marca">
          <Marca animada />
          <span className="nav-titulo">Weekln</span>
        </NavLink>
        <nav className="nav-links" aria-label="Principal">
          {MENU.map((item) => (
            <NavLink
              key={item.para}
              to={item.para}
              end={item.exato}
              className={({ isActive }) => `nav-link${isActive ? ' ativo' : ''}`}
            >
              {item.rotulo}
            </NavLink>
          ))}
        </nav>
        <BotaoTema tema={tema} onAlternar={alternar} />
        <button className="botao-sec botao-peq" onClick={() => void sair()} title={usuario?.email ?? undefined}>
          Sair
        </button>
      </header>
      <main key={secao} className="conteudo">
        <Outlet />
      </main>
    </div>
  );
}
