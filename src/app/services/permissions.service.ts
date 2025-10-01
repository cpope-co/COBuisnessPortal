import { Injectable, signal, computed } from '@angular/core';
import { UserPermissions, Permission, PermissionHelper } from '../models/permissions.model';

@Injectable({
  providedIn: 'root'
})
export class PermissionsService {
  private userPermissionsSignal = signal<UserPermissions | null>(null);
  
  // Computed signal for reactive access
  public userPermissions = this.userPermissionsSignal.asReadonly();

  setUserPermissions(permissions: UserPermissions): void {
    this.userPermissionsSignal.set(permissions);
  }

  getUserPermissions(): UserPermissions | null {
    const permissions = this.userPermissionsSignal();
    return permissions;
  }

  hasResourcePermission(resource: string, requiredPermission: Permission): boolean {
    const permissions = this.getUserPermissions();
    if (!permissions) {
      return false;
    }

    const resourcePermission = permissions.resources.find(r => r.resource === resource);
    if (!resourcePermission) {
      return false;
    }

    const hasPermission = PermissionHelper.hasPermission(resourcePermission.per, requiredPermission);
    return hasPermission;
  }

  hasResourcePermissions(resource: string, requiredPermissions: Permission[]): boolean {
    const permissions = this.getUserPermissions();
    if (!permissions) return false;

    const resourcePermission = permissions.resources.find(r => r.resource === resource);
    if (!resourcePermission) return false;

    return PermissionHelper.hasAllPermissions(resourcePermission.per, requiredPermissions);
  }

  // Computed signal for checking if user has any permissions
  isAuthenticated = computed(() => this.userPermissions() !== null);

  // Computed signal factory for resource permissions
  createResourcePermissionSignal(resource: string, requiredPermission: Permission) {
    return computed(() => this.hasResourcePermission(resource, requiredPermission));
  }

  // Computed signal factory for multiple resource permissions
  createResourcePermissionsSignal(resource: string, requiredPermissions: Permission[]) {
    return computed(() => this.hasResourcePermissions(resource, requiredPermissions));
  }

  clearPermissions(): void {
    this.userPermissionsSignal.set(null);
  }
}