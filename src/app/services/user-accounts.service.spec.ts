import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserAccountService } from './user-accounts.service';
import { UserAccount } from '../models/user-accounts.model';
import { apiResponse } from '../models/response.model';
import { environment } from '../../environments/environment';

// Helper function to create a complete UserAccount for testing
function createMockUserAccount(overrides: Partial<UserAccount> = {}): UserAccount {
  return {
    usunbr: 1,
    usemail: 'test@example.com',
    usfname: 'Test',
    uslname: 'User',
    usstat: 'A',
    usfpc: false,
    usnfla: 0,
    usibmi: false,
    usroleid: 1,
    usidle: 30,
    usabnum: 0,
    usplcts: new Date('2023-01-01'),
    uslflats: new Date('2023-01-01'),
    usllts: new Date('2023-01-01'),
    uscrts: new Date('2023-01-01'),
    ...overrides
  };
}

describe('UserAccountService', () => {
  let service: UserAccountService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserAccountService]
    });
    service = TestBed.inject(UserAccountService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('Service Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should inject HttpClient', () => {
      expect(service.http).toBeTruthy();
    });

    it('should have environment configuration', () => {
      expect(service.env).toBeTruthy();
      expect(service.env).toBe(environment);
    });

    it('should initialize signals properly', () => {
      expect(service.userAccountsSignal).toBeTruthy();
      expect(service.userAccounts).toBeTruthy();
      expect(service.userAccounts()).toEqual([]);
    });
  });

  describe('loadAllUserAccounts Method', () => {
    it('should load all user accounts successfully', async () => {
      const mockUserAccounts: UserAccount[] = [
        createMockUserAccount({
          usunbr: 1,
          usemail: 'user1@example.com',
          usfname: 'John',
          uslname: 'Doe',
          usstat: 'A'
        }),
        createMockUserAccount({
          usunbr: 2,
          usemail: 'user2@example.com',
          usfname: 'Jane',
          uslname: 'Smith',
          usstat: 'I'
        })
      ];

      const mockResponse: apiResponse = {
        success: true,
        data: mockUserAccounts
      };

      const promise = service.loadAllUserAccounts();

      const req = httpMock.expectOne(`${environment.apiBaseUrl}user/getusrs`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);

      const result = await promise;

      expect(result).toEqual(mockUserAccounts);
      expect(service.userAccounts()).toEqual(mockUserAccounts);
    });

    it('should handle empty user accounts list', async () => {
      const mockResponse: apiResponse = {
        success: true,
        data: []
      };

      const promise = service.loadAllUserAccounts();

      const req = httpMock.expectOne(`${environment.apiBaseUrl}user/getusrs`);
      req.flush(mockResponse);

      const result = await promise;

      expect(result).toEqual([]);
      expect(service.userAccounts()).toEqual([]);
    });

    it('should handle HTTP errors', async () => {
      const promise = service.loadAllUserAccounts();

      const req = httpMock.expectOne(`${environment.apiBaseUrl}user/getusrs`);
      req.error(new ProgressEvent('Network Error'), {
        status: 500,
        statusText: 'Internal Server Error'
      });

      try {
        await promise;
        fail('Expected HTTP error to be thrown');
      } catch (error) {
        expect(error).toBeTruthy();
      }
    });

    it('should update signal with loaded data', async () => {
      const mockUserAccounts: UserAccount[] = [
        createMockUserAccount({
          usunbr: 1,
          usemail: 'user1@example.com',
          usfname: 'John',
          uslname: 'Doe'
        })
      ];

      const mockResponse: apiResponse = {
        success: true,
        data: mockUserAccounts
      };

      const promise = service.loadAllUserAccounts();

      const req = httpMock.expectOne(`${environment.apiBaseUrl}user/getusrs`);
      req.flush(mockResponse);

      const result = await promise;
      expect(result).toEqual(mockUserAccounts);
      expect(service.userAccounts()).toEqual(mockUserAccounts);
    });
  });

  describe('loadUserAccountById Method', () => {
    it('should load user account by ID successfully', async () => {
      const userId = 123;
      const mockUserAccount: UserAccount = createMockUserAccount({
        usunbr: userId,
        usemail: 'test@example.com',
        usfname: 'Test',
        uslname: 'User',
        usstat: 'A'
      });

      const mockResponse: apiResponse = {
        success: true,
        data: mockUserAccount
      };

      const promise = service.loadUserAccountById(userId);

      const req = httpMock.expectOne(`${environment.apiBaseUrl}user/getusr?usunbr=${userId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);

      const result = await promise;
      expect(result).toEqual(mockUserAccount);
    });

    it('should handle unsuccessful response with validation errors', async () => {
      const userId = 123;
      const mockResponse: apiResponse = {
        success: false,
        data: null,
        validationErrors: [
          { errDesc: 'User not found' },
          { errDesc: 'Invalid user ID' }
        ]
      };

      const promise = service.loadUserAccountById(userId);

      const req = httpMock.expectOne(`${environment.apiBaseUrl}user/getusr?usunbr=${userId}`);
      req.flush(mockResponse);

      try {
        await promise;
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain('Validation errors:');
        expect((error as Error).message).toContain('User not found');
        expect((error as Error).message).toContain('Invalid user ID');
      }
    });

    it('should handle unsuccessful response without validation errors', async () => {
      const userId = 123;
      const mockResponse: apiResponse = {
        success: false,
        data: null
      };

      const promise = service.loadUserAccountById(userId);

      const req = httpMock.expectOne(`${environment.apiBaseUrl}user/getusr?usunbr=${userId}`);
      req.flush(mockResponse);

      try {
        await promise;
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Registration failed without specific validation errors.');
      }
    });

    it('should handle HTTP errors', async () => {
      const userId = 123;
      const promise = service.loadUserAccountById(userId);

      const req = httpMock.expectOne(`${environment.apiBaseUrl}user/getusr?usunbr=${userId}`);
      req.error(new ProgressEvent('Network Error'), {
        status: 404,
        statusText: 'Not Found'
      });

      try {
        await promise;
        fail('Expected HTTP error to be thrown');
      } catch (error) {
        expect(error).toBeTruthy();
      }
    });

    it('should handle zero user ID', async () => {
      const userId = 0;
      const mockResponse: apiResponse = {
        success: true,
        data: null
      };

      const promise = service.loadUserAccountById(userId);

      const req = httpMock.expectOne(`${environment.apiBaseUrl}user/getusr?usunbr=${userId}`);
      req.flush(mockResponse);

      const result = await promise;
      expect(result).toBeNull();
    });

    it('should handle negative user ID', async () => {
      const userId = -1;
      const mockResponse: apiResponse = {
        success: true,
        data: null
      };

      const promise = service.loadUserAccountById(userId);

      const req = httpMock.expectOne(`${environment.apiBaseUrl}user/getusr?usunbr=${userId}`);
      req.flush(mockResponse);

      const result = await promise;
      expect(result).toBeNull();
    });
  });

  describe('saveUserAccount Method', () => {
    it('should save user account successfully', async () => {
      const userAccount: Partial<UserAccount> = {
        usemail: 'new@example.com',
        usfname: 'New',
        uslname: 'User'
      };
      const usunbr = 456;

      const expectedResponse: UserAccount = createMockUserAccount({
        usunbr: usunbr,
        usemail: 'new@example.com',
        usfname: 'New',
        uslname: 'User',
        usstat: 'A'
      });

      const promise = service.saveUserAccount(userAccount, usunbr);

      const req = httpMock.expectOne(`${environment.apiBaseUrl}user/updusr`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ ...userAccount, usunbr });
      req.flush(expectedResponse);

      const result = await promise;
      expect(result).toEqual(expectedResponse);
    });

    it('should save user account without usunbr parameter', async () => {
      const userAccount: Partial<UserAccount> = {
        usemail: 'new@example.com',
        usfname: 'New',
        uslname: 'User'
      };

      const expectedResponse: UserAccount = createMockUserAccount({
        usunbr: 789,
        usemail: 'new@example.com',
        usfname: 'New',
        uslname: 'User',
        usstat: 'A'
      });

      const promise = service.saveUserAccount(userAccount);

      const req = httpMock.expectOne(`${environment.apiBaseUrl}user/updusr`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ ...userAccount, usunbr: undefined });
      req.flush(expectedResponse);

      const result = await promise;
      expect(result).toEqual(expectedResponse);
    });

    it('should handle partial user account data', async () => {
      const partialUserAccount: Partial<UserAccount> = {
        usemail: 'updated@example.com'
      };
      const usunbr = 123;

      const expectedResponse: UserAccount = createMockUserAccount({
        usunbr: usunbr,
        usemail: 'updated@example.com',
        usfname: 'Existing',
        uslname: 'User',
        usstat: 'A'
      });

      const promise = service.saveUserAccount(partialUserAccount, usunbr);

      const req = httpMock.expectOne(`${environment.apiBaseUrl}user/updusr`);
      expect(req.request.body).toEqual({ ...partialUserAccount, usunbr });
      req.flush(expectedResponse);

      const result = await promise;
      expect(result).toEqual(expectedResponse);
    });

    it('should handle HTTP errors during save', async () => {
      const userAccount: Partial<UserAccount> = {
        username: 'testuser'
      };

      const promise = service.saveUserAccount(userAccount);

      const req = httpMock.expectOne(`${environment.apiBaseUrl}user/updusr`);
      req.error(new ProgressEvent('Validation Error'), {
        status: 400,
        statusText: 'Bad Request'
      });

      try {
        await promise;
        fail('Expected HTTP error to be thrown');
      } catch (error) {
        expect(error).toBeTruthy();
      }
    });

    it('should handle empty user account object', async () => {
      const emptyUserAccount: Partial<UserAccount> = {};
      const usunbr = 999;

      const expectedResponse: UserAccount = createMockUserAccount({
        usunbr: usunbr,
        usemail: 'default@example.com',
        usfname: 'Default',
        uslname: 'User',
        usstat: 'I'
      });

      const promise = service.saveUserAccount(emptyUserAccount, usunbr);

      const req = httpMock.expectOne(`${environment.apiBaseUrl}user/updusr`);
      expect(req.request.body).toEqual({ usunbr });
      req.flush(expectedResponse);

      const result = await promise;
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('deleteUserAccount Method', () => {
    it('should delete user account successfully', async () => {
      const userAccountId = 123;
      const mockResponse: apiResponse = {
        success: true,
        data: { deleted: true }
      };

      const promise = service.deleteUserAccount(userAccountId);

      const req = httpMock.expectOne(`${environment.apiBaseUrl}user/dltusr?usunbr=${userAccountId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);

      const result = await promise;
      expect(result).toEqual(mockResponse);
    });

    it('should handle delete errors', async () => {
      const userAccountId = 123;

      const promise = service.deleteUserAccount(userAccountId);

      const req = httpMock.expectOne(`${environment.apiBaseUrl}user/dltusr?usunbr=${userAccountId}`);
      req.error(new ProgressEvent('Not Found'), {
        status: 404,
        statusText: 'Not Found'
      });

      try {
        await promise;
        fail('Expected HTTP error to be thrown');
      } catch (error) {
        expect(error).toBeTruthy();
      }
    });

    it('should handle unsuccessful delete response', async () => {
      const userAccountId = 123;
      const mockResponse: apiResponse = {
        success: false,
        data: null,
        validationErrors: [
          { errDesc: 'Cannot delete active user' }
        ]
      };

      const promise = service.deleteUserAccount(userAccountId);

      const req = httpMock.expectOne(`${environment.apiBaseUrl}user/dltusr?usunbr=${userAccountId}`);
      req.flush(mockResponse);

      const result = await promise;
      expect(result).toEqual(mockResponse);
    });

    it('should handle zero user ID for deletion', async () => {
      const userAccountId = 0;
      const mockResponse: apiResponse = {
        success: false,
        data: null,
        validationErrors: [
          { errDesc: 'Invalid user ID' }
        ]
      };

      const promise = service.deleteUserAccount(userAccountId);

      const req = httpMock.expectOne(`${environment.apiBaseUrl}user/dltusr?usunbr=${userAccountId}`);
      req.flush(mockResponse);

      const result = await promise;
      expect(result).toEqual(mockResponse);
    });
  });

  describe('approveUserAccount Method', () => {
    it('should approve user account successfully', async () => {
      const usunbr = 123;
      const mockResponse: apiResponse = {
        success: true,
        data: { approved: true, usunbr }
      };

      const promise = service.approveUserAccount(usunbr);

      const req = httpMock.expectOne(`${environment.apiBaseUrl}user/apvusr`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ usunbr });
      req.flush(mockResponse);

      const result = await promise;
      expect(result).toEqual(mockResponse);
    });

    it('should handle approval errors', async () => {
      const usunbr = 123;

      const promise = service.approveUserAccount(usunbr);

      const req = httpMock.expectOne(`${environment.apiBaseUrl}user/apvusr`);
      req.error(new ProgressEvent('Forbidden'), {
        status: 403,
        statusText: 'Forbidden'
      });

      try {
        await promise;
        fail('Expected HTTP error to be thrown');
      } catch (error) {
        expect(error).toBeTruthy();
      }
    });

    it('should handle unsuccessful approval response', async () => {
      const usunbr = 123;
      const mockResponse: apiResponse = {
        success: false,
        data: null,
        validationErrors: [
          { errDesc: 'User already approved' }
        ]
      };

      const promise = service.approveUserAccount(usunbr);

      const req = httpMock.expectOne(`${environment.apiBaseUrl}user/apvusr`);
      req.flush(mockResponse);

      const result = await promise;
      expect(result).toEqual(mockResponse);
    });

    it('should handle negative user ID for approval', async () => {
      const usunbr = -1;
      const mockResponse: apiResponse = {
        success: false,
        data: null,
        validationErrors: [
          { errDesc: 'Invalid user ID' }
        ]
      };

      const promise = service.approveUserAccount(usunbr);

      const req = httpMock.expectOne(`${environment.apiBaseUrl}user/apvusr`);
      expect(req.request.body).toEqual({ usunbr });
      req.flush(mockResponse);

      const result = await promise;
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Signal State Management', () => {
    it('should maintain signal state across operations', async () => {
      const mockUserAccounts: UserAccount[] = [
        createMockUserAccount({
          usunbr: 1,
          usemail: 'user1@example.com',
          usfname: 'John',
          uslname: 'Doe',
          usstat: 'A'
        })
      ];

      const mockResponse: apiResponse = {
        success: true,
        data: mockUserAccounts
      };

      // Initially empty
      expect(service.userAccounts()).toEqual([]);

      // Load data
      const promise = service.loadAllUserAccounts();
      const req = httpMock.expectOne(`${environment.apiBaseUrl}user/getusrs`);
      req.flush(mockResponse);

      const result = await promise;
      // Signal should be updated
      expect(service.userAccounts()).toEqual(mockUserAccounts);
      expect(result).toEqual(mockUserAccounts);

      // Signal should be readonly
      expect(() => {
        (service.userAccounts as any).set([]);
      }).toThrow();
    });

    it('should handle signal updates with empty arrays', async () => {
      const mockResponse: apiResponse = {
        success: true,
        data: []
      };

      service.loadAllUserAccounts();
      const req = httpMock.expectOne(`${environment.apiBaseUrl}user/getusrs`);
      req.flush(mockResponse);

      expect(service.userAccounts()).toEqual([]);
    });

    it('should handle signal updates with null data', async () => {
      const mockResponse: apiResponse = {
        success: true,
        data: null
      };

      const promise = service.loadAllUserAccounts();
      const req = httpMock.expectOne(`${environment.apiBaseUrl}user/getusrs`);
      req.flush(mockResponse);

      const result = await promise;
      expect(result).toBeNull();
      expect(service.userAccounts()).toBeNull();
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete user account workflow', async () => {
      // Load all users
      const mockUserAccounts: UserAccount[] = [
        createMockUserAccount({
          usunbr: 1,
          usemail: 'user1@example.com',
          usfname: 'John',
          uslname: 'Doe',
          usstat: 'I'
        })
      ];

      const loadAllPromise = service.loadAllUserAccounts();
      let req = httpMock.expectOne(`${environment.apiBaseUrl}user/getusrs`);
      req.flush({ success: true, data: mockUserAccounts });

      await loadAllPromise;
      expect(service.userAccounts()).toEqual(mockUserAccounts);

      // Load specific user
      const specificUser: UserAccount = createMockUserAccount({
        usunbr: 1,
        usemail: 'user1@example.com',
        usfname: 'John',
        uslname: 'Doe',
        usstat: 'I'
      });

      const loadUserPromise = service.loadUserAccountById(1);
      req = httpMock.expectOne(`${environment.apiBaseUrl}user/getusr?usunbr=1`);
      req.flush({ success: true, data: specificUser });

      const loadedUser = await loadUserPromise;
      expect(loadedUser).toEqual(specificUser);

      // Update user
      const updatedUser: UserAccount = { ...specificUser, usemail: 'updated@example.com' };
      const savePromise = service.saveUserAccount({ usemail: 'updated@example.com' }, 1);
      req = httpMock.expectOne(`${environment.apiBaseUrl}user/updusr`);
      req.flush(updatedUser);

      const savedUser = await savePromise;
      expect(savedUser.usemail).toBe('updated@example.com');

      // Approve user
      const approvePromise = service.approveUserAccount(1);
      req = httpMock.expectOne(`${environment.apiBaseUrl}user/apvusr`);
      req.flush({ success: true, data: { approved: true } });

      const approveResult = await approvePromise;
      expect(approveResult.success).toBe(true);
    });

    it('should handle multiple concurrent requests', async () => {
      const userIds = [1, 2, 3];
      const promises = userIds.map(id => service.loadUserAccountById(id));

      const mockUser: UserAccount = createMockUserAccount({
        usunbr: 1,
        usemail: 'user@example.com',
        usfname: 'User',
        uslname: 'Test',
        usstat: 'A'
      });

      userIds.forEach(id => {
        const req = httpMock.expectOne(`${environment.apiBaseUrl}user/getusr?usunbr=${id}`);
        req.flush({ success: true, data: { ...mockUser, usunbr: id } });
      });

      const results = await Promise.all(promises);
      expect(results.length).toBe(3);
      results.forEach((result, index) => {
        expect(result.usunbr).toBe(userIds[index]);
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle malformed response data', async () => {
      const malformedResponse = {
        // Missing success property
        data: 'invalid data structure'
      };

      const promise = service.loadAllUserAccounts();
      const req = httpMock.expectOne(`${environment.apiBaseUrl}user/getusrs`);
      req.flush(malformedResponse);

      const result = await promise;
      expect(result).toEqual('invalid data structure' as any);
    });

    it('should handle network timeouts', async () => {
      const promise = service.loadAllUserAccounts();
      const req = httpMock.expectOne(`${environment.apiBaseUrl}user/getusrs`);
      req.error(new ProgressEvent('Timeout'), {
        status: 0,
        statusText: 'Unknown Error'
      });

      try {
        await promise;
        fail('Expected timeout error to be thrown');
      } catch (error) {
        expect(error).toBeTruthy();
      }
    });

    it('should handle very large user account objects', async () => {
      const largeUserAccount: Partial<UserAccount> = {
        username: 'a'.repeat(10000),
        email: 'b'.repeat(10000) + '@example.com',
        firstName: 'c'.repeat(10000),
        lastName: 'd'.repeat(10000)
      };

      const expectedResponse: UserAccount = {
        usunbr: 1,
        ...largeUserAccount,
        active: true
      } as UserAccount;

      const promise = service.saveUserAccount(largeUserAccount, 1);
      const req = httpMock.expectOne(`${environment.apiBaseUrl}user/updusr`);
      req.flush(expectedResponse);

      const result = await promise;
      expect(result).toEqual(expectedResponse);
    });

    it('should handle special characters in user data', async () => {
      const specialCharUser: Partial<UserAccount> = {
        username: 'user@#$%^&*()',
        email: 'test+special@example.com',
        firstName: 'François',
        lastName: 'José'
      };

      const expectedResponse: UserAccount = {
        usunbr: 1,
        ...specialCharUser,
        active: true
      } as UserAccount;

      const promise = service.saveUserAccount(specialCharUser, 1);
      const req = httpMock.expectOne(`${environment.apiBaseUrl}user/updusr`);
      req.flush(expectedResponse);

      const result = await promise;
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('Performance Tests', () => {
    it('should handle large user lists efficiently', async () => {
      const largeUserList: UserAccount[] = [];
      for (let i = 0; i < 1000; i++) {
        largeUserList.push(createMockUserAccount({
          usunbr: i,
          usemail: `user${i}@example.com`,
          usfname: `First${i}`,
          uslname: `Last${i}`,
          usstat: i % 2 === 0 ? 'A' : 'I'
        }));
      }

      const mockResponse: apiResponse = {
        success: true,
        data: largeUserList
      };

      const startTime = performance.now();
      
      const promise = service.loadAllUserAccounts();
      const req = httpMock.expectOne(`${environment.apiBaseUrl}user/getusrs`);
      req.flush(mockResponse);
      
      await promise;
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(service.userAccounts().length).toBe(1000);
      expect(duration).toBeLessThan(100); // Should handle large lists quickly
    });

    it('should handle multiple rapid operations efficiently', async () => {
      const startTime = performance.now();
      
      // Start multiple operations
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(service.loadUserAccountById(i));
      }

      // Fulfill all requests
      for (let i = 0; i < 10; i++) {
        const req = httpMock.expectOne(`${environment.apiBaseUrl}user/getusr?usunbr=${i}`);
        req.flush({ 
          success: true, 
          data: { 
            usunbr: i, 
            username: `user${i}`,
            email: `user${i}@example.com`,
            firstName: 'Test',
            lastName: 'User',
            active: true
          } 
        });
      }

      await Promise.all(promises);
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(100); // Should handle multiple operations quickly
    });
  });
});
