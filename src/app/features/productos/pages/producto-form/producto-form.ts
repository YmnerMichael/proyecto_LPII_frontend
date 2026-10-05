import { Component, Input, OnInit, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { obtenerMensajeError } from '../../../../core/utils/http-error';
import { Categoria } from '../../../categorias/models/categoria.model';
import { CategoriaService } from '../../../categorias/services/categoria.service';
import { Producto, ProductoRequest } from '../../models/producto.model';
import { ProductoService } from '../../services/producto.service';

@Component({
  selector: 'app-producto-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './producto-form.html',
  styleUrl: './producto-form.css'
})
export class ProductoForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly productosService = inject(ProductoService);
  private readonly categoriasService = inject(CategoriaService);
  private readonly router = inject(Router);

  @Input() id?: string;

  protected readonly esEdicion = signal(false);
  protected readonly cargando = signal(false);
  protected readonly guardando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly categorias = signal<Categoria[]>([]);
  protected readonly categoriaOriginalId = signal<number | null>(null);
  protected readonly categoriaSeleccionada = signal<number | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100), Validators.pattern(/\S/)]],
    descripcion: ['', [Validators.maxLength(200)]],
    precio: [0.01, [Validators.required, Validators.min(0.01)]],
    stock: [0, [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]],
    estado: [true, Validators.required],
    categoriaId: [0, [Validators.required, Validators.min(1)]]
  });

  protected readonly categoriasDisponibles = computed(() => {
    const categorias = this.categorias();
    const activas = categorias.filter(categoria => categoria.estado);
    const originalId = this.categoriaOriginalId();
    const originalInactiva = categorias.find(categoria => categoria.id === originalId && !categoria.estado);
    return originalInactiva ? [...activas, originalInactiva] : activas;
  });

  protected readonly categoriaInactiva = computed(() => {
    const categoriaId = this.categoriaSeleccionada();
    return categoriaId !== null &&
      this.categorias().some(categoria => categoria.id === categoriaId && !categoria.estado);
  });

  protected readonly hayCategoriasActivas = computed(() =>
    this.categorias().some(categoria => categoria.estado)
  );

  ngOnInit(): void {
    this.esEdicion.set(Boolean(this.id));
    this.cargando.set(true);

    if (this.id) {
      forkJoin({
        categorias: this.categoriasService.listar(),
        producto: this.productosService.obtenerPorId(Number(this.id))
      }).subscribe({
        next: ({ categorias, producto }) => {
          this.categorias.set(categorias);
          this.categoriaOriginalId.set(producto.categoriaId);
          this.form.patchValue({
            nombre: producto.nombre,
            descripcion: producto.descripcion ?? '',
            precio: producto.precio,
            stock: producto.stock,
            estado: producto.estado,
            categoriaId: producto.categoriaId
          });
          this.categoriaSeleccionada.set(producto.categoriaId);
          this.cargando.set(false);
        },
        error: err => this.fallarCarga(err)
      });
      return;
    }

    this.categoriasService.listar().subscribe({
      next: categorias => {
        this.categorias.set(categorias);
        this.cargando.set(false);
      },
      error: err => this.fallarCarga(err)
    });
  }

  cambiarCategoria(): void {
    this.categoriaSeleccionada.set(this.form.controls.categoriaId.value || null);
  }

  guardar(): void {
    if (this.form.invalid || this.cargando() || this.guardando() || this.categoriaInactiva()) {
      this.form.markAllAsTouched();
      return;
    }

    const datos: ProductoRequest = this.form.getRawValue();
    this.guardando.set(true);
    this.error.set(null);

    const peticion = this.esEdicion() && this.id
      ? this.productosService.actualizar(Number(this.id), datos)
      : this.productosService.crear(datos);

    peticion.subscribe({
      next: () => this.router.navigate(['/productos']),
      error: (err: HttpErrorResponse) => {
        this.error.set(obtenerMensajeError(err));
        this.guardando.set(false);
      }
    });
  }

  private fallarCarga(err: HttpErrorResponse): void {
    this.error.set(obtenerMensajeError(err));
    this.cargando.set(false);
  }
}
