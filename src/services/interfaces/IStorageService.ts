export interface IStorageService {
  /** Valida (tipo e tamanho), envia a foto e devolve a URL pública. */
  uploadFoto(arquivo: File): Promise<string>;
  /** Remove fotos já enviadas a partir das URLs públicas. */
  removerPorUrl(urls: string[]): Promise<void>;
}
