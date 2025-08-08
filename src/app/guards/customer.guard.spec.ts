import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { signal } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { isUserCustomer } from './customer.guard';

describe('Customer Guard', () => {
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRoute: ActivatedRouteSnapshot;
  let mockState: RouterStateSnapshot;
  let isCustomerSignal: ReturnType<typeof signal<boolean>>;

  beforeEach(() => {
    isCustomerSignal = signal(false);
    
    const authServiceSpy = jasmine.createSpyObj('AuthService', [], {
      isCustomer: isCustomerSignal
    });

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy }
      ]
    });

    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;

    mockRoute = {} as ActivatedRouteSnapshot;
    mockState = {} as RouterStateSnapshot;
  });

  describe('isUserCustomer', () => {
    it('should be created', () => {
      expect(isUserCustomer).toBeTruthy();
    });

    it('should return true when user is customer', () => {
      // Arrange
      isCustomerSignal.set(true);

      // Act
      const result = TestBed.runInInjectionContext(() => 
        isUserCustomer(mockRoute, mockState)
      );

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when user is not customer', () => {
      // Arrange
      isCustomerSignal.set(false);

      // Act
      const result = TestBed.runInInjectionContext(() => 
        isUserCustomer(mockRoute, mockState)
      );

      // Assert
      expect(result).toBe(false);
    });

    it('should handle multiple calls consistently - customer user', () => {
      // Arrange
      isCustomerSignal.set(true);

      // Act
      const result1 = TestBed.runInInjectionContext(() => 
        isUserCustomer(mockRoute, mockState)
      );
      const result2 = TestBed.runInInjectionContext(() => 
        isUserCustomer(mockRoute, mockState)
      );

      // Assert
      expect(result1).toBe(true);
      expect(result2).toBe(true);
    });

    it('should handle multiple calls consistently - non-customer user', () => {
      // Arrange
      isCustomerSignal.set(false);

      // Act
      const result1 = TestBed.runInInjectionContext(() => 
        isUserCustomer(mockRoute, mockState)
      );
      const result2 = TestBed.runInInjectionContext(() => 
        isUserCustomer(mockRoute, mockState)
      );

      // Assert
      expect(result1).toBe(false);
      expect(result2).toBe(false);
    });

    it('should work with different route and state objects', () => {
      // Arrange
      const alternateRoute = { data: { test: 'value' } } as any;
      const alternateState = { url: '/customer/dashboard' } as any;
      isCustomerSignal.set(true);

      // Act
      const result = TestBed.runInInjectionContext(() => 
        isUserCustomer(alternateRoute, alternateState)
      );

      // Assert
      expect(result).toBe(true);
    });

    it('should handle signal state changes correctly', () => {
      // Arrange - Start as non-customer
      isCustomerSignal.set(false);

      // Act & Assert - First call
      let result = TestBed.runInInjectionContext(() => 
        isUserCustomer(mockRoute, mockState)
      );
      expect(result).toBe(false);

      // Arrange - Change to customer
      isCustomerSignal.set(true);

      // Act & Assert - Second call
      result = TestBed.runInInjectionContext(() => 
        isUserCustomer(mockRoute, mockState)
      );
      expect(result).toBe(true);
    });

    it('should not perform navigation - simple boolean guard', () => {
      // This guard is different from others - it only returns boolean, no navigation
      
      // Arrange
      isCustomerSignal.set(false);

      // Act
      const result = TestBed.runInInjectionContext(() => 
        isUserCustomer(mockRoute, mockState)
      );

      // Assert
      expect(result).toBe(false);
      // Note: No router navigation expectations since this guard doesn't use Router
    });

    it('should work for customer access scenarios', () => {
      // Arrange
      isCustomerSignal.set(true);

      // Act
      const result = TestBed.runInInjectionContext(() => 
        isUserCustomer(mockRoute, mockState)
      );

      // Assert
      expect(result).toBe(true);
      // This guard allows customer access without redirects
    });

    it('should handle different customer route configurations', () => {
      // Arrange
      const customerRoutes = [
        { data: { customerOnly: true } },
        { params: { customerId: '123' } },
        { queryParams: { view: 'orders' } }
      ];
      isCustomerSignal.set(true);

      // Act & Assert
      customerRoutes.forEach(route => {
        const result = TestBed.runInInjectionContext(() => 
          isUserCustomer(route as any, mockState)
        );
        expect(result).toBe(true);
      });
    });

    it('should be stateless - each call independent', () => {
      // Arrange & Act - Multiple rapid calls with same state
      isCustomerSignal.set(true);
      const results = Array.from({ length: 10 }, () => 
        TestBed.runInInjectionContext(() => 
          isUserCustomer(mockRoute, mockState)
        )
      );

      // Assert
      expect(results.every(result => result === true)).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined route and state', () => {
      // Arrange
      isCustomerSignal.set(true);

      // Act & Assert - should not throw
      expect(() => {
        TestBed.runInInjectionContext(() => 
          isUserCustomer(undefined as any, undefined as any)
        );
      }).not.toThrow();
    });

    it('should handle null route and state', () => {
      // Arrange
      isCustomerSignal.set(false);

      // Act & Assert - should not throw
      expect(() => {
        TestBed.runInInjectionContext(() => 
          isUserCustomer(null as any, null as any)
        );
      }).not.toThrow();
    });

    it('should handle empty route and state objects', () => {
      // Arrange
      isCustomerSignal.set(true);

      // Act
      const result = TestBed.runInInjectionContext(() => 
        isUserCustomer({} as any, {} as any)
      );

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('Signal Behavior Tests', () => {
    it('should reflect real-time signal changes', () => {
      // Test that the guard immediately reflects signal state changes
      
      // Start false
      isCustomerSignal.set(false);
      expect(TestBed.runInInjectionContext(() => 
        isUserCustomer(mockRoute, mockState)
      )).toBe(false);

      // Change to true
      isCustomerSignal.set(true);
      expect(TestBed.runInInjectionContext(() => 
        isUserCustomer(mockRoute, mockState)
      )).toBe(true);

      // Change back to false
      isCustomerSignal.set(false);
      expect(TestBed.runInInjectionContext(() => 
        isUserCustomer(mockRoute, mockState)
      )).toBe(false);
    });

    it('should work with concurrent signal reads', () => {
      // Test concurrent access to the signal
      isCustomerSignal.set(true);

      const promises = Array.from({ length: 5 }, () => 
        Promise.resolve(TestBed.runInInjectionContext(() => 
          isUserCustomer(mockRoute, mockState)
        ))
      );

      return Promise.all(promises).then(results => {
        expect(results).toEqual([true, true, true, true, true]);
      });
    });
  });

  describe('Guard Simplicity Tests', () => {
    it('should be the simplest guard - no external dependencies except AuthService', () => {
      // This guard doesn't use Router, MessagesService, or any other dependencies
      // It's a pure function that only reads AuthService.isCustomer signal
      
      isCustomerSignal.set(true);
      const result = TestBed.runInInjectionContext(() => 
        isUserCustomer(mockRoute, mockState)
      );
      
      expect(result).toBe(true);
      // Verify simplicity - no side effects expected
    });

    it('should have minimal performance overhead', () => {
      // Test that the guard has minimal overhead
      const startTime = performance.now();
      
      // Run guard multiple times
      for (let i = 0; i < 100; i++) {
        TestBed.runInInjectionContext(() => 
          isUserCustomer(mockRoute, mockState)
        );
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete very quickly (less than 100ms for 100 calls)
      expect(duration).toBeLessThan(100);
    });
  });
});
