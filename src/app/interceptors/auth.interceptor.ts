import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  console.log('[AUTH INTERCEPTOR] Token:', token ? 'EXISTS' : 'MISSING', 'URL:', req.url);

  // Crear headers base con ngrok skip
  const headers: any = {
    'ngrok-skip-browser-warning': 'true'
  };

  // Agregar Authorization si existe token
  if (token && !req.url.includes('/auth/')) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log('[AUTH INTERCEPTOR] Adding Authorization header');
  }

  const clonedRequest = req.clone({
    setHeaders: headers
  });

  return next(clonedRequest);
};
