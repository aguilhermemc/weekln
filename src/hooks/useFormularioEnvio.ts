import { useCallback, useEffect, useMemo, useState } from 'react';
import { sentimentoService, storageService } from '@/services';
import type { Envio, MomentoForm } from '@/types/sentimento';
import { mensagemDeErro } from '@/utils/erro';
import { formatarPalavras, validarPalavras } from '@/utils/palavras';
import { comUploads } from '@/utils/uploadTransacional';
import { mesmoDia, segundaDaSemana } from '@/utils/semana';

const momentoVazio: MomentoForm = { palavras: '', arquivo: null, fotoAtual: null };

export function useFormularioEnvio() {
  const semana = useMemo(() => segundaDaSemana(), []);
  const [envio, setEnvio] = useState<Envio | null>(null);
  const [nome, setNome] = useState('');
  const [segunda, setSegunda] = useState<MomentoForm>(momentoVazio);
  const [sexta, setSexta] = useState<MomentoForm>(momentoVazio);
  const [mensagem, setMensagem] = useState('');
  const [salvando, setSalvando] = useState(false);

  const preencher = useCallback((e: Envio) => {
    setEnvio(e);
    setNome(e.nome);
    setSegunda({ palavras: e.palavras_segunda, arquivo: null, fotoAtual: e.foto_segunda_url });
    setSexta({ palavras: e.palavras_sexta, arquivo: null, fotoAtual: e.foto_sexta_url });
  }, []);

  useEffect(() => {
    sentimentoService
      .buscarMeu(semana)
      .then((e) => {
        if (e) preencher(e);
      })
      .catch((err) => setMensagem(mensagemDeErro(err)));
  }, [semana, preencher]);

  // Depois do dia do envio, só o admin edita
  const bloqueado = envio !== null && !mesmoDia(envio.criado_em);

  const submeter = useCallback(async () => {
    setMensagem('');
    if (!nome.trim()) return setMensagem('Informe seu nome.');
    const erroSegunda = validarPalavras(segunda.palavras);
    if (erroSegunda) return setMensagem(`Segunda: ${erroSegunda}`);
    const erroSexta = validarPalavras(sexta.palavras);
    if (erroSexta) return setMensagem(`Sexta: ${erroSexta}`);

    setSalvando(true);
    try {
      await comUploads(storageService, [segunda.arquivo, sexta.arquivo], async ([urlSegunda, urlSexta]) => {
        const dados = {
          nome: nome.trim(),
          palavrasSegunda: formatarPalavras(segunda.palavras),
          fotoSegundaUrl: urlSegunda ?? segunda.fotoAtual,
          palavrasSexta: formatarPalavras(sexta.palavras),
          fotoSextaUrl: urlSexta ?? sexta.fotoAtual,
        };
        if (envio) await sentimentoService.editar(envio.id, dados);
        else await sentimentoService.enviar(semana, dados);
      });

      const atualizado = await sentimentoService.buscarMeu(semana);
      if (atualizado) preencher(atualizado);
      setMensagem(envio ? 'Atualizado!' : 'Enviado!');
    } catch (e) {
      setMensagem(mensagemDeErro(e, 'Erro ao salvar.'));
    } finally {
      setSalvando(false);
    }
  }, [nome, segunda, sexta, envio, semana, preencher]);

  return {
    semana,
    envio,
    nome,
    setNome,
    segunda,
    setSegunda,
    sexta,
    setSexta,
    bloqueado,
    salvando,
    mensagem,
    submeter,
  };
}
