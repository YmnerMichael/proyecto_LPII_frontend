import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ProductoService } from './producto.service';
import { Producto } from '../models/producto.model';

describe('ProductoService', () => {
  let service: ProductoService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProductoService, provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(ProductoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('extracts products from the backend paginated response', () => {
    const respuesta: Producto[] = [{
      id: 8,
      nombre: 'Paracetamol 500 mg',
      descripcion: 'Analgésico',
      precio: 2.5,
      stock: 15,
      estado: true,
      categoriaId: 3,
      categoriaNombre: 'Analgésicos'
    }];

    service.listar().subscribe(resultado => {
      expect(resultado).toEqual(respuesta);
    });

    const solicitud = httpMock.expectOne(
      request => request.url === 'http://localhost:8080/api/v1/productos'
    );
    expect(solicitud.request.method).toBe('GET');
    expect(solicitud.request.params.get('pagina')).toBe('0');
    expect(solicitud.request.params.get('tamanio')).toBe('100');
    expect(solicitud.request.params.get('ordenarPor')).toBe('id');
    expect(solicitud.request.params.get('direccion')).toBe('asc');
    solicitud.flush({
      contenido: respuesta,
      pagina: 0,
      tamanio: 100,
      totalElementos: 1,
      totalPaginas: 1,
      ultima: true
    });
  });

  it('sends the complete backend DTO when creating a product', () => {
    const solicitudProducto = {
      nombre: 'Paracetamol 500 mg',
      descripcion: 'Analgésico',
      precio: 2.5,
      stock: 15,
      estado: true,
      categoriaId: 3
    };

    service.crear(solicitudProducto).subscribe();

    const solicitud = httpMock.expectOne('http://localhost:8080/api/v1/productos');
    expect(solicitud.request.method).toBe('POST');
    expect(solicitud.request.body).toEqual(solicitudProducto);
    solicitud.flush({ id: 8, ...solicitudProducto, categoriaNombre: 'Analgésicos' });
  });

  it('uses PUT and DELETE for update and removal', () => {
    const producto = {
      nombre: 'Paracetamol 500 mg',
      descripcion: '',
      precio: 2.5,
      stock: 15,
      estado: true,
      categoriaId: 3
    };

    service.actualizar(8, producto).subscribe();
    const actualizacion = httpMock.expectOne('http://localhost:8080/api/v1/productos/8');
    expect(actualizacion.request.method).toBe('PUT');
    actualizacion.flush({ id: 8, ...producto, categoriaNombre: 'Analgésicos' });

    service.eliminar(8).subscribe();
    const eliminacion = httpMock.expectOne('http://localhost:8080/api/v1/productos/8');
    expect(eliminacion.request.method).toBe('DELETE');
    eliminacion.flush(null);
  });
});
