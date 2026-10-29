export const BUCKET_FOTOS = 'fotos';
// Mantida com o nome antigo para não perder o tema já escolhido nos navegadores
export const CHAVE_TEMA_LOCAL = 'calendario_sentimentos_tema'; // repetida no script do index.html
export const MAX_PALAVRAS = 3;
export const MAX_ESPACOS_POR_PALAVRA = 1;
export const TIPOS_FOTO_PERMITIDOS: readonly string[] = ['image/png', 'image/jpeg', 'image/webp'];
export const TAMANHO_MAX_FOTO_BYTES = 5 * 1024 * 1024; // 5 MB
export const INTERVALO_VERIFICACAO_MS = 15000; // busca novos envios no servidor
export const DURACAO_TOAST_MS = 6000;
