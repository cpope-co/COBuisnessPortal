import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { signal } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { isUserApiUser } from './api-user.guard';

describe('API User Guard', () => {
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockRoute: ActivatedRouteSnapshot;
  let mockState: RouterStateSnapshot;
  let isApiUserSignal: ReturnType<typeof signal<boolean>>;

  beforeEach(() => {
    isApiUserSignal = signal(false);
    
    const authServiceSpy = jasmine.createSpyObj('AuthService', [], {
      isApiUser: isApiUserSignal
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

  describe('isUserApiUser', () => {
    it('should be created', () => {
      expect(isUserApiUser).toBeTruthy();
    });

    it('should return true when user is API user', () => {
      // Arrange
      isApiUserSignal.set(true);

      // Act
      const result = TestBed.runInInjectionContext(() => 
        isUserApiUser(mockRoute, mockState)
      );

      // Assert
      expect(result).toBe(true);
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should return false when user is not API user', () => {
      // Arrange
      isApiUserSignal.set(false);

      // Act
      const result = TestBed.runInInjectionContext(() => 
        isUserApiUser(mockRoute, mockState)
      );

      // Assert
      expect(result).toBe(false);
    });

    it('should navigate to unauthorized when user is not API user', () => {
      // Arrange
      isApiUserSignal.set(false);

      // Act
      TestBed.runInInjectionContext(() => 
        isUserApiUser(mockRoute, mockState)
      );

      // Assert
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/unauthorized']);
    });

    it('should not navigate when user is API user', () => {
      // Arrange
      isApiUserSignal.set(true);

      // Act
      TestBed.runInInjectionContext(() => 
        isUserApiUser(mockRoute, mockState)
      );

      // Assert
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should handle multiple calls consistently - API user', () => {
      // Arrange
      isApiUserSignal.set(true);

      // Act
      const result1 = TestBed.runInInjectionContext(() => 
        isUserApiUser(mockRoute, mockState)
      );
      const result2 = TestBed.runInInjectionContext(() => 
        isUserApiUser(mockRoute, mockState)
      );

      // Assert
      expect(result1).toBe(true);
      expect(result2).toBe(true);
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should handle multiple calls consistently - non-API user', () => {
      // Arrange
      isApiUserSignal.set(false);

      // Act
      const result1 = TestBed.runInInjectionContext(() => 
        isUserApiUser(mockRoute, mockState)
      );
      const result2 = TestBed.runInInjectionContext(() => 
        isUserApiUser(mockRoute, mockState)
      );

      // Assert
      expect(result1).toBe(false);
      expect(result2).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalledTimes(2);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/unauthorized']);
    });

    it('should work with simplified route parameters', () => {
      // Arrange
      isApiUserSignal.set(true);

      // Act - Using simplified parameters like in the original guard
      const result = TestBed.runInInjectionContext(() => 
        isUserApiUser({} as any, {} as any)
      );

      // Assert
      expect(result).toBe(true);
    });

    it('should handle signal state changes correctly', () => {
      // Arrange - Start as non-API user
      isApiUserSignal.set(false);

      // Act & Assert - First call
      let result = TestBed.runInInjectionContext(() => 
        isUserApiUser(mockRoute, mockState)
      );
      expect(result).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/unauthorized']);

      // Arrange - Change to API user
      mockRouter.navigate.calls.reset();
      isApiUserSignal.set(true);

      // Act & Assert - Second call
      result = TestBed.runInInjectionContext(() => 
        isUserApiUser(mockRoute, mockState)
      );
      expect(result).toBe(true);
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should handle different route and state configurations', () => {
      // Arrange
      const customRoute = { 
        params: { id: '123' }, 
        queryParams: { filter: 'active' } 
      } as any;
      const customState = { url: '/api/tokens' } as any;
      isApiUserSignal.set(true);

      // Act
      const result = TestBed.runInInjectionContext(() => 
        isUserApiUser(customRoute, customState)
      );

      // Assert
      expect(result).toBe(true);
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined route and state', () => {
      // Arrange
      isApiUserSignal.set(true);

      // Act & Assert - should not throw
      expect(() => {
        TestBed.runInInjectionContext(() => 
          isUserApiUser(undefined as any, undefined as any)
        );
      }).not.toThrow();
    });

    it('should handle null route and state', () => {
      // Arrange
      isApiUserSignal.set(false);

      // Act & Assert - should not throw
      expect(() => {
        TestBed.runInInjectionContext(() => 
          isUserApiUser(null as any, null as any)
        );
      }).not.toThrow();
      
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/unauthorized']);
    });

    it('should work without explicit type definitions in guard', () => {
      // This test verifies the guard works with the simplified parameter signature
      // (route, state) => instead of (route: ActivatedRouteSnapshot, state: RouterStateSnapshot)
      
      // Arrange
      isApiUserSignal.set(false);

      // Act
      const result = TestBed.runInInjectionContext(() => 
        isUserApiUser({} as any, {} as any)
      );

      // Assert
      expect(result).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/unauthorized']);
    });
  });

  describe('Integration Tests', () => {
    it('should handle concurrent access attempts', () => {
      // Arrange
      isApiUserSignal.set(true);

      // Act - Simulate multiple simultaneous route activations
      const results = Array.from({ length: 5 }, () => 
        TestBed.runInInjectionContext(() => 
          isUserApiUser(mockRoute, mockState)
        )
      );

      // Assert
      expect(results).toEqual([true, true, true, true, true]);
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should handle rapid state changes', () => {
      // Test behavior when signal changes rapidly
      const results: any[] = [];

      // Start as non-API user
      isApiUserSignal.set(false);
      results.push(TestBed.runInInjectionContext(() => 
        isUserApiUser(mockRoute, mockState)
      ));

      // Change to API user
      isApiUserSignal.set(true);
      results.push(TestBed.runInInjectionContext(() => 
        isUserApiUser(mockRoute, mockState)
      ));

      // Change back to non-API user
      isApiUserSignal.set(false);
      results.push(TestBed.runInInjectionContext(() => 
        isUserApiUser(mockRoute, mockState)
      ));

      // Assert
      expect(results).toEqual([false, true, false]);
      expect(mockRouter.navigate).toHaveBeenCalledTimes(2);
    });
  });
});
