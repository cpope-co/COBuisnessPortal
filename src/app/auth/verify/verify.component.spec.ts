import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

import { VerifyComponent } from './verify.component';
import { AuthService } from '../auth.service';
import { MessagesService } from '../../messages/messages.service';
import { User } from '../../models/user.model';

describe('VerifyComponent', () => {
  let component: VerifyComponent;
  let fixture: ComponentFixture<VerifyComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockMessagesService: jasmine.SpyObj<MessagesService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;

  const mockUser: User = {
    sub: 123,
    name: 'Test User',
    role: 1,
    exp: 1234567890,
    iat: 1234567000,
    refexp: 1234568000,
    fpc: false
  };

  beforeEach(async () => {
    // Create spies for services
    mockAuthService = jasmine.createSpyObj('AuthService', ['verify']);
    mockMessagesService = jasmine.createSpyObj('MessagesService', ['showMessage']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    // Mock ActivatedRoute with different scenarios
    mockActivatedRoute = {
      snapshot: {
        params: { token: 'test-token-123' }
      },
      params: of({ token: 'test-token-123' })
    };

    await TestBed.configureTestingModule({
      imports: [
        VerifyComponent,
        NoopAnimationsModule
      ],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: MessagesService, useValue: mockMessagesService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();
  });

  // 1. Initialization Tests
  describe('Initialization', () => {
    beforeEach(() => {
      mockAuthService.verify.and.returnValue(Promise.resolve(mockUser));
    });

    it('should create the component', () => {
      fixture = TestBed.createComponent(VerifyComponent);
      component = fixture.componentInstance;
      expect(component).toBeTruthy();
    });

    it('should initialize with correct default state', () => {
      fixture = TestBed.createComponent(VerifyComponent);
      component = fixture.componentInstance;
      
      expect(component.isVerifying()).toBe(true);
      expect(component.isVerified()).toBe(false);
      expect(component.token()).toBe('test-token-123');
    });

    it('should extract token from route parameters', () => {
      fixture = TestBed.createComponent(VerifyComponent);
      component = fixture.componentInstance;
      
      expect(component.token()).toBe('test-token-123');
    });

    it('should inject all required dependencies', () => {
      fixture = TestBed.createComponent(VerifyComponent);
      component = fixture.componentInstance;
      
      expect(component.route).toBeDefined();
      expect(component.router).toBeDefined();
      expect(component.authService).toBeDefined();
      expect(component.messageService).toBeDefined();
    });

    it('should start verification process on initialization', () => {
      fixture = TestBed.createComponent(VerifyComponent);
      component = fixture.componentInstance;
      
      expect(mockAuthService.verify).toHaveBeenCalledWith('test-token-123');
    });
  });

  // 2. Token Verification Success Tests
  describe('Successful Token Verification', () => {
    beforeEach(() => {
      mockAuthService.verify.and.returnValue(Promise.resolve(mockUser));
    });

    it('should verify token successfully and navigate to set-password', fakeAsync(() => {
      fixture = TestBed.createComponent(VerifyComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();

      expect(mockAuthService.verify).toHaveBeenCalledWith('test-token-123');
      expect(component.isVerified()).toBe(true);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/set-password']);
    }));

    it('should maintain proper state during successful verification', fakeAsync(() => {
      fixture = TestBed.createComponent(VerifyComponent);
      component = fixture.componentInstance;
      
      // Before completion, should still be verifying
      expect(component.isVerifying()).toBe(true);
      expect(component.isVerified()).toBe(false);

      fixture.detectChanges();
      tick();

      // After completion
      expect(component.isVerified()).toBe(true);
    }));

    it('should log verification progress', fakeAsync(() => {
      spyOn(console, 'log');
      
      fixture = TestBed.createComponent(VerifyComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();

      expect(console.log).toHaveBeenCalledWith('Verifying token...');
      expect(console.log).toHaveBeenCalledWith('Token verified.');
    }));

    it('should handle manual onVerify call', fakeAsync(() => {
      fixture = TestBed.createComponent(VerifyComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();

      // Reset spy and call onVerify again
      mockAuthService.verify.calls.reset();
      mockRouter.navigate.calls.reset();

      component.onVerify();
      tick();

      expect(mockAuthService.verify).toHaveBeenCalledWith('test-token-123');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/set-password']);
    }));
  });

  // 3. Token Verification Failure Tests
  describe('Failed Token Verification', () => {
    const mockError = {
      message: 'Invalid token',
      messages: ['Token has expired', 'Please request a new verification link']
    };

    it('should handle verification failure and show error message', fakeAsync(() => {
      mockAuthService.verify.and.returnValue(Promise.reject(mockError));
      
      fixture = TestBed.createComponent(VerifyComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();

      expect(component.isVerifying()).toBe(false);
      expect(component.isVerified()).toBe(false);
      expect(mockMessagesService.showMessage).toHaveBeenCalledWith(
        'Error verifying token.',
        'danger'
      );
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    }));

    it('should handle error without messages property', fakeAsync(() => {
      const errorWithoutMessages = { message: 'Network error' };
      mockAuthService.verify.and.returnValue(Promise.reject(errorWithoutMessages));

      fixture = TestBed.createComponent(VerifyComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();

      expect(mockMessagesService.showMessage).toHaveBeenCalledWith(
        'Error verifying token.',
        'danger'
      );
    }));

    it('should handle null/undefined error', fakeAsync(() => {
      mockAuthService.verify.and.returnValue(Promise.reject(null));

      fixture = TestBed.createComponent(VerifyComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();

      expect(component.isVerifying()).toBe(false);
      expect(mockMessagesService.showMessage).toHaveBeenCalledWith(
        'Error verifying token.',
        'danger'
      );
    }));

    it('should allow retry after failure', fakeAsync(() => {
      mockAuthService.verify.and.returnValue(Promise.reject(mockError));
      
      fixture = TestBed.createComponent(VerifyComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();

      // Initial failure
      expect(component.isVerifying()).toBe(false);

      // Reset mock to return success for retry
      mockAuthService.verify.and.returnValue(Promise.resolve(mockUser));

      // Retry verification
      component.onVerify();
      tick();

      expect(component.isVerified()).toBe(true);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/set-password']);
    }));
  });

  // 4. Route Parameter Handling Tests
  describe('Route Parameter Handling', () => {
    beforeEach(() => {
      mockAuthService.verify.and.returnValue(Promise.resolve(mockUser));
    });

    it('should handle different token formats', () => {
      const testCases = [
        'simple-token',
        'complex-token-with-dashes-123',
        'TOKEN_WITH_UNDERSCORES_456',
        'mixedCaseToken789',
        '1234567890',
        'very-long-token-string-with-multiple-segments-and-special-characters-123456789'
      ];

      testCases.forEach(tokenValue => {
        mockActivatedRoute.snapshot.params = { token: tokenValue };
        
        const testFixture = TestBed.createComponent(VerifyComponent);
        const testComponent = testFixture.componentInstance;
        
        expect(testComponent.token()).toBe(tokenValue);
      });
    });

    it('should handle empty token parameter', () => {
      mockActivatedRoute.snapshot.params = { token: '' };
      
      const testFixture = TestBed.createComponent(VerifyComponent);
      const testComponent = testFixture.componentInstance;
      
      expect(testComponent.token()).toBe('');
    });

    it('should handle missing token parameter', () => {
      mockActivatedRoute.snapshot.params = {};
      
      const testFixture = TestBed.createComponent(VerifyComponent);
      const testComponent = testFixture.componentInstance;
      
      expect(testComponent.token()).toBeUndefined();
    });

    it('should handle malformed route parameters', () => {
      mockActivatedRoute.snapshot.params = { otherParam: 'value' };
      
      const testFixture = TestBed.createComponent(VerifyComponent);
      const testComponent = testFixture.componentInstance;
      
      expect(testComponent.token()).toBeUndefined();
    });
  });

  // 5. UI State and Template Tests
  describe('UI State and Template', () => {
    it('should display verification in progress message initially', fakeAsync(() => {
      // Use a pending promise to keep verification in progress
      mockAuthService.verify.and.returnValue(new Promise(() => {}));

      fixture = TestBed.createComponent(VerifyComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const titleElement = fixture.debugElement.query(By.css('mat-card-title h1'));
      const contentElement = fixture.debugElement.query(By.css('mat-card-content p'));

      expect(titleElement.nativeElement.textContent.trim()).toBe('Verification in progress');
      expect(contentElement.nativeElement.textContent.trim()).toBe("We're verifying your identity, please wait...");
    }));

    it('should display error message when verification fails', fakeAsync(() => {
      mockAuthService.verify.and.returnValue(Promise.reject(new Error('Token expired')));
      
      fixture = TestBed.createComponent(VerifyComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const titleElement = fixture.debugElement.query(By.css('mat-card-title h1'));
      const contentElement = fixture.debugElement.query(By.css('mat-card-content p'));

      expect(titleElement.nativeElement.textContent.trim()).toBe("For your security, we've sent you a new link");
      expect(contentElement.nativeElement.textContent.trim()).toContain('This link has expired');
    }));

    it('should maintain proper Material Design card structure', () => {
      mockAuthService.verify.and.returnValue(Promise.resolve(mockUser));
      
      fixture = TestBed.createComponent(VerifyComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const cardElement = fixture.debugElement.query(By.css('mat-card'));
      const headerElement = fixture.debugElement.query(By.css('mat-card-header'));
      const titleElement = fixture.debugElement.query(By.css('mat-card-title'));
      const contentElement = fixture.debugElement.query(By.css('mat-card-content'));

      expect(cardElement).toBeTruthy();
      expect(headerElement).toBeTruthy();
      expect(titleElement).toBeTruthy();
      expect(contentElement).toBeTruthy();
    });

    it('should apply correct CSS classes for responsive layout', () => {
      mockAuthService.verify.and.returnValue(Promise.resolve(mockUser));
      
      fixture = TestBed.createComponent(VerifyComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const containerDiv = fixture.debugElement.query(By.css('.row > div'));
      const classList = containerDiv.nativeElement.classList;

      expect(classList.contains('col-xs-12')).toBe(true);
      expect(classList.contains('offset-xs-0')).toBe(true);
      expect(classList.contains('col-10')).toBe(true);
      expect(classList.contains('offset-1')).toBe(true);
    });
  });

  // 6. Signal State Management Tests
  describe('Signal State Management', () => {
    it('should properly manage isVerifying signal state', fakeAsync(() => {
      mockAuthService.verify.and.returnValue(Promise.reject(new Error('Test error')));
      
      fixture = TestBed.createComponent(VerifyComponent);
      component = fixture.componentInstance;
      
      expect(component.isVerifying()).toBe(true);
      
      fixture.detectChanges();
      tick();
      
      expect(component.isVerifying()).toBe(false);
    }));

    it('should properly manage isVerified signal state', fakeAsync(() => {
      mockAuthService.verify.and.returnValue(Promise.resolve(mockUser));
      
      fixture = TestBed.createComponent(VerifyComponent);
      component = fixture.componentInstance;
      
      expect(component.isVerified()).toBe(false);
      
      fixture.detectChanges();
      tick();
      
      expect(component.isVerified()).toBe(true);
    }));

    it('should provide readonly access to signals', () => {
      mockAuthService.verify.and.returnValue(Promise.resolve(mockUser));
      
      fixture = TestBed.createComponent(VerifyComponent);
      component = fixture.componentInstance;
      
      // Verify that signals are readonly (no set method exposed)
      expect(typeof component.isVerifying).toBe('function');
      expect(typeof component.isVerified).toBe('function');
      expect(typeof component.token).toBe('function');
      
      // These should not have set methods
      expect((component.isVerifying as any).set).toBeUndefined();
      expect((component.isVerified as any).set).toBeUndefined();
      expect((component.token as any).set).toBeUndefined();
    });

    it('should maintain signal state consistency across multiple operations', fakeAsync(() => {
      // Start with failure
      mockAuthService.verify.and.returnValue(Promise.reject(new Error('First error')));
      
      fixture = TestBed.createComponent(VerifyComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();
      
      expect(component.isVerifying()).toBe(false);
      expect(component.isVerified()).toBe(false);
      
      // Change to success for next call
      mockAuthService.verify.and.returnValue(Promise.resolve(mockUser));
      
      component.onVerify();
      tick();
      
      expect(component.isVerified()).toBe(true);
    }));
  });

  // 7. Integration Tests
  describe('Integration Tests', () => {
    it('should complete full successful verification workflow', fakeAsync(() => {
      mockAuthService.verify.and.returnValue(Promise.resolve(mockUser));
      
      fixture = TestBed.createComponent(VerifyComponent);
      component = fixture.componentInstance;
      
      // Initial state
      expect(component.isVerifying()).toBe(true);
      expect(component.isVerified()).toBe(false);
      expect(component.token()).toBe('test-token-123');
      
      fixture.detectChanges();
      tick();
      
      // Final state
      expect(mockAuthService.verify).toHaveBeenCalledWith('test-token-123');
      expect(component.isVerified()).toBe(true);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/set-password']);
      expect(mockMessagesService.showMessage).not.toHaveBeenCalled();
    }));

    it('should complete full failed verification workflow', fakeAsync(() => {
      const error = { messages: ['Invalid token'] };
      mockAuthService.verify.and.returnValue(Promise.reject(error));
      
      fixture = TestBed.createComponent(VerifyComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();
      
      expect(mockAuthService.verify).toHaveBeenCalledWith('test-token-123');
      expect(component.isVerifying()).toBe(false);
      expect(component.isVerified()).toBe(false);
      expect(mockMessagesService.showMessage).toHaveBeenCalledWith(
        'Error verifying token.',
        'danger'
      );
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    }));

    it('should handle service dependencies correctly', () => {
      mockAuthService.verify.and.returnValue(Promise.resolve(mockUser));
      
      fixture = TestBed.createComponent(VerifyComponent);
      component = fixture.componentInstance;
      
      expect(component.authService).toBe(mockAuthService);
      expect(component.messageService).toBe(mockMessagesService);
      expect(component.router).toBe(mockRouter);
      expect(component.route).toBe(mockActivatedRoute);
    });
  });

  // 8. Edge Cases and Error Handling
  describe('Edge Cases and Error Handling', () => {
    it('should handle verification with different token formats', fakeAsync(() => {
      const tokens = ['short', 'very-long-token-with-dashes-and-numbers-123456789', 'token_with_underscores', 'TOKEN123'];
      
      tokens.forEach(token => {
        mockAuthService.verify.calls.reset();
        mockAuthService.verify.and.returnValue(Promise.resolve(mockUser));
        mockActivatedRoute.snapshot.params = { token };
        
        const testFixture = TestBed.createComponent(VerifyComponent);
        testFixture.detectChanges();
        tick();
        
        expect(mockAuthService.verify).toHaveBeenCalledWith(token);
      });
    }));

    it('should handle special characters in token', fakeAsync(() => {
      const specialToken = 'token!@#$%^&*()_+-=[]{}|;:,.<>?';
      mockActivatedRoute.snapshot.params = { token: specialToken };
      mockAuthService.verify.and.returnValue(Promise.resolve(mockUser));
      
      const testFixture = TestBed.createComponent(VerifyComponent);
      testFixture.detectChanges();
      tick();
      
      expect(mockAuthService.verify).toHaveBeenCalledWith(specialToken);
    }));

    it('should handle component with empty token gracefully', fakeAsync(() => {
      mockActivatedRoute.snapshot.params = { token: '' };
      mockAuthService.verify.and.returnValue(Promise.reject(new Error('Empty token')));
      
      const testFixture = TestBed.createComponent(VerifyComponent);
      testFixture.detectChanges();
      tick();
      
      expect(mockAuthService.verify).toHaveBeenCalledWith('');
    }));

    it('should not fail when error has no messages', fakeAsync(() => {
      mockAuthService.verify.and.returnValue(Promise.reject(new Error('Simple error')));
      
      fixture = TestBed.createComponent(VerifyComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();
      
      expect(component.isVerifying()).toBe(false);
      expect(mockMessagesService.showMessage).toHaveBeenCalled();
    }));
  });
});
