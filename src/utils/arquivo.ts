import { TAMANHO_MAX_FOTO_BYTES, TIPOS_FOTO_PERMITIDOS } from '@/config/constants';

/** Retorna a mensagem de erro, ou null se a foto é válida. */
export function validarFoto(arquivo: File): string | null {
  if (!TIPOS_FOTO_PERMITIDOS.includes(arquivo.type)) {
    return 'Formato inválido. Use PNG, JPG ou WEBP.';
  }
  if (arquivo.size > TAMANHO_MAX_FOTO_BYTES) {
    return `Foto muito grande. Máximo de ${TAMANHO_MAX_FOTO_BYTES / 1024 / 1024} MB.`;
  }
  return null;
}
