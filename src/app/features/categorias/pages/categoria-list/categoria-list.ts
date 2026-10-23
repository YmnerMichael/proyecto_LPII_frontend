import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SiPermiso } from '../../../../shared/directives/si-permiso';
import { CategoriaService } from '../../services/categoria.service';
import { Categoria } from '../../models/categoria.model';
import { obtenerMensajeError } from '../../../../core/utils/http-error';

@Component({
  selector: 'app-categoria-list',
  standalone: true,
  imports: [RouterLink, SiPermiso],
  templateUrl: './categoria-list.html',
  styleUrl: './categoria-list.css'
})
export class CategoriaList implements OnInit {
  private readonly service = inject(CategoriaService);

  protected readonly categorias = signal<Categoria[]>([]);
  protected readonly filtro = signal('');
  protected readonly error = signal<string | null>(null);

  protected readonly filtradas = computed(() => {
    const texto = this.filtro().toLowerCase();
    return this.categorias().filter(c => c.nombre.toLowerCase().includes(texto));
  });

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.error.set(null);
    this.service.listar().subscribe({
      next: datos => this.categorias.set(datos),
      error: err => this.error.set(obtenerMensajeError(err))
    });
  }

  actualizarFiltro(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.filtro.set(input.value);
  }

  eliminar(id: number): void {
    if (confirm('¿Está seguro de eliminar esta categoría?')) {
      this.service.eliminar(id).subscribe({
        next: () => this.cargar(),
        error: err => alert(obtenerMensajeError(err))
      });
    }
  }
}