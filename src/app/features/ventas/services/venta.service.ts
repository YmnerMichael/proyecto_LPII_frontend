import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { PaginaResponse } from '../../../core/models/pagina-response';
import { FiltroVentas, Venta, VentaRequest } from '../models/venta.model';

interface RespuestaPaginaBackend<T> {
  contenido?: T[];
  pagina?: number;
  totalPaginas?: number;
  totalElementos?: number;
  ultima?: boolean;
  content?: T[];
  number?: number;
  totalPages?: number;
  totalElements?: number;
  last?: boolean;
}

type RespuestaBusqueda<T> = RespuestaPaginaBackend<T> | T[];

@Injectable({
  providedIn: 'root'
})
export class VentaService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/ventas`;

  registrar(dto: VentaRequest): Observable<Venta> {
    return this.http.post<Venta>(this.url, dto);
  }

  obtener(id: number): Observable<Venta> {
    return this.http.get<Venta>(`${this.url}/${id}`);
  }

  buscar(filtro: FiltroVentas, pagina: number, tamanio: number): Observable<PaginaResponse<Venta>> {
    let params = new HttpParams()
      .set('pagina', pagina)
      .set('tamanio', tamanio)
      .set('ordenarPor', 'fecha')
      .set('direccion', 'desc');

    if (filtro.clienteId !== null) params = params.set('clienteId', filtro.clienteId);
    if (filtro.estado) params = params.set('estado', filtro.estado);
    if (filtro.desde) params = params.set('desde', filtro.desde);
    if (filtro.hasta) params = params.set('hasta', filtro.hasta);

    return this.http.get<RespuestaBusqueda<Venta>>(`${this.url}/buscar`, { params }).pipe(
      map(respuesta => this.normalizarPagina(respuesta, pagina, tamanio))
    );
  }

  private normalizarPagina(
    respuesta: RespuestaBusqueda<Venta>,
    paginaSolicitada: number,
    tamanio: number
  ): PaginaResponse<Venta> {
    if (Array.isArray(respuesta)) {
      const totalElementos = respuesta.length;
      const totalPaginas = Math.ceil(totalElementos / tamanio);
      const inicio = paginaSolicitada * tamanio;
      return {
        contenido: respuesta.slice(inicio, inicio + tamanio),
        pagina: paginaSolicitada,
        totalPaginas,
        totalElementos,
        ultima: totalPaginas === 0 || paginaSolicitada >= totalPaginas - 1
      };
    }

    const contenido = respuesta.contenido ?? respuesta.content;
    const pagina = respuesta.pagina ?? respuesta.number;
    const totalPaginas = respuesta.totalPaginas ?? respuesta.totalPages;
    const totalElementos = respuesta.totalElementos ?? respuesta.totalElements;
    const ultima = respuesta.ultima ?? respuesta.last;

    if (
      !Array.isArray(contenido) ||
      typeof pagina !== 'number' ||
      !Number.isInteger(pagina) ||
      typeof totalPaginas !== 'number' ||
      !Number.isInteger(totalPaginas) ||
      typeof totalElementos !== 'number' ||
      !Number.isInteger(totalElementos) ||
      typeof ultima !== 'boolean'
    ) {
      throw new Error('La respuesta de búsqueda de ventas no tiene el formato de página esperado.');
    }

    return { contenido, pagina, totalPaginas, totalElementos, ultima };
  }
}
