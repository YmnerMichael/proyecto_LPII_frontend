import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { PaginaResponse } from '../../../core/models/pagina-response';
import { environment } from '../../../../environments/environment';
import { Producto, ProductoRequest } from '../models/producto.model';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/productos`;

  listar(): Observable<Producto[]> {
    const params = new HttpParams()
      .set('pagina', 0)
      .set('tamanio', 100)
      .set('ordenarPor', 'id')
      .set('direccion', 'asc');

    return this.http
      .get<PaginaResponse<Producto>>(this.url, { params })
      .pipe(map(respuesta => respuesta.contenido));
  }

  obtenerPorId(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.url}/${id}`);
  }

  crear(dto: ProductoRequest): Observable<Producto> {
    return this.http.post<Producto>(this.url, dto);
  }

  actualizar(id: number, dto: ProductoRequest): Observable<Producto> {
    return this.http.put<Producto>(`${this.url}/${id}`, dto);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
