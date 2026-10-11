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
});
