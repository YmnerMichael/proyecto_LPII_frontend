import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ClienteService } from '../../../clientes/services/cliente.service';
import { ProductoService } from '../../../productos/services/producto.service';
import { VentaService } from '../../services/venta.service';
import { VentaForm } from './venta-form';

describe('VentaForm', () => {
  let fixture: ComponentFixture<VentaForm>;
  let registrar: ReturnType<typeof vi.fn>;
  let navegar: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    registrar = vi.fn(() => of({ id: 10 }));
    await TestBed.configureTestingModule({
      imports: [VentaForm],
      providers: [
        provideRouter([]),
        {
          provide: ClienteService,
          useValue: {
            listar: () => of([{
              id: 1,
              dni: '12345678',
              nombres: 'Ana',
              apellidos: 'Huamán Pérez',
              email: 'ana@example.com',
              telefono: null,
              direccion: '',
              estado: true
            }])
          }
        },
        {
          provide: ProductoService,
          useValue: {
            listar: () => of([{
              id: 8,
              nombre: 'Paracetamol 500 mg',
              descripcion: '',
              precio: 2.5,
              stock: 10,
              estado: true,
              categoriaId: 3,
              categoriaNombre: 'Analgésicos'
            }])
          }
        },
        { provide: VentaService, useValue: { registrar } }
      ]
    }).compileComponents();
    navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(VentaForm);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('searches without accents, calculates totals, and sends the sale only after confirmation', () => {
    const clienteInput = fixture.nativeElement.querySelector(
      'input[aria-label="Buscar cliente"]'
    ) as HTMLInputElement;
    clienteInput.value = 'huaman';
    clienteInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const clienteResultado = fixture.nativeElement.querySelector('.resultados button') as HTMLButtonElement;
    expect(clienteResultado.textContent).toContain('Huamán');
    clienteResultado.click();
    fixture.detectChanges();

    const productoInput = fixture.nativeElement.querySelector(
      'input[aria-label="Buscar producto"]'
    ) as HTMLInputElement;
    productoInput.value = 'para 500';
    productoInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('.resultados button') as HTMLButtonElement).click();
    fixture.detectChanges();

    const cantidad = fixture.nativeElement.querySelector('input[formControlName="cantidad"]') as HTMLInputElement;
    cantidad.value = '3';
    cantidad.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('7.50');
    (fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('¿Confirma el registro de la venta?');
    expect(registrar).not.toHaveBeenCalled();

    const botones = [...fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>];
    botones.find(button => button.textContent?.includes('Confirmar venta'))?.click();
    fixture.detectChanges();

    expect(registrar).toHaveBeenCalledWith({
      clienteId: 1,
      detalles: [{ productoId: 8, cantidad: 3 }]
    });
    expect(navegar).toHaveBeenCalledWith(
      ['/ventas', 10],
      { queryParams: { nueva: 1, imprimir: 1 } }
    );
  });
});
