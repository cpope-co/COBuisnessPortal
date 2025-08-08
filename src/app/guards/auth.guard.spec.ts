import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { signal } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { MessagesService } from '../messages/messages.service';
import { isUserAuthenticated, isUserNotAuthenticated } from './auth.guard';

describe('Auth Guards', () => {
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockMessagesService: jasmine.SpyObj<MessagesService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockRoute: ActivatedRouteSnapshot;
  let mockState: RouterStateSnapshot;
  let isLoggedInSignal: ReturnType<typeof signal<boolean>>;

  beforeEach(() => {
    isLoggedInSignal = signal(false);
    
    const authServiceSpy = jasmine.createSpyObj('AuthService', [], {
      isLoggedIn: isLoggedInSignal
    });
    const messagesServiceSpy = jasmine.createSpyObj('MessagesService', ['showMessage']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: MessagesService, useValue: messagesServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    mockMessagesService = TestBed.inject(MessagesService) as jasmine.SpyObj<MessagesService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    mockRoute = {} as ActivatedRouteSnapshot;
    mockState = {} as RouterStateSnapshot;
  });

  describe('isUserAuthenticated', () => {
    it('should be created', () => {
      expect(isUserAuthenticated).toBeTruthy();
    });

    it('should return true when user is logged in', () => {
      // Arrange
      isLoggedInSignal.set(true);

      // Act
      const result = TestBed.runInInjectionContext(() => 
        isUserAuthenticated(mockRoute, mockState)
      );

      // Assert
      expect(result).toBe(true);
      expect(mockMessagesService.showMessage).not.toHaveBeenCalled();
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should return false when user is not logged in', () => {
      // Arrange
      isLoggedInSignal.set(false);

      // Act
      const result = TestBed.runInInjectionContext(() => 
        isUserAuthenticated(mockRoute, mockState)
      );

      // Assert
      expect(result).toBe(false);
    });

    it('should show danger message when user is not logged in', () => {
      // Arrange
      isLoggedInSignal.set(false);

      // Act
      TestBed.runInInjectionContext(() => 
        isUserAuthenticated(mockRoute, mockState)
      );

      // Assert
      expect(mockMessagesService.showMessage).toHaveBeenCalledWith(
        'You must be logged in to access this page.',
        'danger'
      );
    });

    it('should navigate to login when user is not logged in', () => {
      // Arrange
      isLoggedInSignal.set(false);

      // Act
      TestBed.runInInjectionContext(() => 
        isUserAuthenticated(mockRoute, mockState)
      );

      // Assert
      expect(mockRouter.navigate).toHaveBeenCalledWith(['auth/login']);
    });

    it('should call all required services when user is not authenticated', () => {
      // Arrange
      isLoggedInSignal.set(false);

      // Act
      TestBed.runInInjectionContext(() => 
        isUserAuthenticated(mockRoute, mockState)
      );

      // Assert
      expect(mockMessagesService.showMessage).toHaveBeenCalledTimes(1);
      expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
    });

    it('should not call messages or router when user is authenticated', () => {
      // Arrange
      isLoggedInSignal.set(true);

      // Act
      TestBed.runInInjectionContext(() => 
        isUserAuthenticated(mockRoute, mockState)
      );

      // Assert
      expect(mockMessagesService.showMessage).toHaveBeenCalledTimes(0);
      expect(mockRouter.navigate).toHaveBeenCalledTimes(0);
    });
  });

  describe('isUserNotAuthenticated', () => {
    it('should be created', () => {
      expect(isUserNotAuthenticated).toBeTruthy();
    });

    it('should return true when user is not logged in', () => {
      // Arrange
      isLoggedInSignal.set(false);

      // Act
      const result = TestBed.runInInjectionContext(() => 
        isUserNotAuthenticated(mockRoute, mockState)
      );

      // Assert
      expect(result).toBe(true);
      expect(mockMessagesService.showMessage).not.toHaveBeenCalled();
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should return false when user is logged in', () => {
      // Arrange
      isLoggedInSignal.set(true);

      // Act
      const result = TestBed.runInInjectionContext(() => 
        isUserNotAuthenticated(mockRoute, mockState)
      );

      // Assert
      expect(result).toBe(false);
    });

    it('should show info message when user is already logged in', () => {
      // Arrange
      isLoggedInSignal.set(true);

      // Act
      TestBed.runInInjectionContext(() => 
        isUserNotAuthenticated(mockRoute, mockState)
      );

      // Assert
      expect(mockMessagesService.showMessage).toHaveBeenCalledWith(
        'You are already logged in.',
        'info'
      );
    });

    it('should navigate to home when user is already logged in', () => {
      // Arrange
      isLoggedInSignal.set(true);

      // Act
      TestBed.runInInjectionContext(() => 
        isUserNotAuthenticated(mockRoute, mockState)
      );

      // Assert
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
    });

    it('should call all required services when user is already authenticated', () => {
      // Arrange
      isLoggedInSignal.set(true);

      // Act
      TestBed.runInInjectionContext(() => 
        isUserNotAuthenticated(mockRoute, mockState)
      );

      // Assert
      expect(mockMessagesService.showMessage).toHaveBeenCalledTimes(1);
      expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
    });

    it('should not call messages or router when user is not authenticated', () => {
      // Arrange
      isLoggedInSignal.set(false);

      // Act
      TestBed.runInInjectionContext(() => 
        isUserNotAuthenticated(mockRoute, mockState)
      );

      // Assert
      expect(mockMessagesService.showMessage).toHaveBeenCalledTimes(0);
      expect(mockRouter.navigate).toHaveBeenCalledTimes(0);
    });
  });

  describe('Integration Tests', () => {
    it('should have opposite behavior - authenticated vs not authenticated', () => {
      // Test when user is logged in
      isLoggedInSignal.set(true);
      
      const authenticatedResult = TestBed.runInInjectionContext(() => 
        isUserAuthenticated(mockRoute, mockState)
      );
      const notAuthenticatedResult = TestBed.runInInjectionContext(() => 
        isUserNotAuthenticated(mockRoute, mockState)
      );

      expect(authenticatedResult).toBe(true);
      expect(notAuthenticatedResult).toBe(false);

      // Reset calls
      mockMessagesService.showMessage.calls.reset();
      mockRouter.navigate.calls.reset();

      // Test when user is not logged in
      isLoggedInSignal.set(false);
      
      const authenticatedResult2 = TestBed.runInInjectionContext(() => 
        isUserAuthenticated(mockRoute, mockState)
      );
      const notAuthenticatedResult2 = TestBed.runInInjectionContext(() => 
        isUserNotAuthenticated(mockRoute, mockState)
      );

      expect(authenticatedResult2).toBe(false);
      expect(notAuthenticatedResult2).toBe(true);
    });

    it('should use different message types and navigation paths', () => {
      // Test authenticated user trying to access non-authenticated route
      isLoggedInSignal.set(true);
      
      TestBed.runInInjectionContext(() => 
        isUserNotAuthenticated(mockRoute, mockState)
      );

      expect(mockMessagesService.showMessage).toHaveBeenCalledWith(
        'You are already logged in.',
        'info'
      );
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);

      // Reset calls
      mockMessagesService.showMessage.calls.reset();
      mockRouter.navigate.calls.reset();

      // Test non-authenticated user trying to access authenticated route
      isLoggedInSignal.set(false);
      
      TestBed.runInInjectionContext(() => 
        isUserAuthenticated(mockRoute, mockState)
      );

      expect(mockMessagesService.showMessage).toHaveBeenCalledWith(
        'You must be logged in to access this page.',
        'danger'
      );
      expect(mockRouter.navigate).toHaveBeenCalledWith(['auth/login']);
    });
  });
});
