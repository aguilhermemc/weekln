import { useCallback, useEffect, useState } from 'react';
import { INTERVALO_VERIFICACAO_MS } from '@/config/constants';
import { adminSentimentoService, logService, storageService } from '@/services';
import type { Envio, LogEdicao, RascunhoAdmin } from '@/types/sentimento';
import { mensagemDeErro } from '@/utils/erro';
import { formatarPalavras, validarPalavras } from '@/utils/palavras';
import { segundaDaSemana } from '@/utils/semana';
import { comUploads } from '@/utils/uploadTransacional';
import { useEnviosDaSemana } from './useEnviosDaSemana';
import { useSemanas } from './useSemanas';

export function useAdminPainel() {
  const [semana, setSemana] = useState(() => segundaDaSemana());
  const [logs, setLogs] = useState<LogEdicao[]>([]);
  const [mensagem, setMensagem] = useState('');
  const { semanas, recarregar: recarregarSemanas } = useSemanas();
  const { envios, recarregar: recarregarEnvios } = useEnviosDaSemana(semana, INTERVALO_VERIFICACAO_MS);

  // Recarrega o log sempre que a lista de envios mudar (inclusive após edições)
  useEffect(() => {
    logService
      .listarPorEnvios(envios.map((e) => e.id))
      .then(setLogs)
      .catch((e) => setMensagem(mensagemDeErro(e)));
  }, [envios]);

  const salvarEdicao = useCallback(
    async (id: string, r: RascunhoAdmin): Promise<boolean> => {
      setMensagem('');
      if (!r.nome.trim()) {
        setMensagem('Informe o nome.');
        return false;
      }
      const erroPalavras = validarPalavras(r.segunda.palavras) ?? validarPalavras(r.sexta.palavras);
      if (erroPalavras) {
        setMensagem(erroPalavras);
        return false;
      }
      try {
        await comUploads(storageService, [r.segunda.arquivo, r.sexta.arquivo], async ([urlSegunda, urlSexta]) => {
          await adminSentimentoService.atualizar(id, {
            nome: r.nome.trim(),
            palavrasSegunda: formatarPalavras(r.segunda.palavras),
            fotoSegundaUrl: urlSegunda ?? r.segunda.fotoAtual,
            palavrasSexta: formatarPalavras(r.sexta.palavras),
            fotoSextaUrl: urlSexta ?? r.sexta.fotoAtual,
          });
        });
        await recarregarEnvios();
        return true;
      } catch (e) {
        setMensagem(mensagemDeErro(e, 'Erro ao salvar.'));
        return false;
      }
    },
    [recarregarEnvios]
  );

  const excluir = useCallback(
    async (envio: Envio) => {
      try {
        await adminSentimentoService.excluir(envio.id);
        await Promise.all([recarregarEnvios(), recarregarSemanas()]);
      } catch (e) {
        setMensagem(mensagemDeErro(e));
      }
    },
    [recarregarEnvios, recarregarSemanas]
  );

  return { semana, setSemana, semanas, envios, logs, mensagem, salvarEdicao, excluir };
}
