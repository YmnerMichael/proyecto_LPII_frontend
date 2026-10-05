import { Component, OnInit, Input, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ClienteService } from '../../services/cliente.service';
import { Cliente, ClienteRequest } from '../../models/cliente.model';
import { obtenerMensajeError } from '../../../../core/utils/http-error';

@Component({
  selector: 'app-cliente-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './cliente-form.html',
  styleUrl: './cliente-form.css'
})
export class ClienteForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(ClienteService);
  private readonly router = inject(Router);

  @Input() id?: string;

  protected readonly esEdicion = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = this.fb.group({
    dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
    nombres: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100), Validators.pattern(/\S/)]],
    apellidos: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100), Validators.pattern(/\S/)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    telefono: ['', [Validators.pattern(/^\d{9}$/)]],
    direccion: ['', [Validators.maxLength(250)]],
    estado: [true]
  });

  ngOnInit(): void {
    if (this.id) {
      this.esEdicion.set(true);
      this.service.obtenerPorId(+this.id).subscribe({
        next: (cliente: Cliente) => this.form.patchValue({
          dni: cliente.dni,
          nombres: cliente.nombres,
          apellidos: cliente.apellidos,
          email: cliente.email,
          telefono: cliente.telefono,
          direccion: cliente.direccion,
          estado: cliente.estado
        }),
        error: (err: HttpErrorResponse) => this.error.set(obtenerMensajeError(err))
      });
    }
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valor = this.form.getRawValue();
    const datos: ClienteRequest = {
      dni: valor.dni ?? '',
      nombres: valor.nombres ?? '',
      apellidos: valor.apellidos ?? '',
      email: valor.email ?? '',
      telefono: valor.telefono?.trim() || null,
      direccion: valor.direccion ?? '',
      estado: valor.estado ?? true
    };

    const peticion = this.esEdicion() && this.id
      ? this.service.actualizar(+this.id, datos)
      : this.service.crear(datos);

    peticion.subscribe({
      next: () => this.router.navigate(['/clientes']),
      error: (err: HttpErrorResponse) => this.error.set(obtenerMensajeError(err))
    });
  }
}