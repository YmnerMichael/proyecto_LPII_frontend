import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Permiso } from '../../core/auth/auth.model';
import { AuthService } from '../../core/auth/auth-service';
import { Sidebar } from './sidebar';

describe('Sidebar', () => {
  let component: Sidebar;
  let fixture: ComponentFixture<Sidebar>;
  let permisos: Set<Permiso>;

  beforeEach(async () => {
    permisos = new Set();
    await TestBed.configureTestingModule({
      imports: [Sidebar],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { tienePermiso: (permiso: Permiso) => permisos.has(permiso) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Sidebar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows only the catalog and sales allowed for a salesperson', () => {
    permisos = new Set(['CATALOGO_LEER', 'CLIENTES_LEER', 'VENTAS_LEER', 'VENTAS_REGISTRAR']);
    fixture.detectChanges();

    const links = Array.from(
      fixture.nativeElement.querySelectorAll('a') as NodeListOf<HTMLAnchorElement>
    ).map(
      link => link.getAttribute('href')
    );
    expect(links).toEqual(['/inicio', '/categorias', '/productos', '/ventas']);
  });

  it('shows catalog and read-only sales for a warehouse worker', () => {
    permisos = new Set(['CATALOGO_LEER', 'CATALOGO_ESCRIBIR', 'VENTAS_LEER']);
    fixture.detectChanges();

    const links = Array.from(
      fixture.nativeElement.querySelectorAll('a') as NodeListOf<HTMLAnchorElement>
    ).map(
      link => link.getAttribute('href')
    );
    expect(links).toEqual(['/inicio', '/categorias', '/productos', '/ventas']);
  });

  it('shows all modules for an administrator', () => {
    permisos = new Set([
      'CATALOGO_LEER',
      'CATALOGO_ESCRIBIR',
      'CLIENTES_LEER',
      'CLIENTES_ESCRIBIR',
      'VENTAS_LEER',
      'VENTAS_REGISTRAR',
      'REPORTES_VER',
      'USUARIOS_ADMINISTRAR'
    ]);
    fixture.detectChanges();

    const links = Array.from(
      fixture.nativeElement.querySelectorAll('a') as NodeListOf<HTMLAnchorElement>
    ).map(
      link => link.getAttribute('href')
    );
    expect(links).toEqual([
      '/inicio',
      '/categorias',
      '/clientes',
      '/productos',
      '/ventas',
      '/reportes/ventas-por-categoria'
    ]);
  });
});
