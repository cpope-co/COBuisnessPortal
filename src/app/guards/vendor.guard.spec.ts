import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { signal } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { isUserVendor } from './vendor.guard';

describe('Vendor Guard', () => {
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockRoute: ActivatedRouteSnapshot;
  let mockState: RouterStateSnapshot;
  let isVendorSignal: ReturnType<typeof signal<boolean>>;
  let isAdminSignal: ReturnType<typeof signal<boolean>>;

  beforeEach(() => {
    isVendorSignal = signal(false);
    isAdminSignal = signal(false);
    
    const authServiceSpy = jasmine.createSpyObj('AuthService', [], {
      isVendor: isVendorSignal,
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

  describe('isUserVendor', () => {
    it('should be created', () => {
      expect(isUserVendor).toBeTruthy();
    });

    it('should return true when user is vendor', () => {
      // Arrange
      isVendorSignal.set(true);
      isAdminSignal.set(false);

      // Act
      const result = TestBed.runInInjectionContext(() => 
        isUserVendor(mockRoute, mockState)
      );

      // Assert
      expect(result).toBe(true);
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should return true when user is admin (admin can access vendor routes)', () => {
      // Arrange
      isVendorSignal.set(false);
      isAdminSignal.set(true);

      // Act
      const result = TestBed.runInInjectionContext(() => 
        isUserVendor(mockRoute, mockState)
      );

      // Assert
      expect(result).toBe(true);
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should return true when user is both vendor and admin', () => {
      // Arrange
      isVendorSignal.set(true);
      isAdminSignal.set(true);

      // Act
      const result = TestBed.runInInjectionContext(() => 
        isUserVendor(mockRoute, mockState)
      );

      // Assert
      expect(result).toBe(true);
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should return false when user is neither vendor nor admin', () => {
      // Arrange
      isVendorSignal.set(false);
      isAdminSignal.set(false);

      // Act
      const result = TestBed.runInInjectionContext(() => 
        isUserVendor(mockRoute, mockState)
      );

      // Assert
      expect(result).toBe(false);
    });

    it('should navigate to unauthorized when user is neither vendor nor admin', () => {
      // Arrange
      isVendorSignal.set(false);
      isAdminSignal.set(false);

      // Act
      TestBed.runInInjectionContext(() => 
        isUserVendor(mockRoute, mockState)
      );

      // Assert
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/unauthorized']);
    });

    it('should not navigate when user is vendor', () => {
      // Arrange
      isVendorSignal.set(true);
      isAdminSignal.set(false);

      // Act
      TestBed.runInInjectionContext(() => 
        isUserVendor(mockRoute, mockState)
      );

      // Assert
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should not navigate when user is admin', () => {
      // Arrange
      isVendorSignal.set(false);
      isAdminSignal.set(true);

      // Act
      TestBed.runInInjectionContext(() => 
        isUserVendor(mockRoute, mockState)
      );

      // Assert
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should handle multiple calls consistently - vendor user', () => {
      // Arrange
      isVendorSignal.set(true);
      isAdminSignal.set(false);

      // Act
      const result1 = TestBed.runInInjectionContext(() => 
        isUserVendor(mockRoute, mockState)
      );
      const result2 = TestBed.runInInjectionContext(() => 
        isUserVendor(mockRoute, mockState)
      );

      // Assert
      expect(result1).toBe(true);
      expect(result2).toBe(true);
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should handle multiple calls consistently - admin user', () => {
      // Arrange
      isVendorSignal.set(false);
      isAdminSignal.set(true);

      // Act
      const result1 = TestBed.runInInjectionContext(() => 
        isUserVendor(mockRoute, mockState)
      );
      const result2 = TestBed.runInInjectionContext(() => 
        isUserVendor(mockRoute, mockState)
      );

      // Assert
      expect(result1).toBe(true);
      expect(result2).toBe(true);
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should handle multiple calls consistently - unauthorized user', () => {
      // Arrange
      isVendorSignal.set(false);
      isAdminSignal.set(false);

      // Act
      const result1 = TestBed.runInInjectionContext(() => 
        isUserVendor(mockRoute, mockState)
      );
      const result2 = TestBed.runInInjectionContext(() => 
        isUserVendor(mockRoute, mockState)
      );

      // Assert
      expect(result1).toBe(false);
      expect(result2).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalledTimes(2);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/unauthorized']);
    });

    it('should work with different route and state objects', () => {
      // Arrange
      const alternateRoute = { data: { vendorRoute: true } } as any;
      const alternateState = { url: '/vendor/products' } as any;
      isVendorSignal.set(true);
      isAdminSignal.set(false);

      // Act
      const result = TestBed.runInInjectionContext(() => 
        isUserVendor(alternateRoute, alternateState)
      );

      // Assert
      expect(result).toBe(true);
    });

    it('should handle signal state changes correctly', () => {
      // Arrange - Start as unauthorized user
      isVendorSignal.set(false);
      isAdminSignal.set(false);

      // Act & Assert - First call
      let result = TestBed.runInInjectionContext(() => 
        isUserVendor(mockRoute, mockState)
      );
      expect(result).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/unauthorized']);

      // Arrange - Change to vendor
      mockRouter.navigate.calls.reset();
      isVendorSignal.set(true);

      // Act & Assert - Second call
      result = TestBed.runInInjectionContext(() => 
        isUserVendor(mockRoute, mockState)
      );
      expect(result).toBe(true);
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });

  describe('Admin Override Tests', () => {
    it('should prioritize admin access even when vendor is false', () => {
      // Arrange - Admin but not vendor
      isVendorSignal.set(false);
      isAdminSignal.set(true);

      // Act
      const result = TestBed.runInInjectionContext(() => 
        isUserVendor(mockRoute, mockState)
      );

      // Assert
      expect(result).toBe(true);
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should allow vendor access when admin is false', () => {
      // Arrange - Vendor but not admin
      isVendorSignal.set(true);
      isAdminSignal.set(false);

      // Act
      const result = TestBed.runInInjectionContext(() => 
        isUserVendor(mockRoute, mockState)
      );

      // Assert
      expect(result).toBe(true);
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should test all combinations of vendor and admin states', () => {
      const testCases = [
        { vendor: false, admin: false, expected: false, shouldNavigate: true },
        { vendor: false, admin: true, expected: true, shouldNavigate: false },
        { vendor: true, admin: false, expected: true, shouldNavigate: false },
        { vendor: true, admin: true, expected: true, shouldNavigate: false }
      ];

      testCases.forEach(({ vendor, admin, expected, shouldNavigate }, index) => {
        // Arrange
        isVendorSignal.set(vendor);
        isAdminSignal.set(admin);
        mockRouter.navigate.calls.reset();

        // Act
        const result = TestBed.runInInjectionContext(() => 
          isUserVendor(mockRoute, mockState)
        );

        // Assert
        expect(result).toBe(expected, `Test case ${index + 1}: vendor=${vendor}, admin=${admin}`);
        
        if (shouldNavigate) {
          expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/unauthorized']);
        } else {
          expect(mockRouter.navigate).not.toHaveBeenCalled();
        }
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined route and state', () => {
      // Arrange
      isVendorSignal.set(true);
      isAdminSignal.set(false);

      // Act & Assert - should not throw
      expect(() => {
        TestBed.runInInjectionContext(() => 
          isUserVendor(undefined as any, undefined as any)
        );
      }).not.toThrow();
    });

    it('should handle null route and state', () => {
      // Arrange
      isVendorSignal.set(false);
      isAdminSignal.set(false);

      // Act & Assert - should not throw
      expect(() => {
        TestBed.runInInjectionContext(() => 
          isUserVendor(null as any, null as any)
        );
      }).not.toThrow();
      
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/unauthorized']);
    });

    it('should handle rapid role changes', () => {
      // Test behavior during rapid role transitions
      
      // Start as unauthorized
      isVendorSignal.set(false);
      isAdminSignal.set(false);
      expect(TestBed.runInInjectionContext(() => 
        isUserVendor(mockRoute, mockState)
      )).toBe(false);

      // Become vendor
      isVendorSignal.set(true);
      expect(TestBed.runInInjectionContext(() => 
        isUserVendor(mockRoute, mockState)
      )).toBe(true);

      // Become admin (lose vendor)
      isVendorSignal.set(false);
      isAdminSignal.set(true);
      expect(TestBed.runInInjectionContext(() => 
        isUserVendor(mockRoute, mockState)
      )).toBe(true);

      // Lose all roles
      isAdminSignal.set(false);
      expect(TestBed.runInInjectionContext(() => 
        isUserVendor(mockRoute, mockState)
      )).toBe(false);
    });
  });

  describe('Integration Tests', () => {
    it('should handle concurrent access attempts with different user states', () => {
      // Arrange
      isVendorSignal.set(true);
      isAdminSignal.set(false);

      // Act - Simulate multiple simultaneous route activations
      const results = Array.from({ length: 5 }, () => 
        TestBed.runInInjectionContext(() => 
          isUserVendor(mockRoute, mockState)
        )
      );

      // Assert
      expect(results).toEqual([true, true, true, true, true]);
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should work correctly with real-world vendor scenarios', () => {
      // Test scenarios that might occur in real vendor workflows
      
      // Scenario 1: Vendor accessing their product management
      isVendorSignal.set(true);
      isAdminSignal.set(false);
      const vendorRoute = { data: { vendorArea: 'products' } } as any;
      
      let result = TestBed.runInInjectionContext(() => 
        isUserVendor(vendorRoute, mockState)
      );
      expect(result).toBe(true);

      // Scenario 2: Admin accessing vendor management area
      isVendorSignal.set(false);
      isAdminSignal.set(true);
      const adminRoute = { data: { adminArea: 'vendor-management' } } as any;
      
      result = TestBed.runInInjectionContext(() => 
        isUserVendor(adminRoute, mockState)
      );
      expect(result).toBe(true);

      // Scenario 3: Customer trying to access vendor area
      isVendorSignal.set(false);
      isAdminSignal.set(false);
      const customerRoute = { data: { unauthorizedAccess: true } } as any;
      
      result = TestBed.runInInjectionContext(() => 
        isUserVendor(customerRoute, mockState)
      );
      expect(result).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/unauthorized']);
    });
  });
});
