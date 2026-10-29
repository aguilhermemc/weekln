export function mensagemDeErro(erro: unknown, padrao = 'Ocorreu um erro.'): string {
  if (typeof erro === 'object' && erro !== null && 'message' in erro) {
    return String((erro as { message: unknown }).message);
  }
  return padrao;
}
