import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { obtenerMensajeError } from '../../../../core/utils/http-error';
import { redondear } from '../../../../core/utils/numeros';
import { ReporteService } from '../../services/reporte-service';
import { VentaPorCategoria } from '../../models/reporte.model';

@Component({
  selector: 'app-ventas-categoria',
  standalone: true,
  imports: [ReactiveFormsModule, CurrencyPipe, DecimalPipe],
  templateUrl: './ventas-categoria.html',
  styleUrl: './ventas-categoria.css'
})
export class VentasCategoria implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly reporteService = inject(ReporteService);

  protected readonly filas = signal<VentaPorCategoria[]>([]);
  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly generado = signal(false);
  protected readonly filtros = this.fb.group({
    desde: this.fb.control<string | null>(null),
    hasta: this.fb.control<string | null>(null)
  });

  protected readonly montoMaximo = computed(() =>
    Math.max(0, ...this.filas().map(fila => fila.montoTotal))
  );
  protected readonly totalUnidades = computed(() =>
    this.filas().reduce((total, fila) => total + fila.cantidadVendida, 0)
  );
  protected readonly montoTotal = computed(() =>
    redondear(this.filas().reduce((total, fila) => total + fila.montoTotal, 0))
  );

  ngOnInit(): void {
    this.generar();
  }

  generar(): void {
    const { desde, hasta } = this.filtros.getRawValue();
    if (desde && hasta && desde > hasta) {
      this.error.set('La fecha «desde» no puede ser posterior a la fecha «hasta».');
      return;
    }

    this.cargando.set(true);
    this.error.set(null);
    this.filas.set([]);
    this.reporteService.ventasPorCategoria(desde, hasta).subscribe({
      next: filas => {
        this.filas.set(filas);
        this.generado.set(true);
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
    this.generar();
  }

  anchoBarra(fila: VentaPorCategoria): number {
    const maximo = this.montoMaximo();
    return maximo > 0 ? Math.min(100, Math.max(0, fila.montoTotal / maximo * 100)) : 0;
  }
}
