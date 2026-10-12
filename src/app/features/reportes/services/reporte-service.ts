import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { VentaPorCategoria } from '../models/reporte.model';

interface RespuestaVentasCategoria {
  categoriaId: number;
  categoriaNombre?: string;
  cantidadVendida?: number;
  montoTotal?: number;
  categoria?: string;
  cantidad?: number;
  total?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReporteService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/reportes/ventas-por-categoria`;

  ventasPorCategoria(desde: string | null, hasta: string | null): Observable<VentaPorCategoria[]> {
    let params = new HttpParams();
    if (desde) params = params.set('desde', desde);
    if (hasta) params = params.set('hasta', hasta);

    return this.http.get<RespuestaVentasCategoria[]>(this.url, { params }).pipe(
      map(respuesta => {
        if (!Array.isArray(respuesta)) {
          throw new Error('El reporte de ventas por categoría no devolvió una lista.');
        }

        return respuesta.map(fila => {
          const categoriaNombre = fila.categoriaNombre ?? fila.categoria;
          const cantidadVendida = fila.cantidadVendida ?? fila.cantidad;
          const montoTotal = fila.montoTotal ?? fila.total;

          if (
            typeof fila.categoriaId !== 'number' ||
            typeof categoriaNombre !== 'string' ||
            typeof cantidadVendida !== 'number' ||
            typeof montoTotal !== 'number'
          ) {
            throw new Error('La respuesta del reporte contiene una fila con formato inválido.');
          }

          return { categoriaId: fila.categoriaId, categoriaNombre, cantidadVendida, montoTotal };
        });
      })
    );
  }
}
