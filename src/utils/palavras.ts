import { MAX_ESPACOS_POR_PALAVRA, MAX_PALAVRAS } from '@/config/constants';

// Palavras são separadas só por vírgula; "bem disposto" conta como uma palavra.
export function separarPalavras(texto: string): string[] {
  return texto
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);
}

export function contarPalavras(texto: string): number {
  return separarPalavras(texto).length;
}

/** Retorna a mensagem de erro, ou null se o texto é válido. */
export function validarPalavras(texto: string): string | null {
  const palavras = separarPalavras(texto);
  if (palavras.length < 1 || palavras.length > MAX_PALAVRAS) {
    return `Escreva de 1 a ${MAX_PALAVRAS} palavras, separadas por vírgula.`;
  }
  if (palavras.some((p) => (p.match(/\s/g)?.length ?? 0) > MAX_ESPACOS_POR_PALAVRA)) {
    return 'Cada palavra pode ter no máximo um espaço.';
  }
  return null;
}

/** Durante a digitação: não deixa espaços seguidos. */
export function normalizarDigitacao(texto: string): string {
  return texto.replace(/\s{2,}/g, ' ');
}

/** Formato salvo no banco: "feliz, bem disposto, animado". */
export function formatarPalavras(texto: string): string {
  return separarPalavras(texto).join(', ');
}
