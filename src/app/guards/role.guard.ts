import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { PermissionsService } from '../services/permissions.service';

/**
 * Generic role-based route guard
 * Checks if user has required role(s) specified in route data
 * Automatically includes admin bypass
 * 
 * Usage in routes:
 * - Single role: data: { role: 2 }
 * - Multiple roles: data: { roles: [2, 3] }
 */
export const hasRole: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const permissionsService = inject(PermissionsService);
  const router = inject(Router);

  // Check for single role
  const requiredRole = route.data['role'] as number;
  if (requiredRole) {
    if (permissionsService.hasRole(requiredRole)) {
      return true;
    }
    return router.createUrlTree(['/auth/unauthorized']);
  }

  // Check for multiple roles (user needs at least one)
  const requiredRoles = route.data['roles'] as number[];
  if (requiredRoles && requiredRoles.length > 0) {
    if (permissionsService.hasAnyRole(requiredRoles)) {
      return true;
    }
    return router.createUrlTree(['/auth/unauthorized']);
  }

  // No role specified - deny access
  console.warn(
    `Route missing role or roles in data. Route path: ${route.routeConfig?.path ?? '[unknown]'}, Route data: ${JSON.stringify(route.data)}`
  );
  return router.createUrlTree(['/auth/unauthorized']);
};
