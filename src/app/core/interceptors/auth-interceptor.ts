import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth-service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const esLogin = req.url.split('?')[0].endsWith('/auth/login');
  const esApi = req.url === environment.apiUrl || req.url.startsWith(`${environment.apiUrl}/`);
  const token = inject(AuthService).token();

  if (!token || !esApi || esLogin) return next(req);
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
