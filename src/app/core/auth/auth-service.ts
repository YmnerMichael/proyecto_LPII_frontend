import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { map, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, Permiso, Sesion, esPermiso } from './auth.model';

const CLAVE_SESION = 'pharmasoft.sesion';
const MAX_TIMEOUT = 2_147_483_647;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly session = signal<Sesion | null>(this.readSavedSession());
  private timer?: ReturnType<typeof setTimeout>;

  readonly sesion = this.session.asReadonly();
  readonly autenticado = computed(() => {
    const sesion = this.session();
    return Boolean(sesion && Date.now() < sesion.expiraEn);
  });

  constructor() {
    const sesion = this.session();
    if (sesion) this.scheduleExpiration(sesion);
  }

  login(credentials: LoginRequest): Observable<Sesion> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, credentials).pipe(
      map(response => {
        if (
          !response ||
          typeof response.token !== 'string' ||
          response.token.length === 0 ||
          !Number.isFinite(response.expiraEnSegundos) ||
          response.expiraEnSegundos <= 0 ||
          typeof response.username !== 'string' ||
          typeof response.nombreCompleto !== 'string' ||
          !Array.isArray(response.roles) ||
          !response.roles.every(rol => typeof rol === 'string') ||
          !Array.isArray(response.permisos) ||
          !response.permisos.every(esPermiso)
        ) {
          throw new Error('El backend devolvió una respuesta de inicio de sesión no válida.');
        }

        return {
          token: response.token,
          expiraEn: Date.now() + response.expiraEnSegundos * 1000,
          username: response.username,
          nombreCompleto: response.nombreCompleto,
          roles: response.roles,
          permisos: response.permisos
        };
      }),
      tap(sesion => this.startSession(sesion))
    );
  }

  cerrarSesion(motivo?: 'expirada', volverA?: string): void {
    clearTimeout(this.timer);
    this.timer = undefined;
    sessionStorage.removeItem(CLAVE_SESION);
    this.session.set(null);

    const queryParams: Record<string, string> = {};
    if (motivo) queryParams['expirada'] = '1';
    if (volverA && volverA !== '/login') queryParams['returnUrl'] = volverA;
    void this.router.navigate(['/login'], { queryParams });
  }

  token(): string | null {
    const sesion = this.session();
    return sesion && Date.now() < sesion.expiraEn ? sesion.token : null;
  }

  tienePermiso(permiso: Permiso): boolean {
    const sesion = this.session();
    if (!this.autenticado() || !sesion) return false;

    return (
      sesion.permisos.includes(permiso) ||
      (permiso === 'VENTAS_LEER' && sesion.roles.includes('ALMACENERO'))
    );
  }

  private startSession(sesion: Sesion): void {
    sessionStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
    this.session.set(sesion);
    this.scheduleExpiration(sesion);
  }

  private scheduleExpiration(sesion: Sesion): void {
    clearTimeout(this.timer);
    const restante = sesion.expiraEn - Date.now();
    this.timer = setTimeout(() => {
      if (this.session()?.token !== sesion.token) return;
      if (Date.now() >= sesion.expiraEn) {
        this.cerrarSesion('expirada', this.router.url);
      } else {
        this.scheduleExpiration(sesion);
      }
    }, Math.min(Math.max(restante, 0), MAX_TIMEOUT));
  }

  private readSavedSession(): Sesion | null {
    const stored = sessionStorage.getItem(CLAVE_SESION);
    if (!stored) return null;

    let value: unknown;
    try {
      value = JSON.parse(stored);
    } catch (error) {
      if (!(error instanceof SyntaxError)) throw error;
      sessionStorage.removeItem(CLAVE_SESION);
      return null;
    }

    if (!this.isSession(value) || Date.now() >= value.expiraEn) {
      sessionStorage.removeItem(CLAVE_SESION);
      return null;
    }
    return value;
  }

  private isSession(value: unknown): value is Sesion {
    if (typeof value !== 'object' || value === null) return false;
    const sesion = value as Record<string, unknown>;
    return (
      typeof sesion['token'] === 'string' &&
      sesion['token'].length > 0 &&
      typeof sesion['expiraEn'] === 'number' &&
      Number.isFinite(sesion['expiraEn']) &&
      typeof sesion['username'] === 'string' &&
      typeof sesion['nombreCompleto'] === 'string' &&
      Array.isArray(sesion['roles']) &&
      sesion['roles'].every(rol => typeof rol === 'string') &&
      Array.isArray(sesion['permisos']) &&
      sesion['permisos'].every(esPermiso)
    );
  }
}
