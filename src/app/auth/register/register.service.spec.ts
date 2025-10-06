import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpContext } from '@angular/common/http';

import { RegisterService } from './register.service';
import { Register } from './register.model';
import { apiResponse } from '../../models/response.model';
import { environment } from '../../../environments/environment';
import { SKIP_AUTH_KEY, SKIP_REFRESH_KEY } from '../../shared/http-context-keys';
import { ApiResponseError } from '../../shared/api-response-error';

describe('RegisterService', () => {
  let service: RegisterService;
  let httpTestingController: HttpTestingController;

  const mockRegisterData: Partial<Register> = {
    usemail: {
      Validators: [],
      ErrorMessages: {},
      value: 'test@example.com'
    },
    usfname: {
      Validators: [],
      ErrorMessages: {},
      value: 'John'
    },
    uslname: {
      Validators: [],
      ErrorMessages: {},
      value: 'Doe'
    },
    wacctname: {
      Validators: [],
      ErrorMessages: {},
      value: 'Test Account'
    },
    wregtype: {
      Validators: [],
      ErrorMessages: {},
      value: 'Retailer'
    },
    wphone: {
      Validators: [],
      ErrorMessages: {},
      value: '(555) 123-4567'
    }
  };

  const mockSuccessResponse: apiResponse = {
    success: true,
    data: {
      id: 1,
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe'
    }
  };

  const mockErrorResponse: apiResponse = {
    success: false,
    validationErrors: [
      { errDesc: 'Email already exists' },
      { errDesc: 'Invalid phone format' }
    ]
  };

  const mockGenericErrorResponse: apiResponse = {
    success: false
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RegisterService]
    });
    
    service = TestBed.inject(RegisterService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  // 1. Service Initialization Tests
  describe('Service Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should have environment injected', () => {
      expect(service.env).toBe(environment);
    });

    it('should have http client injected', () => {
      expect(service.http).toBeTruthy();
    });
  });

  // 2. Successful Registration Tests
  describe('Successful Registration', () => {
    it('should register account successfully', async () => {
      const promise = service.registerAccount(mockRegisterData);

      const req = httpTestingController.expectOne(`${environment.apiBaseUrl}register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockRegisterData);
      
      // Check that the correct context is set
      expect(req.request.context).toBeInstanceOf(HttpContext);
      expect(req.request.context.get(SKIP_REFRESH_KEY)).toBe(true);
      expect(req.request.context.get(SKIP_AUTH_KEY)).toBe(true);

      req.flush(mockSuccessResponse);

      const result = await promise;
      expect(result).toEqual(mockSuccessResponse.data);
    });

    it('should use correct API endpoint', async () => {
      const promise = service.registerAccount(mockRegisterData);

      const req = httpTestingController.expectOne(`${environment.apiBaseUrl}register`);
      expect(req.request.url).toBe(`${environment.apiBaseUrl}register`);
      
      req.flush(mockSuccessResponse);
      await promise;
    });

    it('should send POST request with register data', async () => {
      const promise = service.registerAccount(mockRegisterData);

      const req = httpTestingController.expectOne(`${environment.apiBaseUrl}register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockRegisterData);
      
      req.flush(mockSuccessResponse);
      await promise;
    });

    it('should set correct HTTP context', async () => {
      const promise = service.registerAccount(mockRegisterData);

      const req = httpTestingController.expectOne(`${environment.apiBaseUrl}register`);
      expect(req.request.context.get(SKIP_REFRESH_KEY)).toBe(true);
      expect(req.request.context.get(SKIP_AUTH_KEY)).toBe(true);
      
      req.flush(mockSuccessResponse);
      await promise;
    });
  });

  // 3. Error Handling Tests
  describe('Error Handling', () => {
    it('should throw ApiResponseError when validation errors exist', async () => {
      const promise = service.registerAccount(mockRegisterData);

      const req = httpTestingController.expectOne(`${environment.apiBaseUrl}register`);
      req.flush(mockErrorResponse);

      try {
        await promise;
        fail('Should have thrown ApiResponseError');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiResponseError);
        expect((error as ApiResponseError).message).toBe('Validation errors');
        expect((error as ApiResponseError).validationErrors).toEqual(mockErrorResponse.validationErrors || []);
      }
    });

    it('should throw generic error when no validation errors', async () => {
      const promise = service.registerAccount(mockRegisterData);

      const req = httpTestingController.expectOne(`${environment.apiBaseUrl}register`);
      req.flush(mockGenericErrorResponse);

      try {
        await promise;
        fail('Should have thrown generic Error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Registration failed without specific validation errors.');
      }
    });

    it('should handle HTTP errors gracefully', async () => {
      const promise = service.registerAccount(mockRegisterData);

      const req = httpTestingController.expectOne(`${environment.apiBaseUrl}register`);
      req.error(new ErrorEvent('Network error'), { status: 500, statusText: 'Internal Server Error' });

      try {
        await promise;
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeTruthy();
      }
    });

    it('should handle malformed response gracefully', async () => {
      const promise = service.registerAccount(mockRegisterData);

      const req = httpTestingController.expectOne(`${environment.apiBaseUrl}register`);
      req.flush(null);

      try {
        await promise;
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeTruthy();
      }
    });

    it('should throw ApiResponseError when server returns email in use error', async () => {
      const emailInUseResponse: apiResponse = {
        success: false,
        validationErrors: [
          { field: 'usemail', errDesc: 'Email address is already in use' }
        ]
      };

      const promise = service.registerAccount(mockRegisterData);

      const req = httpTestingController.expectOne(`${environment.apiBaseUrl}register`);
      req.flush(emailInUseResponse);

      try {
        await promise;
        fail('Should have thrown ApiResponseError');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiResponseError);
        expect((error as ApiResponseError).message).toBe('Validation errors');
        expect((error as ApiResponseError).validationErrors).toEqual([
          { field: 'usemail', errDesc: 'Email address is already in use' }
        ]);
      }
    });
  });

  // 4. Input Validation Tests
  describe('Input Validation', () => {
    it('should handle empty register data', async () => {
      const promise = service.registerAccount({});

      const req = httpTestingController.expectOne(`${environment.apiBaseUrl}register`);
      expect(req.request.body).toEqual({});
      
      req.flush(mockSuccessResponse);
      await promise;
    });

    it('should handle partial register data', async () => {
      const partialData = {
        usemail: mockRegisterData.usemail,
        usfname: mockRegisterData.usfname
      };

      const promise = service.registerAccount(partialData);

      const req = httpTestingController.expectOne(`${environment.apiBaseUrl}register`);
      expect(req.request.body).toEqual(partialData);
      
      req.flush(mockSuccessResponse);
      await promise;
    });

    it('should handle null values in register data', async () => {
      const dataWithNulls = {
        ...mockRegisterData,
        wphone: null as any
      };

      const promise = service.registerAccount(dataWithNulls);

      const req = httpTestingController.expectOne(`${environment.apiBaseUrl}register`);
      expect(req.request.body).toEqual(dataWithNulls);
      
      req.flush(mockSuccessResponse);
      await promise;
    });
  });

  // 5. Response Processing Tests
  describe('Response Processing', () => {
    it('should return response data on success', async () => {
      const customResponseData = {
        id: 123,
        email: 'custom@example.com',
        status: 'pending'
      };

      const customResponse: apiResponse = {
        success: true,
        data: customResponseData
      };

      const promise = service.registerAccount(mockRegisterData);

      const req = httpTestingController.expectOne(`${environment.apiBaseUrl}register`);
      req.flush(customResponse);

      const result = await promise;
      expect(result).toEqual(jasmine.objectContaining(customResponseData));
    });

    it('should handle response with empty data', async () => {
      const emptyDataResponse: apiResponse = {
        success: true,
        data: null
      };

      const promise = service.registerAccount(mockRegisterData);

      const req = httpTestingController.expectOne(`${environment.apiBaseUrl}register`);
      req.flush(emptyDataResponse);

      const result = await promise;
      expect(result).toBeNull();
    });

    it('should handle response with undefined data', async () => {
      const undefinedDataResponse: apiResponse = {
        success: true
      };

      const promise = service.registerAccount(mockRegisterData);

      const req = httpTestingController.expectOne(`${environment.apiBaseUrl}register`);
      req.flush(undefinedDataResponse);

      const result = await promise;
      expect(result).toBeUndefined();
    });
  });

  // 6. Edge Cases Tests
  describe('Edge Cases', () => {
    it('should handle empty validation errors array', async () => {
      const emptyErrorsResponse: apiResponse = {
        success: false,
        validationErrors: []
      };

      const promise = service.registerAccount(mockRegisterData);

      const req = httpTestingController.expectOne(`${environment.apiBaseUrl}register`);
      req.flush(emptyErrorsResponse);

      try {
        await promise;
        fail('Should have thrown generic Error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Registration failed without specific validation errors.');
      }
    });

    it('should handle validation errors being undefined', async () => {
      const undefinedErrorsResponse: apiResponse = {
        success: false,
        validationErrors: undefined
      };

      const promise = service.registerAccount(mockRegisterData);

      const req = httpTestingController.expectOne(`${environment.apiBaseUrl}register`);
      req.flush(undefinedErrorsResponse);

      try {
        await promise;
        fail('Should have thrown generic Error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Registration failed without specific validation errors.');
      }
    });
  });

  // 7. Integration Tests
  describe('Integration Tests', () => {
    it('should complete full registration flow', async () => {
      const fullRegisterData: Partial<Register> = {
        usemail: {
          Validators: [],
          ErrorMessages: {},
          value: 'integration@example.com'
        },
        verifyEmail: {
          Validators: [],
          ErrorMessages: {},
          value: 'integration@example.com'
        },
        usfname: {
          Validators: [],
          ErrorMessages: {},
          value: 'Integration'
        },
        uslname: {
          Validators: [],
          ErrorMessages: {},
          value: 'Test'
        },
        wacctname: {
          Validators: [],
          ErrorMessages: {},
          value: 'Integration Test Account'
        },
        wregtype: {
          Validators: [],
          ErrorMessages: {},
          value: 'Supplier'
        },
        wphone: {
          Validators: [],
          ErrorMessages: {},
          value: '(555) 999-8888'
        },
        wcatmgr: {
          Validators: [],
          ErrorMessages: {},
          value: '1'
        },
        wrecaptchatoken: {
          Validators: [],
          ErrorMessages: {},
          value: 'mock-recaptcha-token'
        }
      };

      const integrationResponse: apiResponse = {
        success: true,
        data: {
          id: 999,
          email: 'integration@example.com',
          firstName: 'Integration',
          lastName: 'Test',
          accountName: 'Integration Test Account',
          registrationType: 'Supplier'
        }
      };

      const promise = service.registerAccount(fullRegisterData);

      const req = httpTestingController.expectOne(`${environment.apiBaseUrl}register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(fullRegisterData);
      expect(req.request.context.get(SKIP_REFRESH_KEY)).toBe(true);
      expect(req.request.context.get(SKIP_AUTH_KEY)).toBe(true);

      req.flush(integrationResponse);

      const result = await promise;
      expect(result).toEqual(integrationResponse.data);
    });
  });

  // 8. Performance Tests
  describe('Performance Tests', () => {
    it('should handle multiple concurrent requests', async () => {
      const promises = [];
      
      for (let i = 0; i < 3; i++) {
        promises.push(service.registerAccount({
          ...mockRegisterData,
          usemail: {
            ...mockRegisterData.usemail!,
            value: `test${i}@example.com`
          }
        }));
      }

      // Allow requests to be initiated
      await new Promise(resolve => setTimeout(resolve, 0));

      // Match all requests instead of expecting one at a time
      const requests = httpTestingController.match(`${environment.apiBaseUrl}register`);
      expect(requests).toHaveSize(3);

      // Respond to each request
      requests.forEach((req, index) => {
        expect(req.request.method).toBe('POST');
        req.flush({
          success: true,
          data: { id: index, email: `test${index}@example.com` }
        });
      });

      const results = await Promise.all(promises);
      expect(results).toHaveSize(3);
      results.forEach((result, index) => {
        expect(result).toEqual(jasmine.objectContaining({
          id: index,
          email: `test${index}@example.com`
        }));
      });
    });
  });
});
