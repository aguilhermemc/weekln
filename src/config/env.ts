type NomeVariavel = 'SUPABASE_URL' | 'SUPABASE_ANON_KEY';

const variaveis = {
  SUPABASE_URL: import.meta.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: import.meta.env.SUPABASE_ANON_KEY,
};

function obrigatoria(nome: NomeVariavel): string {
  const valor = variaveis[nome];

  if (!valor) {
    throw new Error(`Variável de ambiente ausente: ${nome}`);
  }

  return valor;
}

export const env = {
  supabaseUrl: obrigatoria('SUPABASE_URL'),
  supabaseAnonKey: obrigatoria('SUPABASE_ANON_KEY'),
} as const;