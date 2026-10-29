import type { SupabaseClient } from '@supabase/supabase-js';
import { BUCKET_FOTOS } from '@/config/constants';
import { validarFoto } from '@/utils/arquivo';
import type { IStorageService } from './interfaces/IStorageService';

const EXTENSOES: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
};

export class StorageService implements IStorageService {
  constructor(private readonly client: SupabaseClient) {}

  async uploadFoto(arquivo: File): Promise<string> {
    const erroValidacao = validarFoto(arquivo);
    if (erroValidacao) throw new Error(erroValidacao);

    const caminho = `${crypto.randomUUID()}.${EXTENSOES[arquivo.type]}`;
    const { error } = await this.client.storage
      .from(BUCKET_FOTOS)
      .upload(caminho, arquivo, { contentType: arquivo.type });
    if (error) throw error;
    return this.client.storage.from(BUCKET_FOTOS).getPublicUrl(caminho).data.publicUrl;
  }

  async removerPorUrl(urls: string[]): Promise<void> {
    const marcador = `/object/public/${BUCKET_FOTOS}/`;
    const caminhos = urls
      .map((u) => u.indexOf(marcador))
      .map((i, n) => (i >= 0 ? decodeURIComponent(urls[n].slice(i + marcador.length)) : null))
      .filter((c): c is string => c !== null);
    if (caminhos.length === 0) return;
    const { error } = await this.client.storage.from(BUCKET_FOTOS).remove(caminhos);
    if (error) throw error;
  }
}
