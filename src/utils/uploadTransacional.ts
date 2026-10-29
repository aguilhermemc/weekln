import type { IStorageService } from '@/services/interfaces/IStorageService';

/**
 * Sobe as fotos e executa `operacao` com as URLs (null onde não há arquivo novo).
 * Se qualquer etapa falhar, remove do storage as fotos que acabaram de ser enviadas.
 */
export async function comUploads<T>(
  storage: IStorageService,
  arquivos: (File | null)[],
  operacao: (urls: (string | null)[]) => Promise<T>
): Promise<T> {
  const enviadas: string[] = [];
  try {
    const urls: (string | null)[] = [];
    for (const arquivo of arquivos) {
      if (!arquivo) {
        urls.push(null);
        continue;
      }
      const url = await storage.uploadFoto(arquivo);
      enviadas.push(url);
      urls.push(url);
    }
    return await operacao(urls);
  } catch (erro) {
    if (enviadas.length > 0) await storage.removerPorUrl(enviadas).catch(() => undefined);
    throw erro;
  }
}
