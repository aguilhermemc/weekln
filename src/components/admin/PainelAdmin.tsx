import { useState } from 'react';
import ModalConfirmacao from '@/components/common/ModalConfirmacao';
import SemanaSelect from '@/components/common/SemanaSelect';
import { useAdminPainel } from '@/hooks/useAdminPainel';
import type { Envio } from '@/types/sentimento';
import EnviosTable from './EnviosTable';
import LogList from './LogList';

export default function PainelAdmin() {
  const { semana, setSemana, semanas, envios, logs, mensagem, salvarEdicao, excluir } = useAdminPainel();
  const [paraExcluir, setParaExcluir] = useState<Envio | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const nomePorId = (id: string) => envios.find((e) => e.id === id)?.nome ?? id;

  async function confirmarExclusao() {
    if (!paraExcluir) return;
    setExcluindo(true);
    await excluir(paraExcluir);
    setExcluindo(false);
    setParaExcluir(null);
  }

  return (
    <div className="pagina pagina-admin">
      <header className="barra">
        <h1>Admin</h1>
        <SemanaSelect semanas={semanas} valor={semana} onChange={setSemana} />
      </header>
      {mensagem && (
        <p className="mensagem" role="status">
          {mensagem}
        </p>
      )}

      <h2>Envios</h2>
      <EnviosTable envios={envios} onSalvar={salvarEdicao} onExcluir={setParaExcluir} />

      <h2>Histórico de edições</h2>
      <LogList logs={logs} nomePorId={nomePorId} />

      <ModalConfirmacao
        aberto={paraExcluir !== null}
        titulo="Excluir envio?"
        textoConfirmar="Excluir"
        textoOcupado="Excluindo..."
        ocupado={excluindo}
        onConfirmar={() => void confirmarExclusao()}
        onCancelar={() => setParaExcluir(null)}
      >
        <p>
          O envio de <strong>{paraExcluir?.nome}</strong> será excluído e não poderá ser recuperado.
        </p>
      </ModalConfirmacao>
    </div>
  );
}
