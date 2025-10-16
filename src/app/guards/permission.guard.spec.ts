import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { hasResourcePermission } from './permission.guard';
import { PermissionsService } from '../services/permissions.service';
import { Permission } from '../models/permissions.model';

describe('hasResourcePermission Guard', () => {
  let permissionsService: jasmine.SpyObj<PermissionsService>;
  let router: jasmine.SpyObj<Router>;
  let mockRoute: ActivatedRouteSnapshot;

  beforeEach(() => {
    const permissionsServiceSpy = jasmine.createSpyObj('PermissionsService', [
      'hasResourcePermission',
      'hasResourcePermissions'
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['createUrlTree']);

    TestBed.configureTestingModule({
      providers: [
        { provide: PermissionsService, useValue: permissionsServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    permissionsService = TestBed.inject(PermissionsService) as jasmine.SpyObj<PermissionsService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    // Create a mock ActivatedRouteSnapshot
    mockRoute = {
      data: {}
    } as ActivatedRouteSnapshot;
  });

  describe('when route is missing resource or requiredPermissions', () => {
    it('should redirect to unauthorized when resource is missing', () => {
      mockRoute.data = { requiredPermissions: [Permission.READ] };
      const unauthorizedTree = {} as any;
      router.createUrlTree.and.returnValue(unauthorizedTree);

      const result = TestBed.runInInjectionContext(() => 
        hasResourcePermission(mockRoute, {} as any)
      );

      expect(router.createUrlTree).toHaveBeenCalledWith(['/auth/unauthorized']);
      expect(result).toBe(unauthorizedTree);
    });

    it('should redirect to unauthorized when requiredPermissions is missing', () => {
      mockRoute.data = { resource: 'API1' };
      const unauthorizedTree = {} as any;
      router.createUrlTree.and.returnValue(unauthorizedTree);

      const result = TestBed.runInInjectionContext(() => 
        hasResourcePermission(mockRoute, {} as any)
      );

      expect(router.createUrlTree).toHaveBeenCalledWith(['/auth/unauthorized']);
      expect(result).toBe(unauthorizedTree);
    });

    it('should redirect to unauthorized when both are missing', () => {
      mockRoute.data = {};
      const unauthorizedTree = {} as any;
      router.createUrlTree.and.returnValue(unauthorizedTree);

      const result = TestBed.runInInjectionContext(() => 
        hasResourcePermission(mockRoute, {} as any)
      );

      expect(router.createUrlTree).toHaveBeenCalledWith(['/auth/unauthorized']);
      expect(result).toBe(unauthorizedTree);
    });

    it('should log a warning when route data is missing', () => {
      spyOn(console, 'warn');
      mockRoute.data = {};
      router.createUrlTree.and.returnValue({} as any);

      TestBed.runInInjectionContext(() => 
        hasResourcePermission(mockRoute, {} as any)
      );

      expect(console.warn).toHaveBeenCalledWith('Route missing resource or requiredPermissions in data');
    });
  });

  describe('when checking single permission', () => {
    beforeEach(() => {
      mockRoute.data = {
        resource: 'API1',
        requiredPermissions: [Permission.READ]
      };
    });

    it('should return true when user has the required permission', () => {
      permissionsService.hasResourcePermission.and.returnValue(true);

      const result = TestBed.runInInjectionContext(() => 
        hasResourcePermission(mockRoute, {} as any)
      );

      expect(permissionsService.hasResourcePermission).toHaveBeenCalledWith('API1', Permission.READ);
      expect(permissionsService.hasResourcePermission).toHaveBeenCalledWith('API1', Permission.READ);
      expect(result).toBe(true);
    });

    it('should redirect to unauthorized when user lacks the required permission', () => {
      permissionsService.hasResourcePermission.and.returnValue(false);
      const unauthorizedTree = {} as any;
      router.createUrlTree.and.returnValue(unauthorizedTree);

      const result = TestBed.runInInjectionContext(() => 
        hasResourcePermission(mockRoute, {} as any)
      );

      expect(permissionsService.hasResourcePermission).toHaveBeenCalledWith('API1', Permission.READ);
      expect(router.createUrlTree).toHaveBeenCalledWith(['/auth/unauthorized']);
      expect(result).toBe(unauthorizedTree);
    });

    it('should work with different permission types', () => {
      const testCases = [
        Permission.CREATE,
        Permission.UPDATE,
        Permission.DELETE
      ];

      testCases.forEach(permission => {
        mockRoute.data = {
          resource: 'TestResource',
          requiredPermissions: [permission]
        };
        permissionsService.hasResourcePermission.and.returnValue(true);

        const result = TestBed.runInInjectionContext(() => 
          hasResourcePermission(mockRoute, {} as any)
        );

        expect(permissionsService.hasResourcePermission).toHaveBeenCalledWith('TestResource', permission);
        expect(result).toBe(true);
      });
    });
  });

  describe('when checking multiple permissions', () => {
    beforeEach(() => {
      mockRoute.data = {
        resource: 'API1',
        requiredPermissions: [Permission.READ, Permission.UPDATE]
      };
    });

    it('should return true when user has all required permissions', () => {
      permissionsService.hasResourcePermissions.and.returnValue(true);

      const result = TestBed.runInInjectionContext(() => 
        hasResourcePermission(mockRoute, {} as any)
      );

      expect(permissionsService.hasResourcePermissions).toHaveBeenCalledWith(
        'API1',
        [Permission.READ, Permission.UPDATE]
      );
      expect(result).toBe(true);
    });

    it('should redirect to unauthorized when user lacks any required permission', () => {
      permissionsService.hasResourcePermissions.and.returnValue(false);
      const unauthorizedTree = {} as any;
      router.createUrlTree.and.returnValue(unauthorizedTree);

      const result = TestBed.runInInjectionContext(() => 
        hasResourcePermission(mockRoute, {} as any)
      );

      expect(permissionsService.hasResourcePermissions).toHaveBeenCalledWith(
        'API1',
        [Permission.READ, Permission.UPDATE]
      );
      expect(router.createUrlTree).toHaveBeenCalledWith(['/auth/unauthorized']);
      expect(result).toBe(unauthorizedTree);
    });

    it('should handle three or more permissions', () => {
      mockRoute.data = {
        resource: 'API2',
        requiredPermissions: [Permission.CREATE, Permission.READ, Permission.UPDATE, Permission.DELETE]
      };
      permissionsService.hasResourcePermissions.and.returnValue(true);

      const result = TestBed.runInInjectionContext(() => 
        hasResourcePermission(mockRoute, {} as any)
      );

      expect(permissionsService.hasResourcePermissions).toHaveBeenCalledWith(
        'API2',
        [Permission.CREATE, Permission.READ, Permission.UPDATE, Permission.DELETE]
      );
      expect(result).toBe(true);
    });
  });

  describe('admin bypass behavior', () => {
    it('should allow admin users even without explicit permissions (single permission)', () => {
      mockRoute.data = {
        resource: 'API1',
        requiredPermissions: [Permission.READ]
      };
      // Admin bypass is handled in PermissionsService
      permissionsService.hasResourcePermission.and.returnValue(true);

      const result = TestBed.runInInjectionContext(() => 
        hasResourcePermission(mockRoute, {} as any)
      );

      expect(result).toBe(true);
    });

    it('should allow admin users even without explicit permissions (multiple permissions)', () => {
      mockRoute.data = {
        resource: 'API1',
        requiredPermissions: [Permission.READ, Permission.UPDATE]
      };
      // Admin bypass is handled in PermissionsService
      permissionsService.hasResourcePermissions.and.returnValue(true);

      const result = TestBed.runInInjectionContext(() => 
        hasResourcePermission(mockRoute, {} as any)
      );

      expect(result).toBe(true);
    });
  });

  describe('different resource names', () => {
    it('should work with various resource identifiers', () => {
      const resources = ['API1', 'API2', 'CustomResource', 'DataService', 'FileAccess'];

      resources.forEach(resource => {
        mockRoute.data = {
          resource: resource,
          requiredPermissions: [Permission.READ]
        };
        permissionsService.hasResourcePermission.and.returnValue(true);

        const result = TestBed.runInInjectionContext(() => 
          hasResourcePermission(mockRoute, {} as any)
        );

        expect(permissionsService.hasResourcePermission).toHaveBeenCalledWith(resource, Permission.READ);
        expect(result).toBe(true);
      });
    });
  });

  describe('edge cases', () => {
    it('should handle empty permissions array by redirecting to unauthorized', () => {
      mockRoute.data = {
        resource: 'API1',
        requiredPermissions: []
      };
      const unauthorizedTree = {} as any;
      router.createUrlTree.and.returnValue(unauthorizedTree);
      spyOn(console, 'warn');

      const result = TestBed.runInInjectionContext(() => 
        hasResourcePermission(mockRoute, {} as any)
      );

      expect(console.warn).toHaveBeenCalledWith('Route missing resource or requiredPermissions in data');
      expect(router.createUrlTree).toHaveBeenCalledWith(['/auth/unauthorized']);
      expect(result).toBe(unauthorizedTree);
    });

    it('should handle null route data', () => {
      mockRoute.data = null as any;
      const unauthorizedTree = {} as any;
      router.createUrlTree.and.returnValue(unauthorizedTree);
      spyOn(console, 'warn');

      const result = TestBed.runInInjectionContext(() => 
        hasResourcePermission(mockRoute, {} as any)
      );

      expect(console.warn).toHaveBeenCalledWith('Route data is missing');
      expect(router.createUrlTree).toHaveBeenCalledWith(['/auth/unauthorized']);
      expect(result).toBe(unauthorizedTree);
    });

    it('should handle undefined route data', () => {
      mockRoute.data = undefined as any;
      const unauthorizedTree = {} as any;
      router.createUrlTree.and.returnValue(unauthorizedTree);
      spyOn(console, 'warn');

      const result = TestBed.runInInjectionContext(() => 
        hasResourcePermission(mockRoute, {} as any)
      );

      expect(console.warn).toHaveBeenCalledWith('Route data is missing');
      expect(router.createUrlTree).toHaveBeenCalledWith(['/auth/unauthorized']);
      expect(result).toBe(unauthorizedTree);
    });
  });
});
