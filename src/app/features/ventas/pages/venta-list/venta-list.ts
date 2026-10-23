import { CurrencyPipe, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth-service';
import { obtenerMensajeError } from '../../../../core/utils/http-error';
import { SiPermiso } from '../../../../shared/directives/si-permiso';
import { Cliente } from '../../../clientes/models/cliente.model';
import { ClienteService } from '../../../clientes/services/cliente.service';
import { EstadoVenta, FiltroVentas, Venta } from '../../models/venta.model';
import { VentaService } from '../../services/venta.service';
import { PaginaResponse } from '../../../../core/models/pagina-response';

@Component({
  selector: 'app-venta-list',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CurrencyPipe, DatePipe, SiPermiso],
  templateUrl: './venta-list.html',
  styleUrl: './venta-list.css'
})
export class VentaList implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly ventaService = inject(VentaService);
  private readonly clienteService = inject(ClienteService);

  protected readonly clientes = signal<Cliente[]>([]);
  protected readonly resultado = signal<PaginaResponse<Venta> | null>(null);
  protected readonly pagina = signal(0);
  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly ahora = signal(new Date());

  protected readonly filtros = this.fb.group({
    clienteId: this.fb.control<number | null>(null),
    estado: this.fb.control<EstadoVenta | null>(null),
    desde: this.fb.control<string | null>(null),
    hasta: this.fb.control<string | null>(null)
  });

  protected readonly totalPagina = computed(() =>
    (this.resultado()?.contenido ?? [])
      .filter(venta => venta.estado === 'REGISTRADA')
      .reduce((suma, venta) => suma + venta.total, 0)
  );

  ngOnInit(): void {
    if (this.auth.tienePermiso('CLIENTES_LEER')) {
      this.clienteService.listar().subscribe({
        next: clientes => this.clientes.set(clientes),
        error: (err: HttpErrorResponse) => this.error.set(obtenerMensajeError(err))
      });
    }
    this.cargar();
  }

  resumenFiltros(): string {
    const filtros = this.filtros.getRawValue();
    const cliente = this.clientes().find(actual => actual.id === filtros.clienteId);
    const partes = [
      cliente ? `cliente ${cliente.apellidos}, ${cliente.nombres}` : '',
      filtros.estado ? `estado ${filtros.estado}` : '',
      filtros.desde ? `desde ${filtros.desde}` : '',
      filtros.hasta ? `hasta ${filtros.hasta}` : ''
    ].filter(Boolean);
    return partes.length ? partes.join(' · ') : 'ninguno (todas las ventas)';
  }

  buscar(): void {
    const { desde, hasta } = this.filtros.getRawValue();
    if (desde && hasta && desde > hasta) {
      this.error.set('La fecha «desde» no puede ser posterior a la fecha «hasta».');
      return;
    }
    this.pagina.set(0);
    this.cargar();
  }

  limpiar(): void {
    this.filtros.reset();
    this.buscar();
  }

  irA(pagina: number): void {
    const resultado = this.resultado();
    if (resultado && pagina >= 0 && pagina < resultado.totalPaginas) {
      this.pagina.set(pagina);
      this.cargar();
    }
  }

  imprimirConsulta(): void {
    this.ahora.set(new Date());
    setTimeout(() => window.print());
  }

  private cargar(): void {
    const filtros: FiltroVentas = this.filtros.getRawValue();
    this.cargando.set(true);
    this.error.set(null);
    this.ventaService.buscar(filtros, this.pagina(), 10).subscribe({
      next: resultado => {
        this.resultado.set(resultado);
        this.cargando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(obtenerMensajeError(err));
        this.cargando.set(false);
      }
    });
  }
}
