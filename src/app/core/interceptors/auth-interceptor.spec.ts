import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth-service';
import { authInterceptor } from './auth-interceptor';

describe('authInterceptor', () => {
  it('adds a bearer token only to protected API calls', () => {
    const auth = { token: () => 'sample-token' };
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: auth }
      ]
    });
    const http = TestBed.inject(HttpTestingController);
    const client = TestBed.inject(HttpClient);

    client.get(`${environment.apiUrl}/productos`).subscribe();
    expect(http.expectOne(`${environment.apiUrl}/productos`).request.headers.get('Authorization'))
      .toBe('Bearer sample-token');

    client.post(`${environment.apiUrl}/auth/login`, {}).subscribe();
    expect(http.expectOne(`${environment.apiUrl}/auth/login`).request.headers.has('Authorization'))
      .toBe(false);

    client.get('https://other.example/api/data').subscribe();
    expect(http.expectOne('https://other.example/api/data').request.headers.has('Authorization'))
      .toBe(false);
    http.verify();
  });
});
