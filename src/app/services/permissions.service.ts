import { Injectable, signal, computed } from '@angular/core';
import { UserPermissions, Permission, PermissionHelper } from '../models/permissions.model';

@Injectable({
  providedIn: 'root'
})
export class PermissionsService {
  private static readonly PERMISSIONS_STORAGE_KEY = 'userPermissions';
  private static readonly USER_STORAGE_KEY = 'user';
  
  private userPermissionsSignal = signal<UserPermissions | null>(null);

  private userSignal = signal<any | null>(null);

  // Computed signal for reactive access
  public userPermissions = this.userPermissionsSignal.asReadonly();
  public user = this.userSignal.asReadonly();

  constructor() {
    // Restore permissions and user from sessionStorage on service initialization
    this.restorePermissionsFromStorage();
    this.restoreUserFromStorage();
  }

  /**
   * Check if the current user is an admin (role = 1)
   * Admin users have unrestricted access to all resources and routes
   */
  isUserAdmin(): boolean {
    const user = this.userSignal();
    return user?.role === 1;
  }

  /**
   * Check if user has a specific role
   * @param role - The role number to check (1=Admin, 2=Customer, 3=Vendor, 4=Employee, 5=API User)
   */
  hasRole(role: number): boolean {
    // Admin can access everything
    if (this.isUserAdmin()) {
      return true;
    }

    const user = this.userSignal();
    return user?.role === role;
  }

  /**
   * Check if user has any of the specified roles
   * @param roles - Array of role numbers to check against
   */
  hasAnyRole(roles: number[]): boolean {
    // Admin can access everything
    if (this.isUserAdmin()) {
      return true;
    }

    return roles.some(role => this.hasRole(role));
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

  private restoreUserFromStorage(): void {
    try {
      const userJson = sessionStorage.getItem(PermissionsService.USER_STORAGE_KEY);
      if (userJson) {
        const user = JSON.parse(userJson);
        this.userSignal.set(user);
      }
    } catch (error) {
      console.warn('Failed to restore user from storage:', error);
      sessionStorage.removeItem(PermissionsService.USER_STORAGE_KEY);
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
    // Admin users (role = 1) have access to all resources
    if (this.isUserAdmin()) {
      return true;
    }

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
    // Admin users (role = 1) have access to all resources
    if (this.isUserAdmin()) {
      return true;
    }

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