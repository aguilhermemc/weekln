// Mapa central das rotas: use estas funções em vez de montar caminhos à mão.
export const ROTAS = {
  envio: '/',
  apresentacao: '/apresentacao',
  admin: '/admin',
  login: '/login',
} as const;

export function rotaApresentacao(semana: string): string {
  return `${ROTAS.apresentacao}/${semana}`;
}

export interface ItemMenu {
  para: string;
  rotulo: string;
  /** Só fica ativo na rota exata (sem subrotas). */
  exato?: boolean;
}

export const MENU: readonly ItemMenu[] = [
  { para: ROTAS.envio, rotulo: 'Enviar', exato: true },
  { para: ROTAS.apresentacao, rotulo: 'Apresentação' },
];
