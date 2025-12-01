import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');
  const currentUserStr = localStorage.getItem('currentUser');
  console.log('[AUTH GUARD] Token:', token ? 'EXISTS' : 'MISSING', 'User:', currentUserStr ? 'EXISTS' : 'MISSING');

  if (!token || !currentUserStr) {
    router.navigate(['/login']);
    return false;
  }

  let userRole = '';
  try {
    const currentUser = JSON.parse(currentUserStr);
    userRole = currentUser.role || '';
  } catch (e) {
    router.navigate(['/login']);
    return false;
  }

  const requiredRoles = route.data['roles'] as string[];
  if (requiredRoles && requiredRoles.length > 0) {
    if (!requiredRoles.includes(userRole)) {
      router.navigate(['/dashboard']);
      return false;
    }
  }

  return true;
};
