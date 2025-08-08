import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpContext } from '@angular/common/http';
import { Validators } from '@angular/forms';
import { PasswordService } from './password.service';
import { SetPassword } from '../models/password.model';
import { apiResponse } from '../models/response.model';
import { SKIP_REFRESH_KEY } from '../shared/http-context-keys';
import { ApiResponseError } from '../shared/api-response-error';
import { environment } from '../../environments/environment';

describe('PasswordService', () => {
  let service: PasswordService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PasswordService]
    });
    service = TestBed.inject(PasswordService);
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
  });

  describe('setPassword Method - Success Cases', () => {
    it('should set password successfully', async () => {
      const setPasswordRequest: Partial<SetPassword> = {
        password: {
          Validators: [Validators.required],
          ErrorMessages: { required: 'Password is required' },
          value: 'newPassword123'
        },
        confirmPassword: {
          Validators: [Validators.required],
          ErrorMessages: { required: 'Confirm password is required' },
          value: 'newPassword123'
        }
      };

      const mockResponse: apiResponse = {
        success: true,
        data: {
          password: {
            Validators: [Validators.required],
            ErrorMessages: { required: 'Password is required' },
            value: 'newPassword123'
          },
          confirmPassword: {
            Validators: [Validators.required],
            ErrorMessages: { required: 'Confirm password is required' },
            value: 'newPassword123'
          }
        } as SetPassword
      };

      const promise = service.setPassword(setPasswordRequest);

      const req = httpMock.expectOne(`${environment.apiBaseUrl}setpassword`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(setPasswordRequest);
      
      // Verify SKIP_REFRESH_KEY context is set
      expect(req.request.context.get(SKIP_REFRESH_KEY)).toBe(true);

      req.flush(mockResponse);

      const result = await promise;
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle partial SetPassword object', async () => {
      const partialRequest: Partial<SetPassword> = {
        password: {
          Validators: [Validators.required],
          ErrorMessages: { required: 'Password is required' },
          value: 'newPassword'
        }
      };

      const mockResponse: apiResponse = {
        success: true,
        data: partialRequest
      };

      const promise = service.setPassword(partialRequest);

      const req = httpMock.expectOne(`${environment.apiBaseUrl}setpassword`);
      req.flush(mockResponse);

      const result = await promise;
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle empty SetPassword object', async () => {
      const emptyRequest: Partial<SetPassword> = {};

      const mockResponse: apiResponse = {
        success: true,
        data: {}
      };

      const promise = service.setPassword(emptyRequest);

      const req = httpMock.expectOne(`${environment.apiBaseUrl}setpassword`);
      expect(req.request.body).toEqual(emptyRequest);
      req.flush(mockResponse);

      const result = await promise;
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('setPassword Method - Error Cases', () => {
    it('should throw ApiResponseError for validation errors', async () => {
      const setPasswordRequest: Partial<SetPassword> = {
        password: {
          Validators: [Validators.required],
          ErrorMessages: { required: 'Password is required' },
          value: 'weak'
        },
        confirmPassword: {
          Validators: [Validators.required],
          ErrorMessages: { required: 'Confirm password is required' },
          value: 'different'
        }
      };

      const mockErrorResponse: apiResponse = {
        success: false,
        data: null,
        validationErrors: [
          { errDesc: 'Password too weak' },
          { errDesc: 'Passwords do not match' }
        ]
      };

      const promise = service.setPassword(setPasswordRequest);

      const req = httpMock.expectOne(`${environment.apiBaseUrl}setpassword`);
      req.flush(mockErrorResponse);

      try {
        await promise;
        fail('Expected ApiResponseError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiResponseError);
        expect((error as ApiResponseError).message).toBe('Validation errors');
        expect((error as ApiResponseError).validationErrors).toEqual(mockErrorResponse.validationErrors!);
      }
    });

    it('should throw generic Error for non-validation failures', async () => {
      const setPasswordRequest: Partial<SetPassword> = {
        password: {
          Validators: [Validators.required],
          ErrorMessages: { required: 'Password is required' },
          value: 'newPassword123'
        }
      };

      const mockErrorResponse: apiResponse = {
        success: false,
        data: null
      };

      const promise = service.setPassword(setPasswordRequest);

      const req = httpMock.expectOne(`${environment.apiBaseUrl}setpassword`);
      req.flush(mockErrorResponse);

      try {
        await promise;
        fail('Expected Error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Password setting failed without specific validation errors.');
      }
    });

    it('should throw generic Error when validationErrors is empty', async () => {
      const setPasswordRequest: Partial<SetPassword> = {
        password: {
          Validators: [Validators.required],
          ErrorMessages: { required: 'Password is required' },
          value: 'newPassword123'
        }
      };

      const mockErrorResponse: apiResponse = {
        success: false,
        data: null,
        validationErrors: []
      };

      const promise = service.setPassword(setPasswordRequest);

      const req = httpMock.expectOne(`${environment.apiBaseUrl}setpassword`);
      req.flush(mockErrorResponse);

      try {
        await promise;
        fail('Expected Error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Password setting failed without specific validation errors.');
      }
    });

    it('should handle HTTP error responses', async () => {
      const setPasswordRequest: Partial<SetPassword> = {
        password: {
          Validators: [Validators.required],
          ErrorMessages: { required: 'Password is required' },
          value: 'newPassword123'
        }
      };

      const promise = service.setPassword(setPasswordRequest);

      const req = httpMock.expectOne(`${environment.apiBaseUrl}setpassword`);
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

    it('should handle network timeout errors', async () => {
      const setPasswordRequest: Partial<SetPassword> = {
        password: {
          Validators: [Validators.required],
          ErrorMessages: { required: 'Password is required' },
          value: 'newPassword123'
        }
      };

      const promise = service.setPassword(setPasswordRequest);

      const req = httpMock.expectOne(`${environment.apiBaseUrl}setpassword`);
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
  });

  describe('HTTP Request Configuration', () => {
    it('should use correct HTTP method and URL', async () => {
      const setPasswordRequest: Partial<SetPassword> = {
        password: {
          Validators: [Validators.required],
          ErrorMessages: { required: 'Password is required' },
          value: 'test123'
        }
      };

      const mockResponse: apiResponse = {
        success: true,
        data: setPasswordRequest
      };

      service.setPassword(setPasswordRequest);

      const req = httpMock.expectOne(`${environment.apiBaseUrl}setpassword`);
      expect(req.request.method).toBe('POST');
      expect(req.request.url).toBe(`${environment.apiBaseUrl}setpassword`);
      
      req.flush(mockResponse);
    });

    it('should include SKIP_REFRESH_KEY in request context', async () => {
      const setPasswordRequest: Partial<SetPassword> = {
        password: {
          Validators: [Validators.required],
          ErrorMessages: { required: 'Password is required' },
          value: 'test123'
        }
      };

      const mockResponse: apiResponse = {
        success: true,
        data: setPasswordRequest
      };

      service.setPassword(setPasswordRequest);

      const req = httpMock.expectOne(`${environment.apiBaseUrl}setpassword`);
      expect(req.request.context).toBeInstanceOf(HttpContext);
      expect(req.request.context.get(SKIP_REFRESH_KEY)).toBe(true);
      
      req.flush(mockResponse);
    });

    it('should send request body as JSON', async () => {
      const setPasswordRequest: Partial<SetPassword> = {
        password: {
          Validators: [Validators.required],
          ErrorMessages: { required: 'Password is required' },
          value: 'test123'
        },
        confirmPassword: {
          Validators: [Validators.required],
          ErrorMessages: { required: 'Confirm password is required' },
          value: 'test123'
        }
      };

      const mockResponse: apiResponse = {
        success: true,
        data: setPasswordRequest
      };

      service.setPassword(setPasswordRequest);

      const req = httpMock.expectOne(`${environment.apiBaseUrl}setpassword`);
      expect(req.request.body).toEqual(setPasswordRequest);
      // Angular automatically sets the content-type for JSON requests, but it might not always be accessible in tests
      expect(req.request.method).toBe('POST');
      
      req.flush(mockResponse);
    });
  });

  describe('Response Data Handling', () => {
    it('should return data property from successful response', async () => {
      const expectedData: SetPassword = {
        password: {
          Validators: [Validators.required],
          ErrorMessages: { required: 'Password is required' },
          value: 'newPassword123'
        },
        confirmPassword: {
          Validators: [Validators.required],
          ErrorMessages: { required: 'Confirm password is required' },
          value: 'newPassword123'
        }
      };

      const mockResponse: apiResponse = {
        success: true,
        data: expectedData
      };

      const setPasswordRequest: Partial<SetPassword> = {
        password: {
          Validators: [Validators.required],
          ErrorMessages: { required: 'Password is required' },
          value: 'newPassword123'
        }
      };

      const promise = service.setPassword(setPasswordRequest);

      const req = httpMock.expectOne(`${environment.apiBaseUrl}setpassword`);
      req.flush(mockResponse);

      const result = await promise;
      expect(result).toEqual(expectedData);
      expect(result).toBe(mockResponse.data);
    });

    it('should handle null data in successful response', async () => {
      const mockResponse: apiResponse = {
        success: true,
        data: null
      };

      const setPasswordRequest: Partial<SetPassword> = {
        password: {
          Validators: [Validators.required],
          ErrorMessages: { required: 'Password is required' },
          value: 'test123'
        }
      };

      const promise = service.setPassword(setPasswordRequest);

      const req = httpMock.expectOne(`${environment.apiBaseUrl}setpassword`);
      req.flush(mockResponse);

      const result = await promise;
      expect(result).toBeNull();
    });
  });

  describe('Edge Cases and Validation', () => {
    it('should handle undefined validationErrors in error response', async () => {
      const setPasswordRequest: Partial<SetPassword> = {
        password: {
          Validators: [Validators.required],
          ErrorMessages: { required: 'Password is required' },
          value: 'test123'
        }
      };

      const mockErrorResponse: apiResponse = {
        success: false,
        data: null,
        validationErrors: undefined
      };

      const promise = service.setPassword(setPasswordRequest);

      const req = httpMock.expectOne(`${environment.apiBaseUrl}setpassword`);
      req.flush(mockErrorResponse);

      try {
        await promise;
        fail('Expected Error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Password setting failed without specific validation errors.');
      }
    });

    it('should handle null request gracefully', async () => {
      const mockResponse: apiResponse = {
        success: true,
        data: null
      };

      const promise = service.setPassword(null as any);

      const req = httpMock.expectOne(`${environment.apiBaseUrl}setpassword`);
      expect(req.request.body).toBeNull();
      req.flush(mockResponse);

      const result = await promise;
      expect(result).toBeNull();
    });

    it('should handle undefined request gracefully', async () => {
      const mockResponse: apiResponse = {
        success: true,
        data: undefined
      };

      const promise = service.setPassword(undefined as any);

      const req = httpMock.expectOne(`${environment.apiBaseUrl}setpassword`);
      expect(req.request.body).toBeNull(); // HttpClient converts undefined to null
      req.flush(mockResponse);

      const result = await promise;
      expect(result).toBeUndefined();
    });
  });

  describe('Integration and Performance', () => {
    it('should handle multiple concurrent requests', async () => {
      const requests = [
        { 
          password: {
            Validators: [Validators.required],
            ErrorMessages: { required: 'Password is required' },
            value: 'password1'
          }
        },
        { 
          password: {
            Validators: [Validators.required],
            ErrorMessages: { required: 'Password is required' },
            value: 'password2'
          }
        },
        { 
          password: {
            Validators: [Validators.required],
            ErrorMessages: { required: 'Password is required' },
            value: 'password3'
          }
        }
      ];

      const mockResponse: apiResponse = {
        success: true,
        data: {}
      };

      // Start all requests
      const promises = requests.map(req => service.setPassword(req));

      // Fulfill all requests - match all the HTTP requests that were made
      const reqs = httpMock.match(`${environment.apiBaseUrl}setpassword`);
      expect(reqs.length).toBe(3);
      
      reqs.forEach(req => req.flush(mockResponse));

      // Wait for all to complete
      const results = await Promise.all(promises);
      
      expect(results.length).toBe(3);
      results.forEach(result => {
        expect(result).toEqual(mockResponse.data);
      });
    });

    it('should complete request within reasonable time', async () => {
      const setPasswordRequest: Partial<SetPassword> = {
        password: {
          Validators: [Validators.required],
          ErrorMessages: { required: 'Password is required' },
          value: 'test123'
        }
      };

      const mockResponse: apiResponse = {
        success: true,
        data: setPasswordRequest
      };

      const startTime = performance.now();
      const promise = service.setPassword(setPasswordRequest);

      const req = httpMock.expectOne(`${environment.apiBaseUrl}setpassword`);
      req.flush(mockResponse);

      await promise;
      const endTime = performance.now();

      // Should complete quickly (mock response should be immediate)
      expect(endTime - startTime).toBeLessThan(100);
    });
  });
});