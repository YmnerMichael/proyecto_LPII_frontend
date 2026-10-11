import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProductoService } from '../../../productos/services/producto.service';
import { VentaService } from '../../services/venta.service';
import { ReporteVentasCategoria } from './reporte-ventas-categoria';

describe('ReporteVentasCategoria', () => {
  let fixture: ComponentFixture<ReporteVentasCategoria>;
  let buscar: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    buscar = vi.fn((_filtro: unknown, pagina: number) => of(pagina === 0
      ? {
          contenido: [
            {
              id: 1,
              fecha: '2026-10-10T10:00:00',
              clienteId: 1,
              clienteNombre: 'Ana Huamán',
              estado: 'REGISTRADA',
              total: 13.5,
              detalles: [
                { productoId: 8, productoNombre: 'Paracetamol', cantidad: 3, precio: 2.5, subtotal: 7.5 },
                { productoId: 9, productoNombre: 'Ibuprofeno', cantidad: 2, precio: 3, subtotal: 6 }
              ]
            },
            {
              id: 2,
              fecha: '2026-10-10T11:00:00',
              clienteId: 1,
              clienteNombre: 'Ana Huamán',
              estado: 'ANULADA',
              total: 2.5,
              detalles: [{ productoId: 8, productoNombre: 'Paracetamol', cantidad: 1, precio: 2.5, subtotal: 2.5 }]
            }
          ],
          pagina: 0,
          totalPaginas: 2,
          totalElementos: 3,
          ultima: false
        }
      : {
          contenido: [{
            id: 3,
            fecha: '2026-10-10T12:00:00',
            clienteId: 2,
            clienteNombre: 'Luis Pérez',
            estado: 'REGISTRADA',
            total: 5,
            detalles: [{ productoId: 8, productoNombre: 'Paracetamol', cantidad: 2, precio: 2.5, subtotal: 5 }]
          }],
          pagina: 1,
          totalPaginas: 2,
          totalElementos: 3,
          ultima: true
        }));

    TestBed.configureTestingModule({
      imports: [ReporteVentasCategoria],
      providers: [
        provideRouter([]),
        {
          provide: ProductoService,
          useValue: {
            listar: () => of([
              { id: 8, nombre: 'Paracetamol', descripcion: '', precio: 2.5, stock: 10, estado: true, categoriaId: 3, categoriaNombre: 'Analgésicos' },
              { id: 9, nombre: 'Ibuprofeno', descripcion: '', precio: 3, stock: 10, estado: true, categoriaId: 4, categoriaNombre: 'Antiinflamatorios' }
            ])
          }
        },
        { provide: VentaService, useValue: { buscar } }
      ]
    });
    fixture = TestBed.createComponent(ReporteVentasCategoria);
    fixture.detectChanges();
  });

  it('aggregates all pages of registered sales by the products’ current category', () => {
    const texto = fixture.nativeElement.textContent as string;
    expect(buscar).toHaveBeenCalledTimes(2);
    expect(texto).toContain('Analgésicos');
    expect(texto).toContain('12.50');
    expect(texto).toContain('Antiinflamatorios');
    expect(texto).toContain('6.00');
    expect(texto).toContain('18.50');
  });
});
