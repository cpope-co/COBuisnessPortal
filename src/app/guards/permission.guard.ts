import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { PermissionsService } from '../services/permissions.service';
import { Permission } from '../models/permissions.model';

/**
 * Generic resource permission guard
 * Checks if user has required permission(s) for a specific resource
 * Automatically includes admin bypass
 * 
 * Usage in routes:
 * - Single permission: data: { resource: 'API1', requiredPermissions: [Permission.READ] }
 * - Multiple permissions: data: { resource: 'API1', requiredPermissions: [Permission.READ, Permission.UPDATE] }
 */
export const hasResourcePermission: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  
  const permissionsService = inject(PermissionsService);
  const router = inject(Router);

  // Guard against null or undefined route data
  if (!route.data) {
    console.warn('❌ [hasResourcePermission] Route data is missing');
    return router.createUrlTree(['/auth/unauthorized']);
  }

  let resource: string;
  let requiredPermissions: Permission[];
  
  try {
    resource = route.data['resource'] as string;
    requiredPermissions = route.data['requiredPermissions'] as Permission[];
  } catch (error) {
    console.error('❌ [hasResourcePermission] Error accessing route.data:', error);
    return router.createUrlTree(['/auth/unauthorized']);
  }

  if (!resource || !requiredPermissions || requiredPermissions.length === 0) {
    console.warn('❌ [hasResourcePermission] Route missing resource or requiredPermissions in data');
    return router.createUrlTree(['/auth/unauthorized']);
  }

  // Use centralized permission checking (includes admin bypass)
  const hasPermission = requiredPermissions.length === 1
    ? permissionsService.hasResourcePermission(resource, requiredPermissions[0])
    : permissionsService.hasResourcePermissions(resource, requiredPermissions);

  console.log('Has permission:', hasPermission);

  if (!hasPermission) {
    return router.createUrlTree(['/auth/unauthorized']);
  }

  return true;
};
