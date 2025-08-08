import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { signal } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { isUserAdmin } from './admin.guard';

describe('Admin Guard', () => {
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockRoute: ActivatedRouteSnapshot;
  let mockState: RouterStateSnapshot;
  let isAdminSignal: ReturnType<typeof signal<boolean>>;

  beforeEach(() => {
    isAdminSignal = signal(false);
    
    const authServiceSpy = jasmine.createSpyObj('AuthService', [], {
      isAdmin: isAdminSignal
    });
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    mockRoute = {} as ActivatedRouteSnapshot;
    mockState = {} as RouterStateSnapshot;
  });

  describe('isUserAdmin', () => {
    it('should be created', () => {
      expect(isUserAdmin).toBeTruthy();
    });

    it('should return true when user is admin', () => {
      // Arrange
      isAdminSignal.set(true);

      // Act
      const result = TestBed.runInInjectionContext(() => 
        isUserAdmin(mockRoute, mockState)
      );

      // Assert
      expect(result).toBe(true);
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should return false when user is not admin', () => {
      // Arrange
      isAdminSignal.set(false);

      // Act
      const result = TestBed.runInInjectionContext(() => 
        isUserAdmin(mockRoute, mockState)
      );

      // Assert
      expect(result).toBe(false);
    });

    it('should navigate to unauthorized when user is not admin', () => {
      // Arrange
      isAdminSignal.set(false);

      // Act
      TestBed.runInInjectionContext(() => 
        isUserAdmin(mockRoute, mockState)
      );

      // Assert
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/unauthorized']);
    });

    it('should not navigate when user is admin', () => {
      // Arrange
      isAdminSignal.set(true);

      // Act
      TestBed.runInInjectionContext(() => 
        isUserAdmin(mockRoute, mockState)
      );

      // Assert
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should handle multiple calls consistently - admin user', () => {
      // Arrange
      isAdminSignal.set(true);

      // Act
      const result1 = TestBed.runInInjectionContext(() => 
        isUserAdmin(mockRoute, mockState)
      );
      const result2 = TestBed.runInInjectionContext(() => 
        isUserAdmin(mockRoute, mockState)
      );

      // Assert
      expect(result1).toBe(true);
      expect(result2).toBe(true);
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should handle multiple calls consistently - non-admin user', () => {
      // Arrange
      isAdminSignal.set(false);

      // Act
      const result1 = TestBed.runInInjectionContext(() => 
        isUserAdmin(mockRoute, mockState)
      );
      const result2 = TestBed.runInInjectionContext(() => 
        isUserAdmin(mockRoute, mockState)
      );

      // Assert
      expect(result1).toBe(false);
      expect(result2).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalledTimes(2);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/unauthorized']);
    });

    it('should work with different route and state objects', () => {
      // Arrange
      const alternateRoute = { data: { test: 'value' } } as any;
      const alternateState = { url: '/admin/test' } as any;
      isAdminSignal.set(true);

      // Act
      const result = TestBed.runInInjectionContext(() => 
        isUserAdmin(alternateRoute, alternateState)
      );

      // Assert
      expect(result).toBe(true);
    });

    it('should handle signal state changes correctly', () => {
      // Arrange - Start as non-admin
      isAdminSignal.set(false);

      // Act & Assert - First call
      let result = TestBed.runInInjectionContext(() => 
        isUserAdmin(mockRoute, mockState)
      );
      expect(result).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/unauthorized']);

      // Arrange - Change to admin
      mockRouter.navigate.calls.reset();
      isAdminSignal.set(true);

      // Act & Assert - Second call
      result = TestBed.runInInjectionContext(() => 
        isUserAdmin(mockRoute, mockState)
      );
      expect(result).toBe(true);
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined route and state', () => {
      // Arrange
      isAdminSignal.set(true);

      // Act & Assert - should not throw
      expect(() => {
        TestBed.runInInjectionContext(() => 
          isUserAdmin(undefined as any, undefined as any)
        );
      }).not.toThrow();
    });

    it('should handle null route and state', () => {
      // Arrange
      isAdminSignal.set(false);

      // Act & Assert - should not throw
      expect(() => {
        TestBed.runInInjectionContext(() => 
          isUserAdmin(null as any, null as any)
        );
      }).not.toThrow();
      
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/unauthorized']);
    });
  });
});
