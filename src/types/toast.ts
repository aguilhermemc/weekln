export interface NovoToast {
  texto: string;
  /** Cor (0 a 5) da bolinha do aviso. */
  tom?: number;
  /** Link opcional exibido no aviso. */
  acao?: { rotulo: string; para: string };
}

export interface Toast extends NovoToast {
  id: number;
}
