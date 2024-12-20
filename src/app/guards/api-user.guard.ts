import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

export const isUserApiUser: CanActivateFn = 
(route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  if(authService.isApiUser()) {
    router.navigate(['/apiuser/api-token-management']);
    return true;
  } else {
    router.navigate(['/auth/unauthorized']);
    return false
  }
  
  return true;
};