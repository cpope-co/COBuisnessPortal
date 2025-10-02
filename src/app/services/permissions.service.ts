import { Injectable, signal, computed } from '@angular/core';
import { UserPermissions, Permission, PermissionHelper } from '../models/permissions.model';

@Injectable({
  providedIn: 'root'
})
export class PermissionsService {
  private static readonly PERMISSIONS_STORAGE_KEY = 'userPermissions';
  
  private userPermissionsSignal = signal<UserPermissions | null>(null);
  
  // Computed signal for reactive access
  public userPermissions = this.userPermissionsSignal.asReadonly();

  constructor() {
    // Restore permissions from sessionStorage on service initialization
    this.restorePermissionsFromStorage();
  }

  private restorePermissionsFromStorage(): void {
    try {
      const storedPermissions = sessionStorage.getItem(PermissionsService.PERMISSIONS_STORAGE_KEY);
      if (storedPermissions) {
        const permissions = JSON.parse(storedPermissions) as UserPermissions;
        this.userPermissionsSignal.set(permissions);
      }
    } catch (error) {
      console.warn('Failed to restore permissions from storage:', error);
      sessionStorage.removeItem(PermissionsService.PERMISSIONS_STORAGE_KEY);
    }
  }

  setUserPermissions(permissions: UserPermissions): void {
    this.userPermissionsSignal.set(permissions);
    // Store permissions in sessionStorage
    try {
      sessionStorage.setItem(PermissionsService.PERMISSIONS_STORAGE_KEY, JSON.stringify(permissions));
    } catch (error) {
      console.warn('Failed to store permissions in sessionStorage:', error);
    }
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
    sessionStorage.removeItem(PermissionsService.PERMISSIONS_STORAGE_KEY);
  }
}