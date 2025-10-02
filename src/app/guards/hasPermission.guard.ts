import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { PermissionsService } from '../services/permissions.service';
import { Permission } from '../models/permissions.model';

export const hasResourcePermission: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const permissionsService = inject(PermissionsService);
  const router = inject(Router);

  const resource = route.data['resource'] as string;
  const requiredPermissions = route.data['requiredPermissions'] as Permission[];

  if (!resource || !requiredPermissions) {
    console.warn('Route missing resource or requiredPermissions in data');
    return router.createUrlTree(['/auth/unauthorized']);
  }

  const hasPermission = requiredPermissions.length === 1
    ? permissionsService.hasResourcePermission(resource, requiredPermissions[0])
    : permissionsService.hasResourcePermissions(resource, requiredPermissions);

  if (!hasPermission) {
    return router.createUrlTree(['/auth/unauthorized']);
  }

  return true;
};