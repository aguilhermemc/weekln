export const TOTAL_TONS = 6;

/** Cor (0 a 5) fixa para cada pessoa, calculada pelo nome. */
export function tomDaPessoa(nome: string): number {
  let hash = 0;
  for (const c of nome.trim().toLowerCase()) hash = (hash * 31 + c.charCodeAt(0)) >>> 0;
  return hash % TOTAL_TONS;
}
