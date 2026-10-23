import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth-service';

describe('AuthService', () => {
  let http: HttpTestingController;
  let auth: AuthService;

  beforeEach(() => {
    sessionStorage.removeItem('pharmasoft.sesion');
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    });
    http = TestBed.inject(HttpTestingController);
    auth = TestBed.inject(AuthService);
  });

  afterEach(() => {
    http.verify();
    vi.useRealTimers();
  });

  it('persists a successful login and exposes its permissions', () => {
    let result: unknown;
    auth.login({ username: 'vendedor', password: 'secret' }).subscribe(value => result = value);

    const request = http.expectOne(`${environment.apiUrl}/auth/login`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ username: 'vendedor', password: 'secret' });
    request.flush({
      token: 'signed-token',
      tipo: 'Bearer',
      expiraEnSegundos: 3600,
      username: 'vendedor',
      nombreCompleto: 'Lucía Fernández',
      roles: ['VENDEDOR'],
      permisos: ['CATALOGO_LEER', 'VENTAS_LEER']
    });

    expect(result).toMatchObject({
      token: 'signed-token',
      username: 'vendedor',
      roles: ['VENDEDOR'],
      permisos: ['CATALOGO_LEER', 'VENTAS_LEER']
    });
    expect(JSON.parse(sessionStorage.getItem('pharmasoft.sesion') ?? '{}')).toMatchObject({
      token: 'signed-token',
      username: 'vendedor'
    });
    expect(auth.tienePermiso('VENTAS_LEER')).toBe(true);
    expect(auth.tienePermiso('CATALOGO_ESCRIBIR')).toBe(false);
  });

  it('allows warehouse workers to read sales without granting write access', () => {
    auth.login({ username: 'almacen', password: 'secret' }).subscribe();
    http.expectOne(`${environment.apiUrl}/auth/login`).flush({
      token: 'warehouse-token',
      tipo: 'Bearer',
      expiraEnSegundos: 3600,
      username: 'almacen',
      nombreCompleto: 'Almacenero',
      roles: ['ALMACENERO'],
      permisos: ['CATALOGO_LEER', 'CATALOGO_ESCRIBIR']
    });

    expect(auth.tienePermiso('VENTAS_LEER')).toBe(true);
    expect(auth.tienePermiso('VENTAS_REGISTRAR')).toBe(false);
    expect(auth.tienePermiso('CLIENTES_LEER')).toBe(false);
  });

  it('discards malformed and expired sessions on startup', () => {
    sessionStorage.setItem('pharmasoft.sesion', '{bad json');
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    });
    const restoredAuth = TestBed.inject(AuthService);
    expect(restoredAuth.sesion()).toBeNull();
    expect(sessionStorage.getItem('pharmasoft.sesion')).toBeNull();

    sessionStorage.setItem('pharmasoft.sesion', JSON.stringify({
      token: 'expired-token',
      expiraEn: Date.now() - 1,
      username: 'vendedor',
      nombreCompleto: 'Lucía Fernández',
      roles: ['VENDEDOR'],
      permisos: ['VENTAS_LEER']
    }));
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    });
    expect(TestBed.inject(AuthService).sesion()).toBeNull();
    expect(sessionStorage.getItem('pharmasoft.sesion')).toBeNull();
  });

  it('expires the session and sends the user back to the requested page', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-22T12:00:00'));
    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    auth.login({ username: 'vendedor', password: 'secret' }).subscribe();
    http.expectOne(`${environment.apiUrl}/auth/login`).flush({
      token: 'short-lived-token',
      tipo: 'Bearer',
      expiraEnSegundos: 1,
      username: 'vendedor',
      nombreCompleto: 'Lucía Fernández',
      roles: ['VENDEDOR'],
      permisos: ['VENTAS_LEER']
    });
    vi.advanceTimersByTime(1000);

    expect(auth.sesion()).toBeNull();
    expect(sessionStorage.getItem('pharmasoft.sesion')).toBeNull();
    expect(TestBed.inject(Router).navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: { expirada: '1', returnUrl: '/' }
    });
  });
});
