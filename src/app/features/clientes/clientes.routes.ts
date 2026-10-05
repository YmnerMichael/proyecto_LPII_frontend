import { Routes } from '@angular/router';
import { ClienteList } from './pages/cliente-list/cliente-list';
import { ClienteForm } from './pages/cliente-form/cliente-form';

export const CLIENTES_ROUTES: Routes = [
  { path: '', component: ClienteList },
  { path: 'nuevo', component: ClienteForm },
  { path: ':id/editar', component: ClienteForm }
];