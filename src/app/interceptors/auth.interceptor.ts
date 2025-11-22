import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  console.log('[AUTH INTERCEPTOR] Token:', token ? 'EXISTS' : 'MISSING', 'URL:', req.url);

  if (token && !req.url.includes('/auth/')) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('[AUTH INTERCEPTOR] Adding Authorization header');
    return next(clonedRequest);
  }

  console.log('[AUTH INTERCEPTOR] NOT adding Authorization header');
  return next(req);
};
