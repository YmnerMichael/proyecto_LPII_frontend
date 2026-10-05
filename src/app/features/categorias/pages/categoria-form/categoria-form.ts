import { Component, OnInit, Input, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { CategoriaService } from '../../services/categoria.service';
import { Categoria, CategoriaRequest } from '../../models/categoria.model';
import { obtenerMensajeError } from '../../../../core/utils/http-error';

@Component({
  selector: 'app-categoria-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './categoria-form.html',
  styleUrl: './categoria-form.css'
})
export class CategoriaForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(CategoriaService);
  private readonly router = inject(Router);

  @Input() id?: string;

  protected readonly esEdicion = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(50)]],
    descripcion: ['', [Validators.maxLength(200)]],
    activo: [true]
  });

  ngOnInit(): void {
    if (this.id) {
      this.esEdicion.set(true);
      this.service.obtenerPorId(+this.id).subscribe({
        next: (cat: Categoria) => {
          this.form.patchValue({
            nombre: cat.nombre,
            descripcion: cat.descripcion,
            activo: cat.estado // Mapea 'estado' que viene del backend hacia 'activo' del formulario
          });
        },
        error: (err: HttpErrorResponse) => this.error.set(obtenerMensajeError(err))
      });
    }
  }

  guardar(): void {
    if (this.form.invalid) return;

    const val = this.form.value;

    // Construye el objeto exacto que espera CategoriaRequestDTO en Spring Boot
    const datos: CategoriaRequest = {
      nombre: val.nombre ?? '',
      descripcion: val.descripcion ?? '',
      estado: val.activo ?? true // Mapea 'activo' hacia 'estado'
    };

    const peticion = this.esEdicion() && this.id
      ? this.service.actualizar(+this.id, datos)
      : this.service.crear(datos);

    peticion.subscribe({
      next: () => this.router.navigate(['/categorias']),
      error: (err: HttpErrorResponse) => this.error.set(obtenerMensajeError(err))
    });
  }
}