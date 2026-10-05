import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ClienteService } from '../../services/cliente.service';
import { Cliente } from '../../models/cliente.model';
import { obtenerMensajeError } from '../../../../core/utils/http-error';

@Component({
  selector: 'app-cliente-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './cliente-list.html',
  styleUrl: './cliente-list.css'
})
export class ClienteList implements OnInit {
  private readonly service = inject(ClienteService);

  protected readonly clientes = signal<Cliente[]>([]);
  protected readonly filtro = signal('');
  protected readonly error = signal<string | null>(null);

  protected readonly filtrados = computed(() => {
    const texto = this.filtro().trim().toLowerCase();
    return this.clientes().filter(cliente =>
      [cliente.dni, cliente.nombres, cliente.apellidos, cliente.email]
        .some(valor => valor.toLowerCase().includes(texto))
    );
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.error.set(null);
    this.service.listar().subscribe({
      next: datos => this.clientes.set(datos),
      error: err => this.error.set(obtenerMensajeError(err))
    });
  }

  actualizarFiltro(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.filtro.set(input.value);
  }

  eliminar(id: number): void {
    if (confirm('¿Está seguro de eliminar este cliente?')) {
      this.service.eliminar(id).subscribe({
        next: () => this.cargar(),
        error: err => alert(obtenerMensajeError(err))
      });
    }
  }
}