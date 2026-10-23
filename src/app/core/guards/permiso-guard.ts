import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { esPermiso } from '../auth/auth.model';
import { AuthService } from '../auth/auth-service';

export const permisoGuard: CanActivateFn = route => {
  const permiso = route.data['permiso'];
  if (esPermiso(permiso) && inject(AuthService).tienePermiso(permiso)) return true;
  return inject(Router).createUrlTree(['/acceso-denegado']);
};
