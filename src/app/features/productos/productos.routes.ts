import { Routes } from '@angular/router';
import { ProductoList } from './pages/producto-list/producto-list';
import { ProductoForm } from './pages/producto-form/producto-form';

export const PRODUCTOS_ROUTES: Routes = [
  { path: '', component: ProductoList },
  { path: 'nuevo', component: ProductoForm },
  { path: ':id/editar', component: ProductoForm }
];
