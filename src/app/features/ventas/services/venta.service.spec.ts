import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { VentaRequest } from '../models/venta.model';
import { VentaService } from './venta.service';

describe('VentaService', () => {
  let service: VentaService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [VentaService, provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(VentaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('posts only the client, product ids, and quantities', () => {
    const request: VentaRequest = {
      clienteId: 4,
      detalles: [{ productoId: 8, cantidad: 3 }]
    };

    service.registrar(request).subscribe();

    const httpRequest = httpMock.expectOne('http://localhost:8080/api/v1/ventas');
    expect(httpRequest.request.method).toBe('POST');
    expect(httpRequest.request.body).toEqual(request);
    expect(httpRequest.request.body).not.toHaveProperty('total');
    expect(httpRequest.request.body.detalles[0]).not.toHaveProperty('precio');
    httpRequest.flush({ id: 1 });
  });

  it('adds only selected filters to the paginated search request', () => {
    service.buscar({
      clienteId: 4,
      estado: null,
      desde: '2026-10-01',
      hasta: null
    }, 2, 10).subscribe();

    const request = httpMock.expectOne(http => http.url === 'http://localhost:8080/api/v1/ventas/buscar');
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('clienteId')).toBe('4');
    expect(request.request.params.get('desde')).toBe('2026-10-01');
    expect(request.request.params.has('estado')).toBe(false);
    expect(request.request.params.has('hasta')).toBe(false);
    expect(request.request.params.get('pagina')).toBe('2');
    expect(request.request.params.get('tamanio')).toBe('10');
    request.flush({ contenido: [], pagina: 2, totalPaginas: 3, totalElementos: 21, ultima: false });
  });

  it('normalizes the standard Spring Page response so sales render in the list', () => {
    const venta = {
      id: 12,
      fecha: '2026-10-11T10:30:00',
      clienteId: 4,
      clienteNombre: 'Ana Pérez',
      estado: 'REGISTRADA' as const,
      total: 7.5,
      detalles: []
    };

    service.buscar({
      clienteId: null,
      estado: null,
      desde: null,
      hasta: null
    }, 0, 10).subscribe(resultado => {
      expect(resultado).toEqual({
        contenido: [venta],
        pagina: 0,
        totalPaginas: 1,
        totalElementos: 1,
        ultima: true
      });
    });

    const request = httpMock.expectOne(http => http.url === 'http://localhost:8080/api/v1/ventas/buscar');
    request.flush({
      content: [venta],
      number: 0,
      totalPages: 1,
      totalElements: 1,
      last: true,
      pageable: { pageNumber: 0 },
      first: true,
      size: 10,
      numberOfElements: 1,
      empty: false
    });
  });

  it('paginates a raw array response returned by the sales endpoint', () => {
    const ventas = Array.from({ length: 12 }, (_, indice) => ({
      id: indice + 1,
      fecha: '2026-10-11T10:30:00',
      clienteId: 4,
      clienteNombre: 'Ana Pérez',
      estado: 'REGISTRADA' as const,
      total: 7.5,
      detalles: []
    }));

    service.buscar({
      clienteId: null,
      estado: null,
      desde: null,
      hasta: null
    }, 1, 10).subscribe(resultado => {
      expect(resultado.contenido).toEqual(ventas.slice(10));
      expect(resultado.pagina).toBe(1);
      expect(resultado.totalPaginas).toBe(2);
      expect(resultado.totalElementos).toBe(12);
      expect(resultado.ultima).toBe(true);
    });

    const request = httpMock.expectOne(http => http.url === 'http://localhost:8080/api/v1/ventas/buscar');
    request.flush(ventas);
  });
});
