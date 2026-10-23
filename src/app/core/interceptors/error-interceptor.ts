import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth-service';
import { environment } from '../../../environments/environment';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const esLogin = req.url.split('?')[0].endsWith('/auth/login');
      const esApi = req.url === environment.apiUrl || req.url.startsWith(`${environment.apiUrl}/`);
      if (error.status === 401 && esApi && !esLogin) {
        auth.cerrarSesion('expirada', router.url);
      }
      return throwError(() => error);
    })
  );
};
