import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  console.log('[AUTH INTERCEPTOR] Token:', token ? 'EXISTS' : 'MISSING', 'URL:', req.url);

  const headers: any = {
    'ngrok-skip-browser-warning': 'true'
  };

  if (token && !req.url.includes('/auth/')) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log('[AUTH INTERCEPTOR] Adding Authorization header');
  }

  const clonedRequest = req.clone({
    setHeaders: headers
  });

  return next(clonedRequest);
};
