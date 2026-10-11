export interface PaginaResponse<T> {
  contenido: T[];
  pagina: number;
  totalPaginas: number;
  totalElementos: number;
  ultima: boolean;
}
