export interface ResourcePermission {
  resource: string;
  per: number;
}

export interface UserPermissions {
  resources: ResourcePermission[];
}

export enum Permission {
  CREATE = 8,  
  READ = 4,    
  UPDATE = 2,  
  DELETE = 1 
}

export class PermissionHelper {
  static hasPermission(userPermissions: number, requiredPermission: Permission): boolean {
    return (userPermissions & requiredPermission) === requiredPermission;
  }

  static hasAnyPermission(userPermissions: number, requiredPermissions: Permission[]): boolean {
    return requiredPermissions.some(permission => this.hasPermission(userPermissions, permission));
  }

  static hasAllPermissions(userPermissions: number, requiredPermissions: Permission[]): boolean {
    return requiredPermissions.every(permission => this.hasPermission(userPermissions, permission));
  }
}