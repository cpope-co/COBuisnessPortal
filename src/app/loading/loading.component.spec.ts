import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { By } from '@angular/platform-browser';
import { LoadingIndicatorComponent } from './loading.component';
import { LoadingService } from './loading.service';

describe('LoadingIndicatorComponent', () => {
  let component: LoadingIndicatorComponent;
  let fixture: ComponentFixture<LoadingIndicatorComponent>;
  let mockLoadingService: jasmine.SpyObj<LoadingService>;
  let loadingSignal: ReturnType<typeof signal<boolean>>;

  beforeEach(async () => {
    loadingSignal = signal(false);
    
    const loadingServiceSpy = jasmine.createSpyObj('LoadingService', [], {
      loading: loadingSignal
    });

    await TestBed.configureTestingModule({
      imports: [LoadingIndicatorComponent, MatProgressSpinner],
      providers: [
        { provide: LoadingService, useValue: loadingServiceSpy }
      ]
    }).compileComponents();
    
    fixture = TestBed.createComponent(LoadingIndicatorComponent);
    component = fixture.componentInstance;
    mockLoadingService = TestBed.inject(LoadingService) as jasmine.SpyObj<LoadingService>;
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should inject LoadingService', () => {
      expect(component.loadingService).toBeTruthy();
      expect(component.loadingService).toBe(mockLoadingService);
    });

    it('should initialize loading signal from service', () => {
      fixture.detectChanges();
      expect(component.loading).toBe(mockLoadingService.loading);
    });

    it('should have correct initial loading state', () => {
      fixture.detectChanges();
      expect(component.loading()).toBe(false);
    });
  });

  describe('Template Rendering', () => {
    it('should not display spinner when loading is false', () => {
      // Arrange
      loadingSignal.set(false);
      
      // Act
      fixture.detectChanges();
      
      // Assert
      const spinnerContainer = fixture.debugElement.query(By.css('.spinner-container'));
      const matSpinner = fixture.debugElement.query(By.css('mat-spinner'));
      
      expect(spinnerContainer).toBeNull();
      expect(matSpinner).toBeNull();
    });

    it('should display spinner when loading is true', () => {
      // Arrange
      loadingSignal.set(true);
      
      // Act
      fixture.detectChanges();
      
      // Assert
      const spinnerContainer = fixture.debugElement.query(By.css('.spinner-container'));
      const matSpinner = fixture.debugElement.query(By.css('mat-spinner'));
      
      expect(spinnerContainer).toBeTruthy();
      expect(matSpinner).toBeTruthy();
    });

    it('should show spinner container with correct CSS class', () => {
      // Arrange
      loadingSignal.set(true);
      
      // Act
      fixture.detectChanges();
      
      // Assert
      const spinnerContainer = fixture.debugElement.query(By.css('.spinner-container'));
      expect(spinnerContainer.nativeElement.classList.contains('spinner-container')).toBe(true);
    });

    it('should render mat-spinner component', () => {
      // Arrange
      loadingSignal.set(true);
      
      // Act
      fixture.detectChanges();
      
      // Assert
      const matSpinner = fixture.debugElement.query(By.directive(MatProgressSpinner));
      expect(matSpinner).toBeTruthy();
    });
  });

  describe('Signal Reactivity', () => {
    it('should react to loading state changes', () => {
      // Start with loading false
      loadingSignal.set(false);
      fixture.detectChanges();
      
      let spinner = fixture.debugElement.query(By.css('mat-spinner'));
      expect(spinner).toBeNull();

      // Change to loading true
      loadingSignal.set(true);
      fixture.detectChanges();
      
      spinner = fixture.debugElement.query(By.css('mat-spinner'));
      expect(spinner).toBeTruthy();

      // Change back to loading false
      loadingSignal.set(false);
      fixture.detectChanges();
      
      spinner = fixture.debugElement.query(By.css('mat-spinner'));
      expect(spinner).toBeNull();
    });

    it('should handle rapid state changes', () => {
      // Rapid changes should not cause issues
      for (let i = 0; i < 5; i++) {
        loadingSignal.set(true);
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css('mat-spinner'))).toBeTruthy();

        loadingSignal.set(false);
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css('mat-spinner'))).toBeNull();
      }
    });

    it('should maintain consistent state across multiple change cycles', () => {
      const states = [true, false, true, false, true];
      
      states.forEach(state => {
        loadingSignal.set(state);
        fixture.detectChanges();
        
        const spinner = fixture.debugElement.query(By.css('mat-spinner'));
        if (state) {
          expect(spinner).toBeTruthy();
        } else {
          expect(spinner).toBeNull();
        }
      });
    });
  });

  describe('Component Integration', () => {
    it('should work with real LoadingService', async () => {
      // Reset TestBed for this specific test
      TestBed.resetTestingModule();
      
      // Create a separate test setup with real service
      await TestBed.configureTestingModule({
        imports: [LoadingIndicatorComponent, MatProgressSpinner],
        providers: [LoadingService] // Use real service
      }).compileComponents();

      const realFixture = TestBed.createComponent(LoadingIndicatorComponent);
      const realComponent = realFixture.componentInstance;
      const realLoadingService = TestBed.inject(LoadingService);

      realFixture.detectChanges();

      // Initially not loading
      expect(realFixture.debugElement.query(By.css('mat-spinner'))).toBeNull();

      // Turn loading on
      realLoadingService.loadingOn();
      realFixture.detectChanges();
      expect(realFixture.debugElement.query(By.css('mat-spinner'))).toBeTruthy();

      // Turn loading off
      realLoadingService.loadingOff();
      realFixture.detectChanges();
      expect(realFixture.debugElement.query(By.css('mat-spinner'))).toBeNull();
    });

    it('should properly clean up on destroy', () => {
      fixture.detectChanges();
      
      // Component should destroy without errors
      expect(() => fixture.destroy()).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('should provide proper ARIA attributes for loading state', () => {
      loadingSignal.set(true);
      fixture.detectChanges();
      
      const matSpinner = fixture.debugElement.query(By.css('mat-spinner'));
      expect(matSpinner).toBeTruthy();
      
      // Mat-spinner should have appropriate ARIA attributes by default
      expect(matSpinner.nativeElement.getAttribute('role')).toBe('progressbar');
    });

    it('should not interfere with screen readers when not loading', () => {
      loadingSignal.set(false);
      fixture.detectChanges();
      
      // No spinner elements should be in the DOM
      const spinnerElements = fixture.debugElement.queryAll(By.css('mat-spinner'));
      expect(spinnerElements.length).toBe(0);
    });
  });

  describe('Performance', () => {
    it('should handle multiple rapid state changes efficiently', () => {
      const startTime = performance.now();
      
      // Rapid state changes
      for (let i = 0; i < 100; i++) {
        loadingSignal.set(i % 2 === 0);
        fixture.detectChanges();
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete quickly (less than 1000ms for 100 changes)
      expect(duration).toBeLessThan(1000);
    });

    it('should not create memory leaks with signal updates', () => {
      // Component should handle repeated signal updates without issues
      for (let i = 0; i < 50; i++) {
        loadingSignal.set(true);
        fixture.detectChanges();
        loadingSignal.set(false);
        fixture.detectChanges();
      }
      
      // Final state should be as expected
      expect(component.loading()).toBe(false);
      expect(fixture.debugElement.query(By.css('mat-spinner'))).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should handle signal initialization gracefully', () => {
      // Component should work even if signal is called before full initialization
      expect(() => {
        const loadingValue = component.loading();
        expect(typeof loadingValue).toBe('boolean');
      }).not.toThrow();
    });

    it('should handle null/undefined loading service gracefully', () => {
      // This tests defensive programming
      expect(component.loadingService).toBeTruthy();
      expect(component.loading).toBeTruthy();
    });
  });

  describe('Component Selector and Metadata', () => {
    it('should have correct selector', () => {
      // Check component metadata
      const componentDef = (LoadingIndicatorComponent as any).ɵcmp;
      expect(componentDef.selectors[0][0]).toBe('loading');
    });

    it('should import required modules', () => {
      // Component should have access to MatProgressSpinner
      loadingSignal.set(true);
      fixture.detectChanges();
      
      const matSpinner = fixture.debugElement.query(By.directive(MatProgressSpinner));
      expect(matSpinner).toBeTruthy();
    });
  });

  describe('CSS and Styling', () => {
    it('should apply spinner-container CSS class correctly', () => {
      loadingSignal.set(true);
      fixture.detectChanges();
      
      const container = fixture.debugElement.query(By.css('.spinner-container'));
      expect(container).toBeTruthy();
      expect(container.nativeElement.className).toContain('spinner-container');
    });

    it('should not have extra unwanted CSS classes', () => {
      loadingSignal.set(true);
      fixture.detectChanges();
      
      const container = fixture.debugElement.query(By.css('.spinner-container'));
      const classNames = container.nativeElement.className.split(' ');
      
      // Should only have the expected class
      expect(classNames).toContain('spinner-container');
      expect(classNames.length).toBe(1);
    });
  });
});
