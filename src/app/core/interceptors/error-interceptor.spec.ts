import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth-service';
import { errorInterceptor } from './error-interceptor';

describe('errorInterceptor', () => {
  let http: HttpTestingController;
  let cerrarSesion: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    cerrarSesion = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: AuthService,
          useValue: { sesion: () => ({ token: 'token' }), cerrarSesion }
        }
      ]
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('closes an authenticated session on 401 and preserves the original error', () => {
    let status: number | undefined;
    TestBed.inject(HttpClient).get(`${environment.apiUrl}/productos`).subscribe({
      error: error => status = error.status
    });
    http.expectOne(`${environment.apiUrl}/productos`).flush(null, {
      status: 401,
      statusText: 'Unauthorized'
    });

    expect(cerrarSesion).toHaveBeenCalledWith('expirada', '/');
    expect(status).toBe(401);
  });

  it('does not close a session for 403 or for a failed login', () => {
    TestBed.inject(HttpClient).get(`${environment.apiUrl}/productos`).subscribe({ error: () => undefined });
    http.expectOne(`${environment.apiUrl}/productos`).flush(null, {
      status: 403,
      statusText: 'Forbidden'
    });

    TestBed.inject(HttpClient).post(`${environment.apiUrl}/auth/login`, {}).subscribe({ error: () => undefined });
    http.expectOne(`${environment.apiUrl}/auth/login`).flush(null, {
      status: 401,
      statusText: 'Unauthorized'
    });

    expect(cerrarSesion).not.toHaveBeenCalled();
  });
});
