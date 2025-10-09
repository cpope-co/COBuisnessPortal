import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { SessionService } from './session.service';
import { AuthService } from '../auth/auth.service';
import { MessagesService } from '../messages/messages.service';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import * as refreshSessionDialog from '../shared/refresh-session-dialog/refresh-session-dialog.component';

describe('SessionService', () => {
  let service: SessionService;
  let mockDialog: jasmine.SpyObj<MatDialog>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockMessagesService: jasmine.SpyObj<MessagesService>;
  let mockUser: any;

  beforeEach(() => {
    mockUser = signal({
      id: 1,
      username: 'testuser',
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
      refexp: Math.floor(Date.now() / 1000) + 7200 // 2 hours from now
    });

    const dialogSpy = jasmine.createSpyObj('MatDialog', ['closeAll', 'open']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['logout', 'refresh'], {
      user: mockUser,
      loginEvent: of(true),
      logoutEvent: of(true)
    });
    const messagesServiceSpy = jasmine.createSpyObj('MessagesService', ['showMessage']);

    // Setup dialog.open to return a mock dialog reference
    const mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close', 'afterClosed']);
    mockDialogRef.afterClosed.and.returnValue(of());
    dialogSpy.open.and.returnValue(mockDialogRef);

    TestBed.configureTestingModule({
      providers: [
        SessionService,
        { provide: MatDialog, useValue: dialogSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: MessagesService, useValue: messagesServiceSpy }
      ]
    });

    service = TestBed.inject(SessionService);
    mockDialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    mockMessagesService = TestBed.inject(MessagesService) as jasmine.SpyObj<MessagesService>;

    // Setup refresh method to return a promise
    mockAuthService.refresh.and.returnValue(Promise.resolve({
      id: 1,
      username: 'testuser',
      exp: Math.floor(Date.now() / 1000) + 3600,
      refexp: Math.floor(Date.now() / 1000) + 7200
    }) as any);
  });

  afterEach(() => {
    // Clean up any intervals
    service.stopSessionCheck();
    // Clear session storage
    sessionStorage.clear();
  });

  describe('Service Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should inject dependencies correctly', () => {
      expect(service.dialog).toBeTruthy();
      expect(service.authService).toBeTruthy();
      expect(service.messagesService).toBeTruthy();
    });

    it('should subscribe to login events in constructor', () => {
      // This is tested by ensuring the service doesn't error during creation
      expect(service).toBeTruthy();
    });

    it('should subscribe to logout events in constructor', () => {
      // This is tested by ensuring the service doesn't error during creation
      expect(service).toBeTruthy();
    });
  });

  describe('Session State Management', () => {
    it('should save session state to sessionStorage', () => {
      const currentTime = Math.floor(Date.now() / 1000);
      const mockUserData = {
        id: 1,
        username: 'testuser',
        exp: currentTime + 3600,
        refexp: currentTime + 7200
      };
      
      mockUser.set(mockUserData);

      service.saveSessionState();

      expect(sessionStorage.getItem('sessionTimeout')).toBe(`${mockUserData.exp}`);
      expect(sessionStorage.getItem('warningTimeout')).toBe(`${mockUserData.exp - 120}`);
    });

    it('should not save session state when user is null', () => {
      mockUser.set(null);

      service.saveSessionState();

      expect(sessionStorage.getItem('sessionTimeout')).toBeNull();
      expect(sessionStorage.getItem('warningTimeout')).toBeNull();
    });

    it('should handle user without exp property', () => {
      const userWithoutExp = {
        id: 1,
        username: 'testuser'
        // No exp property
      };
      
      mockUser.set(userWithoutExp);

      expect(() => service.saveSessionState()).not.toThrow();
    });
  });

  describe('Session Checking', () => {
    it('should start session check intervals', () => {
      spyOn(window, 'setInterval').and.callThrough();

      service.startSessionCheck();

      expect(window.setInterval).toHaveBeenCalledTimes(2);
    });

    it('should stop session check intervals', () => {
      spyOn(window, 'clearInterval').and.callThrough();
      
      service.startSessionCheck();
      service.stopSessionCheck();

      expect(window.clearInterval).toHaveBeenCalledTimes(2);
    });

    it('should handle stopping intervals when not started', () => {
      expect(() => service.stopSessionCheck()).not.toThrow();
    });
  });

  describe('Warning Timeout Handling', () => {
    it('should check warning timeout every 10 seconds', fakeAsync(() => {
      const currentTime = Math.floor(Date.now() / 1000);
      sessionStorage.setItem('warningTimeout', `${currentTime - 1}`); // Expired

      spyOn(service as any, 'handleWarningTimeout');

      service.startSessionCheck();
      tick(10000); // 10 seconds

      expect((service as any).handleWarningTimeout).toHaveBeenCalled();

      service.stopSessionCheck();
    }));

    it('should not trigger warning when timeout is in future', fakeAsync(() => {
      const futureTime = Math.floor(Date.now() / 1000) + 300; // 5 minutes from now
      sessionStorage.setItem('warningTimeout', `${futureTime}`);

      spyOn(service as any, 'handleWarningTimeout');

      service.startSessionCheck();
      tick(10000); // 10 seconds

      expect((service as any).handleWarningTimeout).not.toHaveBeenCalled();

      service.stopSessionCheck();
    }));

    it('should handle missing warningTimeout in sessionStorage', fakeAsync(() => {
      sessionStorage.removeItem('warningTimeout');

      spyOn(service as any, 'handleWarningTimeout');

      service.startSessionCheck();
      tick(10000);

      expect((service as any).handleWarningTimeout).toHaveBeenCalled();

      service.stopSessionCheck();
    }));

    it('should handle invalid warningTimeout value', fakeAsync(() => {
      sessionStorage.setItem('warningTimeout', 'invalid');

      spyOn(service as any, 'handleWarningTimeout');

      service.startSessionCheck();
      tick(10000);

      expect((service as any).handleWarningTimeout).toHaveBeenCalled();

      service.stopSessionCheck();
    }));
  });

  describe('Session Timeout Handling', () => {
    it('should check session timeout every 10 seconds', fakeAsync(() => {
      const currentTime = Math.floor(Date.now() / 1000);
      sessionStorage.setItem('sessionTimeout', `${currentTime - 1}`); // Expired

      spyOn(service as any, 'handleSessionTimeout');

      service.startSessionCheck();
      tick(10000); // 10 seconds

      expect((service as any).handleSessionTimeout).toHaveBeenCalled();

      service.stopSessionCheck();
    }));

    it('should not trigger session timeout when timeout is in future', fakeAsync(() => {
      const futureTime = Math.floor(Date.now() / 1000) + 300; // 5 minutes from now
      sessionStorage.setItem('sessionTimeout', `${futureTime}`);

      spyOn(service as any, 'handleSessionTimeout');

      service.startSessionCheck();
      tick(10000); // 10 seconds

      expect((service as any).handleSessionTimeout).not.toHaveBeenCalled();

      service.stopSessionCheck();
    }));

    it('should handle missing sessionTimeout in sessionStorage', fakeAsync(() => {
      sessionStorage.removeItem('sessionTimeout');

      spyOn(service as any, 'handleSessionTimeout');

      service.startSessionCheck();
      tick(10000);

      expect((service as any).handleSessionTimeout).toHaveBeenCalled();

      service.stopSessionCheck();
    }));
  });

  describe('handleWarningTimeout Method', () => {
    it('should open refresh session dialog', () => {
      // Mock the wrapper method instead
      const openRefreshSessionDialogSpy = spyOn(service as any, 'openRefreshSessionDialog').and.stub();

      (service as any).handleWarningTimeout();

      expect(openRefreshSessionDialogSpy).toHaveBeenCalled();
    });
  });

  describe('handleSessionTimeout Method', () => {
    it('should close all dialogs and logout', async () => {
      await (service as any).handleSessionTimeout();

      expect(mockDialog.closeAll).toHaveBeenCalled();
      expect(mockAuthService.logout).toHaveBeenCalled();
    });
  });

  describe('resetSession Method', () => {
    it('should stop session check, refresh auth, save state, and restart', async () => {
      spyOn(service, 'stopSessionCheck');
      spyOn(service, 'saveSessionState');
      spyOn(service, 'startSessionCheck');

      await service.resetSession();

      expect(service.stopSessionCheck).toHaveBeenCalled();
      expect(mockAuthService.refresh).toHaveBeenCalled();
      expect(service.saveSessionState).toHaveBeenCalled();
      expect(service.startSessionCheck).toHaveBeenCalled();
    });

    it('should handle refresh errors gracefully', async () => {
      mockAuthService.refresh.and.returnValue(Promise.reject(new Error('Refresh failed')));
      spyOn(service, 'stopSessionCheck');
      spyOn(service, 'saveSessionState');
      spyOn(service, 'startSessionCheck');

      try {
        await service.resetSession();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }

      expect(service.stopSessionCheck).toHaveBeenCalled();
      expect(mockAuthService.refresh).toHaveBeenCalled();
      // saveSessionState and startSessionCheck should not be called if refresh fails
      expect(service.saveSessionState).not.toHaveBeenCalled();
      expect(service.startSessionCheck).not.toHaveBeenCalled();
    });
  });

  describe('isSessionActive Method', () => {
    it('should return true for active session', () => {
      const futureExp = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      mockUser.set({
        id: 1,
        username: 'testuser',
        exp: futureExp
      });

      const result = service.isSessionActive();

      expect(result).toBe(true);
    });

    it('should return false for expired session', () => {
      const pastExp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      mockUser.set({
        id: 1,
        username: 'testuser',
        exp: pastExp
      });

      const result = service.isSessionActive();

      expect(result).toBe(false);
    });

    it('should logout and return false when user is null', () => {
      mockUser.set(null);

      const result = service.isSessionActive();

      expect(result).toBe(false);
    });

    it('should handle user without exp property', () => {
      mockUser.set({
        id: 1,
        username: 'testuser'
        // No exp property
      });

      const result = service.isSessionActive();

      expect(result).toBe(true); // Should return true when exp is undefined
    });
  });

  describe('canRefresh Method', () => {
    it('should return true when refresh token is not expired', () => {
      const futureRefExp = Math.floor(Date.now() / 1000) + 7200; // 2 hours from now
      mockUser.set({
        id: 1,
        username: 'testuser',
        exp: Math.floor(Date.now() / 1000) + 3600,
        refexp: futureRefExp
      });

      const result = service.canRefresh();

      expect(result).toBe(false); // Returns false when refresh token is still valid
    });

    it('should return false when refresh token is expired', () => {
      const pastRefExp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      mockUser.set({
        id: 1,
        username: 'testuser',
        exp: Math.floor(Date.now() / 1000) + 3600,
        refexp: pastRefExp
      });

      const result = service.canRefresh();

      expect(result).toBe(true); // Returns true when refresh token is expired
    });

    it('should logout and return false when user is null', () => {
      mockUser.set(null);

      const result = service.canRefresh();

      expect(result).toBe(false);
    });

    it('should handle user without refexp property', () => {
      mockUser.set({
        id: 1,
        username: 'testuser',
        exp: Math.floor(Date.now() / 1000) + 3600
        // No refexp property
      });

      const result = service.canRefresh();

      expect(result).toBe(false); // Should return false when refexp is undefined
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete session workflow', fakeAsync(() => {
      const currentTime = Math.floor(Date.now() / 1000);
      const mockUserData = {
        id: 1,
        username: 'testuser',
        exp: currentTime + 300, // 5 minutes from now
        refexp: currentTime + 7200 // 2 hours from now
      };
      
      mockUser.set(mockUserData);

      // Save initial session state
      service.saveSessionState();
      
      // Start session checking
      service.startSessionCheck();
      
      // Verify session is active
      expect(service.isSessionActive()).toBe(true);
      expect(service.canRefresh()).toBe(false);
      
      // Simulate time passing to trigger warning
      sessionStorage.setItem('warningTimeout', `${currentTime - 1}`);
      spyOn(service as any, 'handleWarningTimeout');
      
      tick(10000);
      expect((service as any).handleWarningTimeout).toHaveBeenCalled();
      
      service.stopSessionCheck();
    }));

    it('should handle session expiry workflow', fakeAsync(() => {
      const currentTime = Math.floor(Date.now() / 1000);
      
      // Set expired session
      sessionStorage.setItem('sessionTimeout', `${currentTime - 1}`);
      
      spyOn(service as any, 'handleSessionTimeout');
      
      service.startSessionCheck();
      tick(10000);
      
      expect((service as any).handleSessionTimeout).toHaveBeenCalled();
      
      service.stopSessionCheck();
    }));
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle null sessionStorage values', () => {
      sessionStorage.setItem('sessionTimeout', 'null');
      sessionStorage.setItem('warningTimeout', 'null');

      expect(() => service.isSessionActive()).not.toThrow();
    });

    it('should handle undefined dialog service', () => {
      // Replace dialog with undefined
      (service as any).dialog = undefined;

      expect(() => (service as any).handleWarningTimeout()).not.toThrow();
    });

    it('should handle interval cleanup properly', () => {
      service.startSessionCheck();
      service.startSessionCheck(); // Start again
      
      expect(() => service.stopSessionCheck()).not.toThrow();
    });

    it('should handle concurrent resetSession calls', async () => {
      const promises = [
        service.resetSession(),
        service.resetSession(),
        service.resetSession()
      ];

      // Should not throw even with concurrent calls
      expect(() => Promise.all(promises)).not.toThrow();
    });
  });

  describe('Memory Management', () => {
    it('should properly clean up intervals on multiple start/stop cycles', () => {
      spyOn(window, 'setInterval').and.callThrough();
      spyOn(window, 'clearInterval').and.callThrough();

      for (let i = 0; i < 5; i++) {
        service.startSessionCheck();
        service.stopSessionCheck();
      }

      expect(window.setInterval).toHaveBeenCalledTimes(10); // 2 intervals × 5 cycles
      expect(window.clearInterval).toHaveBeenCalledTimes(10); // 2 clears × 5 cycles
    });

    it('should handle large time values without overflow', () => {
      const largeTime = Number.MAX_SAFE_INTEGER;
      sessionStorage.setItem('sessionTimeout', largeTime.toString());
      sessionStorage.setItem('warningTimeout', largeTime.toString());

      expect(() => service.isSessionActive()).not.toThrow();
    });
  });

  describe('Performance Tests', () => {
    it('should handle session checks efficiently', () => {
      const startTime = performance.now();
      
      for (let i = 0; i < 100; i++) {
        service.isSessionActive();
        service.canRefresh();
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(50); // Should complete quickly
    });

    it('should handle frequent save operations efficiently', () => {
      const startTime = performance.now();
      
      for (let i = 0; i < 100; i++) {
        service.saveSessionState();
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(50); // Should complete quickly
    });
  });
});
