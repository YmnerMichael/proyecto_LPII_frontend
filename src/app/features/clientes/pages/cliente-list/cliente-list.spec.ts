import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ClienteService } from '../../services/cliente.service';
import { ClienteList } from './cliente-list';

describe('ClienteList', () => {
  let component: ClienteList;
  let fixture: ComponentFixture<ClienteList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClienteList],
      providers: [
        provideRouter([]),
        { provide: ClienteService, useValue: { listar: () => of([]), eliminar: () => of(void 0) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ClienteList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});