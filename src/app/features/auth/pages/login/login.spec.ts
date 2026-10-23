import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '../../../../core/auth/auth-service';
import { Login } from './login';

describe('Login', () => {
  let fixture: ComponentFixture<Login>;
  let login: ReturnType<typeof vi.fn>;
  let navigateByUrl: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    login = vi.fn(() => of({
      token: 'token',
      expiraEn: Date.now() + 60_000,
      username: 'vendedor',
      nombreCompleto: 'Lucía Fernández',
      roles: ['VENDEDOR'],
      permisos: ['VENTAS_LEER']
    }));
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { login } }
      ]
    }).compileComponents();
    navigateByUrl = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    fixture = TestBed.createComponent(Login);
  });

  function fillCredentials(): void {
    const usuario = fixture.nativeElement.querySelector('#username') as HTMLInputElement;
    const clave = fixture.nativeElement.querySelector('#password') as HTMLInputElement;
    usuario.value = 'vendedor';
    usuario.dispatchEvent(new Event('input', { bubbles: true }));
    clave.value = 'clave';
    clave.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
  }

  it('validates empty fields without making a login request', () => {
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(login).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelectorAll('.field-error')).toHaveLength(2);
  });

  it('uses one generic message for invalid credentials', async () => {
    login.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 401 })));
    fixture.detectChanges();
    fillCredentials();
    (fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Usuario o contraseña incorrectos.');
    expect(fixture.nativeElement.textContent).not.toContain('401');
    expect(navigateByUrl).not.toHaveBeenCalled();
  });

  it('accepts internal return URLs and rejects external redirects', async () => {
    fixture.componentRef.setInput('returnUrl', '/ventas');
    fixture.detectChanges();
    fillCredentials();
    (fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(navigateByUrl).toHaveBeenCalledWith('/ventas');

    navigateByUrl.mockClear();
    login.mockClear();
    login.mockReturnValue(of({
      token: 'token',
      expiraEn: Date.now() + 60_000,
      username: 'vendedor',
      nombreCompleto: 'Lucía Fernández',
      roles: ['VENDEDOR'],
      permisos: ['VENTAS_LEER']
    }));
    fixture.destroy();
    fixture = TestBed.createComponent(Login);
    fixture.componentRef.setInput('returnUrl', '//example.invalid');
    fixture.detectChanges();
    fillCredentials();
    (fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(navigateByUrl).toHaveBeenCalledWith('/inicio');
  });
});
