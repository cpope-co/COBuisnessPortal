import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { PermissionsService } from '../services/permissions.service';
import { Permission } from '../models/permissions.model';

export const hasResourcePermission: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const permissionsService = inject(PermissionsService);
  const router = inject(Router);

  let resource: string;
  let requiredPermissions: Permission[];
  
  try {
    resource = route.data['resource'] as string;
    requiredPermissions = route.data['requiredPermissions'] as Permission[];
  } catch (error) {
    console.error('❌ [hasPermission.guard] Error accessing route.data:', error);
    return router.createUrlTree(['/auth/unauthorized']);
  }

  if (!resource || !requiredPermissions) {
    console.warn('❌ [hasPermission.guard] Route missing resource or requiredPermissions in data');
    return router.createUrlTree(['/auth/unauthorized']);
  }

  // Use centralized permission checking (includes admin bypass)
  const hasPermission = requiredPermissions.length === 1
    ? permissionsService.hasResourcePermission(resource, requiredPermissions[0])
    : permissionsService.hasResourcePermissions(resource, requiredPermissions);

  if (!hasPermission) {
    return router.createUrlTree(['/auth/unauthorized']);
  }
  return true;
};