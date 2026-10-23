import { DatePipe } from '@angular/common';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import { AuthService } from '../../core/auth/auth-service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  protected readonly auth = inject(AuthService);
  @Output() toggleMenu = new EventEmitter<void>();

  salir(): void {
    this.auth.cerrarSesion();
  }
}