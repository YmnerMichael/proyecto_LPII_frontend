import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ClienteService } from '../../services/cliente.service';
import { ClienteForm } from './cliente-form';

describe('ClienteForm', () => {
  let component: ClienteForm;
  let fixture: ComponentFixture<ClienteForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClienteForm],
      providers: [
        provideRouter([]),
        { provide: ClienteService, useValue: { crear: () => of({}), actualizar: () => of({}), obtenerPorId: () => of({}) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ClienteForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});