import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EMPTY, expand, forkJoin, map, toArray } from 'rxjs';
import { redondear } from '../../../../core/utils/numeros';
import { obtenerMensajeError } from '../../../../core/utils/http-error';
import { Producto } from '../../../productos/models/producto.model';
import { ProductoService } from '../../../productos/services/producto.service';
import { FiltroVentas, Venta } from '../../models/venta.model';
import { VentaService } from '../../services/venta.service';

interface ResumenCategoria {
  categoriaId: number | null;
  categoriaNombre: string;
  cantidad: number;
  total: number;
  ventas: Set<number>;
}

type LineaReporte = Omit<ResumenCategoria, 'ventas'> & { ventas: number };

@Component({
  selector: 'app-reporte-ventas-categoria',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CurrencyPipe],
  templateUrl: './reporte-ventas-categoria.html',
  styleUrl: './reporte-ventas-categoria.css'
})
export class ReporteVentasCategoria {
  private readonly fb = inject(FormBuilder);
  private readonly ventaService = inject(VentaService);
  private readonly productoService = inject(ProductoService);

  protected readonly filas = signal<LineaReporte[]>([]);
  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly total = computed(() =>
    redondear(this.filas().reduce((suma, fila) => suma + fila.total, 0))
  );
  protected readonly filtros = this.fb.group({
    desde: this.fb.control<string | null>(null),
    hasta: this.fb.control<string | null>(null)
  });

  constructor() {
    this.buscar();
  }

  buscar(): void {
    const { desde, hasta } = this.filtros.getRawValue();
    if (desde && hasta && desde > hasta) {
      this.error.set('La fecha «desde» no puede ser posterior a la fecha «hasta».');
      return;
    }

    const filtro: FiltroVentas = { clienteId: null, estado: null, desde, hasta };
    this.cargando.set(true);
    this.error.set(null);
    this.filas.set([]);
    const paginas$ = this.ventaService.buscar(filtro, 0, 100).pipe(
      expand(pagina => pagina.ultima
        ? EMPTY
        : this.ventaService.buscar(filtro, pagina.pagina + 1, 100)),
      toArray()
    );

    forkJoin({
      productos: this.productoService.listar(),
      paginas: paginas$
    }).pipe(
      map(({ productos, paginas }) => this.agrupar(productos, paginas.flatMap(pagina => pagina.contenido)))
    ).subscribe({
      next: filas => {
        this.filas.set(filas);
        this.cargando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(obtenerMensajeError(err));
        this.cargando.set(false);
      }
    });
  }

  limpiar(): void {
    this.filtros.reset();
    this.buscar();
  }

  imprimir(): void {
    setTimeout(() => window.print());
  }

  private agrupar(productos: Producto[], ventas: Venta[]): LineaReporte[] {
    const productoPorId = new Map(productos.map(producto => [producto.id, producto]));
    const resumenes = new Map<string, ResumenCategoria>();

    for (const venta of ventas) {
      if (venta.estado !== 'REGISTRADA') continue;
      for (const detalle of venta.detalles) {
        const producto = productoPorId.get(detalle.productoId);
        const categoriaId = producto?.categoriaId ?? null;
        const categoriaNombre = producto?.categoriaNombre ?? 'Categoría no disponible';
        const clave = categoriaId === null ? 'sin-categoria' : String(categoriaId);
        const resumen = resumenes.get(clave) ?? {
          categoriaId,
          categoriaNombre,
          cantidad: 0,
          total: 0,
          ventas: new Set<number>()
        };
        resumen.cantidad += detalle.cantidad;
        resumen.total += detalle.subtotal;
        resumen.ventas.add(venta.id);
        resumenes.set(clave, resumen);
      }
    }

    return [...resumenes.values()]
      .map(resumen => ({
        categoriaId: resumen.categoriaId,
        categoriaNombre: resumen.categoriaNombre,
        cantidad: resumen.cantidad,
        total: redondear(resumen.total),
        ventas: resumen.ventas.size
      }))
      .sort((a, b) => a.categoriaNombre.localeCompare(b.categoriaNombre));
  }
}
