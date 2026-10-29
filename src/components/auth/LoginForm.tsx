import { useState } from 'react';
import type { FormEvent } from 'react';
import Marca from '@/components/common/Marca';

interface Props {
  onEntrar: (email: string, senha: string) => Promise<void>;
}

export default function LoginForm({ onEntrar }: Props) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [entrando, setEntrando] = useState(false);

  async function submeter(ev: FormEvent) {
    ev.preventDefault();
    setErro('');
    setEntrando(true);
    try {
      await onEntrar(email.trim(), senha);
    } catch {
      setErro('E-mail ou senha incorretos.');
    } finally {
      setEntrando(false);
    }
  }

  return (
    <form onSubmit={submeter} className="pagina pagina-login">
      <header className="topo">
        <Marca animada />
        <h1>Weekln</h1>
        <p>Entre com o e-mail e a senha que você recebeu.</p>
      </header>
      <label className="rotulo">
        E-mail
        <input
          className="campo"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <label className="rotulo">
        Senha
        <input
          className="campo"
          type="password"
          autoComplete="current-password"
          required
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />
      </label>
      <button className="botao" type="submit" disabled={entrando}>
        {entrando ? 'Entrando...' : 'Entrar'}
      </button>
      {erro && (
        <p className="mensagem" role="alert">
          {erro}
        </p>
      )}
    </form>
  );
}
