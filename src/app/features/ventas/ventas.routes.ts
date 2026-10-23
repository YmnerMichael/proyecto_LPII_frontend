import { Routes } from '@angular/router';
import { permisoGuard } from '../../core/guards/permiso-guard';
import { VentaDetalle } from './pages/venta-detalle/venta-detalle';
import { VentaForm } from './pages/venta-form/venta-form';
import { VentaList } from './pages/venta-list/venta-list';

export const VENTAS_ROUTES: Routes = [
  { path: '', component: VentaList, title: 'Consulta de ventas' },
  {
    path: 'nueva',
    component: VentaForm,
    title: 'Nueva venta',
    canActivate: [permisoGuard],
    data: { permiso: 'VENTAS_REGISTRAR' }
  },
  { path: 'reporte-categorias', redirectTo: '/reportes/ventas-por-categoria', pathMatch: 'full' },
  { path: ':id', component: VentaDetalle, title: 'Detalle de venta' }
];
