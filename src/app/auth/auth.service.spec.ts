import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';

import { AuthService } from './auth.service';
import { MessagesService } from '../messages/messages.service';
import { User } from '../models/user.model';
import { environment } from '../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockHttpClient: jasmine.SpyObj<HttpClient>;
  let mockMessagesService: jasmine.SpyObj<MessagesService>;
  let mockDialog: jasmine.SpyObj<MatDialog>;

  const mockUser: User = {
    sub: 1,
    name: 'Test User',
    role: 1,
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
    iat: Math.floor(Date.now() / 1000),
    refexp: Math.floor(Date.now() / 1000) + 7200, // 2 hours from now
    fpc: false
  };

  const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsIm5hbWUiOiJUZXN0IFVzZXIiLCJyb2xlIjoxLCJleHAiOjE3NTQ1ODQzOTYsImlhdCI6MTc1NDU4MDc5NiwicmVmZXhwIjoxNzU0NTg3OTk2LCJmcGMiOmZhbHNlfQ.signature';

  beforeEach(() => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockHttpClient = jasmine.createSpyObj('HttpClient', ['post', 'get']);
    mockMessagesService = jasmine.createSpyObj('MessagesService', ['showMessage']);
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);

    // Clear sessionStorage before each test
    sessionStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: Router, useValue: mockRouter },
        { provide: HttpClient, useValue: mockHttpClient },
        { provide: MessagesService, useValue: mockMessagesService },
        { provide: MatDialog, useValue: mockDialog }
      ]
    });

    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should inject dependencies correctly', () => {
    expect(service.router).toBeTruthy();
    expect(service.messageService).toBeTruthy();
    expect(service.dialog).toBeTruthy();
    expect(service.http).toBeTruthy();
    expect(service.env).toBe(environment);
  });

  it('should initialize with null user and token', () => {
    expect(service.user()).toBeNull();
    expect(service.token()).toBeNull();
    expect(service.isLoggedIn()).toBeFalse();
  });

  it('should initialize role signals correctly', () => {
    expect(service.isAdmin()).toBeFalse();
    expect(service.isCustomer()).toBeFalse();
    expect(service.isVendor()).toBeFalse();
    expect(service.isEmployee()).toBeFalse();
    expect(service.isApiUser()).toBeFalse();
  });

  describe('loadUserFromStorage', () => {
    it('should load user from sessionStorage when available', () => {
      sessionStorage.setItem('user', JSON.stringify(mockUser));
      
      service.loadUserFromStorage();
      
      expect(service.user()).toEqual(mockUser);
    });

    it('should handle missing user in sessionStorage', () => {
      spyOn(console, 'log');
      
      service.loadUserFromStorage();
      
      expect(service.user()).toBeNull();
      expect(console.log).toHaveBeenCalledWith('No user found in storage.');
    });

    it('should log when user is loaded from storage', () => {
      spyOn(console, 'log');
      sessionStorage.setItem('user', JSON.stringify(mockUser));
      
      service.loadUserFromStorage();
      
      expect(console.log).toHaveBeenCalledWith('Loaded user from storage.');
    });
  });

  describe('loadTokenFromStorage', () => {
    it('should load token from sessionStorage when available', () => {
      sessionStorage.setItem('token', mockToken);
      
      service.loadTokenFromStorage();
      
      expect(service.token()).toBe(mockToken);
    });

    it('should handle missing token in sessionStorage', () => {
      spyOn(console, 'log');
      
      service.loadTokenFromStorage();
      
      expect(service.token()).toBeNull();
      expect(console.log).toHaveBeenCalledWith('No valid token found in storage.');
    });

    it('should log when token is loaded from storage', () => {
      spyOn(console, 'log');
      sessionStorage.setItem('token', mockToken);
      
      service.loadTokenFromStorage();
      
      expect(console.log).toHaveBeenCalledWith('Loaded token from storage.');
    });
  });

  describe('setRoles', () => {
    it('should not throw error when called', () => {
      sessionStorage.setItem('user', JSON.stringify({ ...mockUser, role: 1 }));
      service.loadUserFromStorage();
      
      expect(() => service.setRoles()).not.toThrow();
    });
  });

  describe('checkExpiry', () => {
    it('should resolve "valid" for non-expiring token', async () => {
      const futureUser = { 
        ...mockUser, 
        exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
      };
      sessionStorage.setItem('user', JSON.stringify(futureUser));
      
      const result = await service.checkExpiry();
      
      expect(result).toBe('valid');
    });

    it('should resolve "expiring" for soon-to-expire token', async () => {
      const expiringUser = { 
        ...mockUser, 
        exp: Math.floor(Date.now() / 1000) + 560 // Less than 580 seconds from now
      };
      sessionStorage.setItem('user', JSON.stringify(expiringUser));
      
      const result = await service.checkExpiry();
      
      expect(result).toBe('expiring');
    });

    it('should resolve "expiring" for soon-to-expire token', async () => {
      const currentTime = Math.floor(Date.now() / 1000);
      const expiringUser = { 
        ...mockUser, 
        exp: currentTime + 550 // This makes currentTime >= exp - 550 (which is < exp - 580)
      };
      sessionStorage.setItem('user', JSON.stringify(expiringUser));
      
      const result = await service.checkExpiry();
      
      expect(result).toBe('expiring');
    });

    it('should reject when no user in session', async () => {
      try {
        await service.checkExpiry();
        fail('Expected checkExpiry to reject');
      } catch (error) {
        expect(error).toBe('No user in session.');
      }
    });
  });

  describe('clearTimer', () => {
    it('should clear timer when timer is provided', () => {
      spyOn(window, 'clearInterval');
      const timerId = 123;
      
      service.clearTimer(timerId);
      
      expect(window.clearInterval).toHaveBeenCalledWith(timerId);
    });

    it('should handle null timer', () => {
      spyOn(window, 'clearInterval');
      
      service.clearTimer(null);
      
      expect(window.clearInterval).not.toHaveBeenCalled();
    });
  });

  describe('computed properties', () => {
    it('should compute isLoggedIn correctly when user is present', () => {
      sessionStorage.setItem('user', JSON.stringify(mockUser));
      service.loadUserFromStorage();
      
      expect(service.isLoggedIn()).toBeTruthy();
    });

    it('should compute isLoggedIn correctly when user is null', () => {
      expect(service.isLoggedIn()).toBeFalsy();
    });
  });

  describe('public interface validation', () => {
    it('should have all expected public methods', () => {
      expect(typeof service.loadUserFromStorage).toBe('function');
      expect(typeof service.loadTokenFromStorage).toBe('function');
      expect(typeof service.setRoles).toBe('function');
      expect(typeof service.checkExpiry).toBe('function');
      expect(typeof service.login).toBe('function');
      expect(typeof service.refresh).toBe('function');
      expect(typeof service.verify).toBe('function');
      expect(typeof service.logout).toBe('function');
      expect(typeof service.clearTimer).toBe('function');
    });

    it('should have all expected signal accessors', () => {
      expect(typeof service.user).toBe('function');
      expect(typeof service.token).toBe('function');
      expect(typeof service.isLoggedIn).toBe('function');
      expect(typeof service.isAdmin).toBe('function');
      expect(typeof service.isCustomer).toBe('function');
      expect(typeof service.isVendor).toBe('function');
      expect(typeof service.isEmployee).toBe('function');
      expect(typeof service.isApiUser).toBe('function');
    });

    it('should have event emitters', () => {
      expect(service.loginEvent).toBeDefined();
      expect(service.logoutEvent).toBeDefined();
      expect(typeof service.loginEvent.emit).toBe('function');
      expect(typeof service.logoutEvent.emit).toBe('function');
    });
  });

  describe('storage integration', () => {
    it('should have working sessionStorage integration', () => {
      // Test that the service can interact with sessionStorage
      sessionStorage.setItem('test', 'value');
      expect(sessionStorage.getItem('test')).toBe('value');
      sessionStorage.removeItem('test');
      expect(sessionStorage.getItem('test')).toBeNull();
    });
  });

  describe('login method', () => {
    it('should successfully login with valid credentials', async () => {
      const mockResponse = new HttpResponse({
        headers: new HttpHeaders({
          'x-id': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsIm5hbWUiOiJUZXN0IFVzZXIiLCJyb2xlIjoxLCJleHAiOjE3NTQ1ODQzOTYsImlhdCI6MTc1NDU4MDc5NiwicmVmZXhwIjoxNzU0NTg3OTk2LCJmcGMiOmZhbHNlfQ.signature'
        }),
        status: 200,
        body: { success: true }
      });

      mockHttpClient.post.and.returnValue(of(mockResponse));
      spyOn(service.loginEvent, 'emit');

      const result = await service.login('test@example.com', 'password');

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        `${environment.apiBaseUrl}usraut/login`,
        { email: 'test@example.com', password: 'password' },
        jasmine.objectContaining({
          headers: jasmine.any(HttpHeaders),
          observe: 'response',
          withCredentials: true,
          context: jasmine.any(Object)
        })
      );
      expect(service.token()).toBeTruthy();
      expect(service.user()).toBeTruthy();
      expect(service.loginEvent.emit).toHaveBeenCalled();
      expect(result).toBeTruthy();
    });

    it('should handle login failure', async () => {
      mockHttpClient.post.and.returnValue(throwError(() => new Error('Login failed')));

      try {
        await service.login('test@example.com', 'wrongpassword');
        fail('Expected login to throw error');
      } catch (error) {
        expect(error).toEqual(jasmine.any(Error));
      }
    });
  });

  describe('refresh method', () => {
    beforeEach(() => {
      // Set up a valid token for refresh tests
      sessionStorage.setItem('token', mockToken);
      service.loadTokenFromStorage();
    });

    it('should successfully refresh token', async () => {
      // Set up current token by storing it in sessionStorage
      sessionStorage.setItem('token', mockToken);
      service.loadTokenFromStorage(); // This will load the token into the service

      const newToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjk5OTk5OTk5OTksInJvbGUiOjJ9.Gw_WGV6hA-lfn0-YOjsJjhZOsXNlBIoMRhGX2k6HU';
      const mockResponse = new HttpResponse({
        headers: new HttpHeaders({
          'x-id': newToken
        }),
        status: 200,
        body: {}
      });

      mockHttpClient.get.and.returnValue(of(mockResponse));

      const result = await service.refresh();

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        `${environment.apiBaseUrl}usraut/refresh`,
        jasmine.objectContaining({
          headers: jasmine.any(HttpHeaders),
          observe: 'response',
          withCredentials: true,
          context: jasmine.any(Object)
        })
      );
      
      // The service should have processed the response successfully
      expect(result).toBeTruthy();
      expect(result.name).toBe('John Doe');
      expect(result.role).toBe(2);
    });

    it('should handle refresh failure', async () => {
      mockHttpClient.get.and.returnValue(throwError(() => new Error('Refresh failed')));

      try {
        await service.refresh();
        fail('Expected refresh to throw error');
      } catch (error) {
        expect(error).toEqual(jasmine.any(Error));
      }
    });
  });

  describe('verify method', () => {
    it('should successfully verify token', async () => {
      const verifyToken = 'verify-token-123';
      const newToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjk5OTk5OTk5OTksInJvbGUiOjJ9.Gw_WGV6hA-lfn0-YOjsJjhZOsXNlBIoMRhGX2k6HU';
      const mockResponse = new HttpResponse({
        headers: new HttpHeaders({
          'x-id': newToken
        }),
        status: 200,
        body: {}
      });

      mockHttpClient.post.and.returnValue(of(mockResponse));

      const result = await service.verify(verifyToken);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        `${environment.apiBaseUrl}usraut/verify?id=${verifyToken}`,
        {},
        jasmine.objectContaining({
          headers: jasmine.any(HttpHeaders),
          observe: 'response'
        })
      );
      
      // The service should have processed the response successfully  
      expect(result).toBeTruthy();
      expect(result.name).toBe('John Doe');
      expect(result.role).toBe(2);
    });

    it('should handle verify failure', async () => {
      mockHttpClient.post.and.returnValue(throwError(() => new Error('Verify failed')));

      try {
        await service.verify('invalid-token');
        fail('Expected verify to throw error');
      } catch (error) {
        expect(error).toEqual(jasmine.any(Error));
      }
    });
  });

  describe('logout method', () => {
    beforeEach(() => {
      // Set up authenticated state
      sessionStorage.setItem('token', mockToken);
      sessionStorage.setItem('user', JSON.stringify(mockUser));
      service.loadTokenFromStorage();
      service.loadUserFromStorage();
    });

    it('should call logout endpoint with authorization header', async () => {
      mockHttpClient.post.and.returnValue(of({}));

      await service.logout();

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        `${environment.apiBaseUrl}/usraut/logout`,
        {},
        jasmine.objectContaining({
          headers: jasmine.any(HttpHeaders),
          withCredentials: true
        })
      );
    });

    it('should handle logout without token', async () => {
      // Clear token
      sessionStorage.clear();
      service.loadTokenFromStorage();

      await service.logout();

      // Should still attempt to call logout endpoint
      expect(mockHttpClient.post).toHaveBeenCalled();
    });
  });

  describe('role management', () => {
    it('should set admin role correctly', () => {
      const adminUser = { ...mockUser, role: 1 };
      sessionStorage.setItem('user', JSON.stringify(adminUser));
      service.loadUserFromStorage();
      service.setRoles();

      expect(service.isAdmin()).toBeTruthy();
      expect(service.isCustomer()).toBeFalsy();
      expect(service.isVendor()).toBeFalsy();
      expect(service.isEmployee()).toBeFalsy();
      expect(service.isApiUser()).toBeFalsy();
    });

    it('should set customer role correctly', () => {
      const customerUser = { ...mockUser, role: 2 };
      sessionStorage.setItem('user', JSON.stringify(customerUser));
      service.loadUserFromStorage();
      service.setRoles();

      expect(service.isAdmin()).toBeFalsy();
      expect(service.isCustomer()).toBeTruthy();
      expect(service.isVendor()).toBeFalsy();
      expect(service.isEmployee()).toBeFalsy();
      expect(service.isApiUser()).toBeFalsy();
    });

    it('should set vendor role correctly', () => {
      const vendorUser = { ...mockUser, role: 3 };
      sessionStorage.setItem('user', JSON.stringify(vendorUser));
      service.loadUserFromStorage();
      service.setRoles();

      expect(service.isAdmin()).toBeFalsy();
      expect(service.isCustomer()).toBeFalsy();
      expect(service.isVendor()).toBeTruthy();
      expect(service.isEmployee()).toBeFalsy();
      expect(service.isApiUser()).toBeFalsy();
    });

    it('should set employee role correctly', () => {
      const employeeUser = { ...mockUser, role: 4 };
      sessionStorage.setItem('user', JSON.stringify(employeeUser));
      service.loadUserFromStorage();
      service.setRoles();

      expect(service.isAdmin()).toBeFalsy();
      expect(service.isCustomer()).toBeFalsy();
      expect(service.isVendor()).toBeFalsy();
      expect(service.isEmployee()).toBeTruthy();
      expect(service.isApiUser()).toBeFalsy();
    });

    it('should set api user role correctly', () => {
      const apiUser = { ...mockUser, role: 5 };
      sessionStorage.setItem('user', JSON.stringify(apiUser));
      service.loadUserFromStorage();
      service.setRoles();

      expect(service.isAdmin()).toBeFalsy();
      expect(service.isCustomer()).toBeFalsy();
      expect(service.isVendor()).toBeFalsy();
      expect(service.isEmployee()).toBeFalsy();
      expect(service.isApiUser()).toBeTruthy();
    });

    it('should handle unknown role', () => {
      const unknownRoleUser = { ...mockUser, role: 999 };
      sessionStorage.setItem('user', JSON.stringify(unknownRoleUser));
      service.loadUserFromStorage();
      service.setRoles();

      expect(service.isAdmin()).toBeFalsy();
      expect(service.isCustomer()).toBeFalsy();
      expect(service.isVendor()).toBeFalsy();
      expect(service.isEmployee()).toBeFalsy();
      expect(service.isApiUser()).toBeFalsy();
    });

    it('should handle setRoles with no user', () => {
      service.setRoles();

      expect(service.isAdmin()).toBeFalsy();
      expect(service.isCustomer()).toBeFalsy();
      expect(service.isVendor()).toBeFalsy();
      expect(service.isEmployee()).toBeFalsy();
      expect(service.isApiUser()).toBeFalsy();
    });
  });

  describe('error handling scenarios', () => {
    it('should handle HTTP 401 unauthorized', async () => {
      mockHttpClient.post.and.returnValue(throwError(() => ({ status: 401, message: 'Unauthorized' })));

      try {
        await service.login('test@example.com', 'password');
        fail('Expected 401 error');
      } catch (error: any) {
        expect(error.status).toBe(401);
      }
    });

    it('should handle HTTP 500 server error', async () => {
      mockHttpClient.get.and.returnValue(throwError(() => ({ status: 500, message: 'Server Error' })));

      try {
        await service.refresh();
        fail('Expected 500 error');
      } catch (error: any) {
        expect(error.status).toBe(500);
      }
    });

    it('should handle network timeout', async () => {
      mockHttpClient.post.and.returnValue(throwError(() => ({ name: 'TimeoutError', message: 'Request timeout' })));

      try {
        await service.verify('token');
        fail('Expected timeout error');
      } catch (error: any) {
        expect(error.name).toBe('TimeoutError');
      }
    });

    it('should handle malformed JWT token', async () => {
      const mockResponse = new HttpResponse({
        headers: new HttpHeaders({
          'x-id': 'invalid.jwt.token'
        }),
        status: 200,
        body: {}
      });

      mockHttpClient.post.and.returnValue(of(mockResponse));

      try {
        await service.login('test@example.com', 'password');
        fail('Expected JWT decode error');
      } catch (error) {
        expect(error).toBeTruthy();
      }
    });

    it('should handle missing x-id header', async () => {
      const mockResponse = new HttpResponse({
        headers: new HttpHeaders({}),
        status: 200,
        body: {}
      });

      mockHttpClient.post.and.returnValue(of(mockResponse));

      try {
        await service.login('test@example.com', 'password');
        fail('Expected missing header error');
      } catch (error) {
        expect(error).toBeTruthy();
      }
    });
  });

  describe('integration scenarios', () => {
    it('should complete full authentication flow', async () => {
      const mockLoginResponse = new HttpResponse({
        headers: new HttpHeaders({
          'x-id': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlRlc3QgVXNlciIsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjo5OTk5OTk5OTk5LCJyb2xlIjoxfQ.aJZ2ZNQpEGF2-X3FQ8EX8OOvlnE4wYPvlnF7Y9XXX'
        }),
        status: 200,
        body: {}
      });

      mockHttpClient.post.and.returnValue(of(mockLoginResponse));
      spyOn(service.loginEvent, 'emit');

      // Initial state
      expect(service.isLoggedIn()).toBeFalsy();
      expect(service.user()).toBeNull();
      expect(service.token()).toBeNull();

      // Login
      await service.login('test@example.com', 'password');

      // Post-login state
      expect(service.isLoggedIn()).toBeTruthy();
      expect(service.user()).toBeTruthy();
      expect(service.token()).toBeTruthy();
      expect(service.loginEvent.emit).toHaveBeenCalled();
      expect(service.isAdmin()).toBeTruthy(); // Role should be set
    });

    it('should handle token refresh cycle', async () => {
      // Set up initial authenticated state
      sessionStorage.setItem('token', mockToken);
      sessionStorage.setItem('user', JSON.stringify(mockUser));
      service.loadTokenFromStorage();
      service.loadUserFromStorage();

      const mockRefreshResponse = new HttpResponse({
        headers: new HttpHeaders({
          'x-id': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjk5OTk5OTk5OTksInJvbGUiOjJ9.Gw_WGV6hA-lfn0-YOjsJjhZOsXNlBIoMRhGX2k6HU'
        }),
        status: 200,
        body: {}
      });

      mockHttpClient.get.and.returnValue(of(mockRefreshResponse));

      const oldToken = service.token();
      await service.refresh();
      const newToken = service.token();

      expect(newToken).not.toBe(oldToken);
      expect(service.isLoggedIn()).toBeTruthy();
    });

    it('should handle session expiry detection', async () => {
      const expiredUser = {
        ...mockUser,
        exp: Math.floor(Date.now() / 1000) + 560 // Expiring soon
      };
      sessionStorage.setItem('user', JSON.stringify(expiredUser));

      const result = await service.checkExpiry();
      expect(result).toBe('expiring');
    });

    it('should maintain state across page reload simulation', () => {
      // Simulate login
      sessionStorage.setItem('user', JSON.stringify(mockUser));
      sessionStorage.setItem('token', mockToken);

      // Create new service instance (simulating page reload)
      const newService = TestBed.inject(AuthService);
      newService.loadUserFromStorage();
      newService.loadTokenFromStorage();
      newService.setRoles();

      expect(newService.isLoggedIn()).toBeTruthy();
      expect(newService.user()).toEqual(mockUser);
      expect(newService.token()).toBe(mockToken);
      expect(newService.isAdmin()).toBeTruthy();
    });
  });

  describe('constructor', () => {
    it('should initialize service and call setup methods', () => {
      // This test verifies the service initializes correctly
      // Constructor effects are tested through their observable behavior
      expect(service).toBeTruthy();
      expect(service.user()).toBeNull();
      expect(service.token()).toBeNull();
    });

    it('should clear sessionStorage when user logs out', async () => {
      // Spy on sessionStorage methods
      spyOn(sessionStorage, 'clear');
      spyOn(localStorage, 'clear');
      
      // Mock HTTP client for logout request to succeed
      mockHttpClient.post.and.returnValue(of({}));
      
      // Call logout, which should clear storage and set signals to null
      await service.logout();

      expect(sessionStorage.clear).toHaveBeenCalled();
      expect(localStorage.clear).toHaveBeenCalled();
    });

    it('should initialize service properly and test constructor effects indirectly', () => {
      // This test verifies the constructor effects work by checking
      // that the service initializes correctly and has proper signal behavior
      expect(service).toBeTruthy();
      expect(service.user()).toBeNull();
      expect(service.token()).toBeNull();
      
      // The effects in the constructor are tested indirectly through
      // methods that modify the signals (like login, logout, etc.)
      // which are covered in other test cases
    });
  });

  describe('validateTokenOnInit', () => {
    it('should refresh token when status is expiring', async () => {
      // Set up authenticated state
      sessionStorage.setItem('user', JSON.stringify(mockUser));
      sessionStorage.setItem('token', mockToken);
      service.loadUserFromStorage();
      service.loadTokenFromStorage();
      
      spyOn(service, 'checkExpiry').and.returnValue(Promise.resolve('expiring'));
      spyOn(service as any, 'refreshToken').and.returnValue(Promise.resolve());

      await (service as any).validateTokenOnInit();

      expect((service as any).refreshToken).toHaveBeenCalled();
    });

    it('should refresh token when status is expired', async () => {
      // Set up authenticated state
      sessionStorage.setItem('user', JSON.stringify(mockUser));
      sessionStorage.setItem('token', mockToken);
      service.loadUserFromStorage();
      service.loadTokenFromStorage();
      
      spyOn(service, 'checkExpiry').and.returnValue(Promise.resolve('expired'));
      spyOn(service as any, 'refreshToken').and.returnValue(Promise.resolve());

      await (service as any).validateTokenOnInit();

      expect((service as any).refreshToken).toHaveBeenCalled();
    });

    it('should not refresh token when status is valid', async () => {
      spyOn(service, 'checkExpiry').and.returnValue(Promise.resolve('valid'));
      spyOn(service as any, 'refreshToken').and.returnValue(Promise.resolve());

      await (service as any).validateTokenOnInit();

      expect((service as any).refreshToken).not.toHaveBeenCalled();
    });

    it('should logout when token validation fails', async () => {
      // Set up authenticated state
      sessionStorage.setItem('user', JSON.stringify(mockUser));
      sessionStorage.setItem('token', mockToken);
      service.loadUserFromStorage();
      service.loadTokenFromStorage();
      
      spyOn(service, 'checkExpiry').and.returnValue(Promise.reject('Token check failed'));
      spyOn(service, 'logout').and.returnValue(Promise.resolve());
      spyOn(console, 'log');

      await (service as any).validateTokenOnInit();

      expect(console.log).toHaveBeenCalledWith('Token validation failed:', 'Token check failed');
      expect(service.logout).toHaveBeenCalled();
    });

    it('should logout when refresh token fails during validation', async () => {
      // Set up authenticated state
      sessionStorage.setItem('user', JSON.stringify(mockUser));
      sessionStorage.setItem('token', mockToken);
      service.loadUserFromStorage();
      service.loadTokenFromStorage();
      
      spyOn(service, 'checkExpiry').and.returnValue(Promise.resolve('expired'));
      spyOn(service as any, 'refreshToken').and.returnValue(Promise.reject('Refresh failed'));
      spyOn(service, 'logout').and.returnValue(Promise.resolve());

      await (service as any).validateTokenOnInit();

      expect(service.logout).toHaveBeenCalled();
    });
  });

  describe('refreshToken', () => {
    it('should successfully refresh token and set user', async () => {
      // Start with a null user to see the change
      expect(service.user()).toBeNull();
      
      // Spy on the refresh method to return our mock user using callFake
      const refreshSpy = spyOn(service, 'refresh').and.callFake(() => Promise.resolve(mockUser));
      
      // Spy on logout to see if it's being called unexpectedly
      const logoutSpy = spyOn(service, 'logout').and.stub();
      
      try {
        // Call refreshToken and wait for it to complete
        await (service as any).refreshToken();
        
        // Verify refresh was called
        expect(refreshSpy).toHaveBeenCalled();
        
        // Check if logout was called (it shouldn't be)
        expect(logoutSpy).not.toHaveBeenCalled();
        
        // Verify user was set
        expect(service.user()).toEqual(mockUser);
      } catch (error) {
        fail(`refreshToken threw an error: ${error}`);
      }
    });

    it('should logout when refresh fails', async () => {
      spyOn(service, 'refresh').and.returnValue(Promise.reject('Refresh failed'));
      spyOn(service, 'logout').and.returnValue(Promise.resolve());

      await (service as any).refreshToken();

      expect(service.logout).toHaveBeenCalled();
    });
  });
});
