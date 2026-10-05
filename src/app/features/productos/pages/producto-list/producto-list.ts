import { Component, Input, OnInit, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CategoriaService } from '../../../categorias/services/categoria.service';
import { Categoria } from '../../../categorias/models/categoria.model';
import { obtenerMensajeError } from '../../../../core/utils/http-error';
import { Direccion, OrdenProducto, Producto } from '../../models/producto.model';
import { ProductoService } from '../../services/producto.service';

@Component({
  selector: 'app-producto-list',
  standalone: true,
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './producto-list.html',
  styleUrl: './producto-list.css'
})
export class ProductoList implements OnInit {
  private readonly productosService = inject(ProductoService);
  private readonly categoriasService = inject(CategoriaService);

  @Input() categoriaId?: string;

  protected readonly resultado = signal<Producto[] | null>(null);
  protected readonly categorias = signal<Categoria[]>([]);
  protected readonly pagina = signal(0);
  protected readonly tamano = signal(10);
  protected readonly ordenarPor = signal<OrdenProducto>('nombre');
  protected readonly direccion = signal<Direccion>('asc');
  protected readonly categoriaFiltro = signal<number | null>(null);
  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly notaFiltro = signal<string | null>(null);

  protected readonly productosFiltrados = computed(() => {
    const contenido = this.resultado() ?? [];
    const categoriaId = this.categoriaFiltro();
    const filtrados = categoriaId === null
      ? contenido
      : contenido.filter(producto => producto.categoriaId === categoriaId);
    const orden = this.ordenarPor();
    const factor = this.direccion() === 'asc' ? 1 : -1;
    return [...filtrados].sort((a, b) => {
      const valorA = a[orden];
      const valorB = b[orden];
      if (typeof valorA === 'string' && typeof valorB === 'string') {
        return valorA.localeCompare(valorB) * factor;
      }
      return (Number(valorA) - Number(valorB)) * factor;
    });
  });
  protected readonly totalPaginas = computed(() =>
    Math.max(1, Math.ceil(this.productosFiltrados().length / this.tamano()))
  );
  protected readonly productos = computed(() => {
    const inicio = this.pagina() * this.tamano();
    return this.productosFiltrados().slice(inicio, inicio + this.tamano());
  });

  ngOnInit(): void {
    this.categoriasService.listar().subscribe({
      next: categorias => this.categorias.set(categorias),
      error: err => this.error.set(obtenerMensajeError(err))
    });

    let filtroInvalido = false;
    if (this.categoriaId) {
      const idNum = Number(this.categoriaId);
      if (Number.isSafeInteger(idNum) && idNum > 0) {
        this.categoriaFiltro.set(idNum);
        this.tamano.set(100);
        this.notaFiltro.set('Mostrando productos de la categoría seleccionada; hasta 100 productos por página.');
      } else {
        filtroInvalido = true;
      }
    }

    this.cargar();
    if (filtroInvalido) {
      this.error.set('El identificador de categoría de la URL no es válido.');
    }
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.productosService.listar().subscribe({
        next: productos => {
          this.resultado.set(productos);
          this.cargando.set(false);
        },
        error: err => {
          this.error.set(obtenerMensajeError(err));
          this.cargando.set(false);
        }
      });
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 0 && pagina < this.totalPaginas() && pagina !== this.pagina()) {
      this.pagina.set(pagina);
    }
  }

  cambiarTamano(event: Event): void {
    const valor = Number((event.target as HTMLSelectElement).value);
    if (![5, 10, 20, 100].includes(valor)) return;
    this.tamano.set(valor);
    this.pagina.set(0);
  }

  cambiarCategoria(event: Event): void {
    const valor = (event.target as HTMLSelectElement).value;
    this.categoriaFiltro.set(valor === '' ? null : Number(valor));
    this.pagina.set(0);
  }

  ordenar(campo: OrdenProducto): void {
    if (this.ordenarPor() === campo) {
      this.direccion.update(actual => actual === 'asc' ? 'desc' : 'asc');
    } else {
      this.ordenarPor.set(campo);
      this.direccion.set('asc');
    }
    this.pagina.set(0);
  }

  eliminar(producto: Producto): void {
    if (!producto.estado || !confirm(`¿Está seguro de dar de baja el producto "${producto.nombre}"?`)) {
      return;
    }

    this.productosService.eliminar(producto.id).subscribe({
      next: () => this.cargar(),
      error: err => this.error.set(obtenerMensajeError(err))
    });
  }
}
