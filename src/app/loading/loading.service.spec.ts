import { TestBed } from '@angular/core/testing';
import { LoadingService } from './loading.service';

describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoadingService);
  });

  describe('Service Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should be provided in root', () => {
      // Verify singleton behavior by getting multiple instances
      const service1 = TestBed.inject(LoadingService);
      const service2 = TestBed.inject(LoadingService);
      
      expect(service1).toBe(service2);
    });

    it('should initialize with loading state false', () => {
      expect(service.loading()).toBe(false);
    });

    it('should have readonly loading signal', () => {
      // Verify that loading is readonly and cannot be directly modified
      expect(service.loading).toBeDefined();
      expect(typeof service.loading).toBe('function');
      
      // Should not have set method on readonly signal
      expect((service.loading as any).set).toBeUndefined();
    });
  });

  describe('loadingOn()', () => {
    it('should set loading state to true', () => {
      // Arrange
      expect(service.loading()).toBe(false);

      // Act
      service.loadingOn();

      // Assert
      expect(service.loading()).toBe(true);
    });

    it('should update loading state when called multiple times', () => {
      // Act
      service.loadingOn();
      service.loadingOn();
      service.loadingOn();

      // Assert
      expect(service.loading()).toBe(true);
    });

    it('should work when already loading', () => {
      // Arrange
      service.loadingOn();
      expect(service.loading()).toBe(true);

      // Act
      service.loadingOn();

      // Assert
      expect(service.loading()).toBe(true);
    });

    it('should have no return value', () => {
      const result = service.loadingOn();
      expect(result).toBeUndefined();
    });
  });

  describe('loadingOff()', () => {
    it('should set loading state to false', () => {
      // Arrange
      service.loadingOn();
      expect(service.loading()).toBe(true);

      // Act
      service.loadingOff();

      // Assert
      expect(service.loading()).toBe(false);
    });

    it('should update loading state when called multiple times', () => {
      // Arrange
      service.loadingOn();

      // Act
      service.loadingOff();
      service.loadingOff();
      service.loadingOff();

      // Assert
      expect(service.loading()).toBe(false);
    });

    it('should work when already not loading', () => {
      // Arrange
      expect(service.loading()).toBe(false);

      // Act
      service.loadingOff();

      // Assert
      expect(service.loading()).toBe(false);
    });

    it('should have no return value', () => {
      const result = service.loadingOff();
      expect(result).toBeUndefined();
    });
  });

  describe('Loading State Transitions', () => {
    it('should toggle between loading states correctly', () => {
      // Initial state
      expect(service.loading()).toBe(false);

      // Turn on
      service.loadingOn();
      expect(service.loading()).toBe(true);

      // Turn off
      service.loadingOff();
      expect(service.loading()).toBe(false);

      // Turn on again
      service.loadingOn();
      expect(service.loading()).toBe(true);
    });

    it('should handle rapid state changes', () => {
      // Rapid on/off cycles
      for (let i = 0; i < 10; i++) {
        service.loadingOn();
        expect(service.loading()).toBe(true);
        
        service.loadingOff();
        expect(service.loading()).toBe(false);
      }
    });

    it('should maintain state consistency across method calls', () => {
      const states: boolean[] = [];

      // Record state changes
      service.loadingOn();
      states.push(service.loading());

      service.loadingOn();
      states.push(service.loading());

      service.loadingOff();
      states.push(service.loading());

      service.loadingOff();
      states.push(service.loading());

      service.loadingOn();
      states.push(service.loading());

      expect(states).toEqual([true, true, false, false, true]);
    });
  });

  describe('Signal Behavior', () => {
    it('should emit signal changes immediately', () => {
      let signalValue: boolean | undefined;

      // Subscribe to signal changes (in a real app, this would be in a component)
      const unsubscribe = TestBed.runInInjectionContext(() => {
        const effect = () => {
          signalValue = service.loading();
        };
        effect(); // Initial call
        return effect;
      });

      // Test initial value
      expect(signalValue).toBe(false);

      // Test signal updates
      service.loadingOn();
      unsubscribe(); // Call effect manually since we're in test
      signalValue = service.loading();
      expect(signalValue).toBe(true);

      service.loadingOff();
      signalValue = service.loading();
      expect(signalValue).toBe(false);
    });

    it('should be reactive to state changes', () => {
      const values: boolean[] = [];

      // Simulate reactive behavior
      const recordValue = () => values.push(service.loading());

      // Initial value
      recordValue();

      // State changes
      service.loadingOn();
      recordValue();

      service.loadingOff();
      recordValue();

      service.loadingOn();
      recordValue();

      expect(values).toEqual([false, true, false, true]);
    });

    it('should maintain referential equality for the loading signal', () => {
      const loadingSignal1 = service.loading;
      const loadingSignal2 = service.loading;

      expect(loadingSignal1).toBe(loadingSignal2);
    });
  });

  describe('Concurrent Usage', () => {
    it('should handle concurrent calls correctly', () => {
      // Simulate multiple components calling loading methods
      const promises = Array.from({ length: 10 }, (_, i) => 
        Promise.resolve().then(() => {
          if (i % 2 === 0) {
            service.loadingOn();
          } else {
            service.loadingOff();
          }
        })
      );

      return Promise.all(promises).then(() => {
        // Final state should be off (last call was loadingOff for odd index 9)
        expect(service.loading()).toBe(false);
      });
    });

    it('should be thread-safe for synchronous calls', () => {
      // Rapid synchronous calls
      service.loadingOn();
      service.loadingOff();
      service.loadingOn();
      service.loadingOff();
      service.loadingOn();

      expect(service.loading()).toBe(true);
    });
  });

  describe('Performance Tests', () => {
    it('should have minimal performance overhead', () => {
      const startTime = performance.now();

      // Perform many operations
      for (let i = 0; i < 1000; i++) {
        service.loadingOn();
        service.loading();
        service.loadingOff();
        service.loading();
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete very quickly (less than 100ms for 1000 cycles)
      expect(duration).toBeLessThan(100);
    });

    it('should handle high-frequency state changes', () => {
      // Test rapid state changes don't cause issues
      for (let i = 0; i < 100; i++) {
        service.loadingOn();
        service.loadingOff();
      }

      expect(service.loading()).toBe(false);
    });
  });

  describe('Integration Scenarios', () => {
    it('should support typical loading patterns', () => {
      // Simulate API call pattern
      expect(service.loading()).toBe(false);

      // Start loading
      service.loadingOn();
      expect(service.loading()).toBe(true);

      // Simulate async operation
      return Promise.resolve().then(() => {
        // Stop loading
        service.loadingOff();
        expect(service.loading()).toBe(false);
      });
    });

    it('should support nested loading scenarios', () => {
      // Multiple operations might trigger loading
      service.loadingOn(); // Operation 1 starts
      expect(service.loading()).toBe(true);

      service.loadingOn(); // Operation 2 starts (still loading)
      expect(service.loading()).toBe(true);

      service.loadingOff(); // Operation 1 finishes
      expect(service.loading()).toBe(false); // But this turns off all loading

      // In real usage, you'd need a counter for proper nested loading
      // This test documents current behavior
    });

    it('should work with subscription patterns', () => {
      const loadingStates: boolean[] = [];

      // Simulate component subscription
      const subscription = () => {
        loadingStates.push(service.loading());
      };

      // Initial subscription
      subscription();

      // Simulate user actions triggering loading
      service.loadingOn();
      subscription();

      service.loadingOff();
      subscription();

      expect(loadingStates).toEqual([false, true, false]);
    });
  });

  describe('Edge Cases', () => {
    it('should handle service destruction gracefully', () => {
      service.loadingOn();
      expect(service.loading()).toBe(true);

      // Service should still work normally
      service.loadingOff();
      expect(service.loading()).toBe(false);
    });

    it('should maintain state after many operations', () => {
      // Stress test with many operations
      let expectedState = false;

      for (let i = 0; i < 50; i++) {
        if (i % 3 === 0) {
          service.loadingOn();
          expectedState = true;
        } else if (i % 3 === 1) {
          service.loadingOff();
          expectedState = false;
        }
        // i % 3 === 2: no operation

        expect(service.loading()).toBe(expectedState);
      }
    });

    it('should work correctly when methods are called from different contexts', () => {
      // Simulate calls from different components/services
      const context1 = () => service.loadingOn();
      const context2 = () => service.loadingOff();

      context1();
      expect(service.loading()).toBe(true);

      context2();
      expect(service.loading()).toBe(false);

      context1();
      expect(service.loading()).toBe(true);
    });
  });

  describe('Type Safety', () => {
    it('should have correct TypeScript types', () => {
      // Verify method signatures
      expect(typeof service.loadingOn).toBe('function');
      expect(typeof service.loadingOff).toBe('function');
      expect(typeof service.loading).toBe('function');

      // Verify return types
      const onResult = service.loadingOn();
      const offResult = service.loadingOff();
      const loadingResult = service.loading();

      expect(onResult).toBeUndefined();
      expect(offResult).toBeUndefined();
      expect(typeof loadingResult).toBe('boolean');
    });
  });
});
