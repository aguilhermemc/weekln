// Segunda-feira da semana de `base` (YYYY-MM-DD)
export function segundaDaSemana(base: Date = new Date()): string {
  const d = new Date(base.getFullYear(), base.getMonth(), base.getDate());
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/** Converte uma data da URL (YYYY-MM-DD) na segunda-feira da semana; null se for inválida. */
export function normalizarSemana(iso: string | undefined): string | null {
  const m = iso?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const [ano, mes, dia] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const d = new Date(ano, mes - 1, dia);
  if (d.getFullYear() !== ano || d.getMonth() !== mes - 1 || d.getDate() !== dia) return null;
  return segundaDaSemana(d);
}

export function formatarSemana(iso: string): string {
  const [a, m, d] = iso.split('-');
  return `${d}/${m}/${a}`;
}

export function formatarDataHora(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR');
}

export function mesmoDia(iso: string, base: Date = new Date()): boolean {
  return new Date(iso).toDateString() === base.toDateString();
}
