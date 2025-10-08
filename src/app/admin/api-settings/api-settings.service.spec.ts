import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpContext } from '@angular/common/http';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { ApiSettingsService } from './api-settings.service';
import { apiResponse } from '../../models/response.model';
import { environment } from '../../../environments/environment';
import { SKIP_AUTH_KEY, SKIP_REFRESH_KEY } from '../../shared/http-context-keys';
import { ApiResponseError } from '../../shared/api-response-error';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('ApiSettingsService', () => {
  let service: ApiSettingsService;
  let httpTestingController: HttpTestingController;
  let mockDialog: jasmine.SpyObj<MatDialog>;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockApiSettingsData: Partial<any> = {
    id: '1',
    name: 'Test API Setting',
    value: 'test-value',
    description: 'Test description'
  };

  const mockApiSettingsResponse: any = {
    id: '1',
    name: 'Test API Setting',
    value: 'test-value',
    description: 'Test description',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  };

  const mockApiSettingsListResponse: any[] = [
    mockApiSettingsResponse,
    {
      id: '2',
      name: 'Test API Setting 2',
      value: 'test-value-2',
      description: 'Test description 2',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z'
    }
  ];

  const mockSuccessResponse: apiResponse = {
    success: true,
    data: mockApiSettingsResponse
  };

  const mockListSuccessResponse: apiResponse = {
    success: true,
    data: mockApiSettingsListResponse
  };

  const mockErrorResponse: apiResponse = {
    success: false,
    validationErrors: [
      { errDesc: 'API setting name already exists' },
      { errDesc: 'Invalid value format' }
    ]
  };

  const mockGenericErrorResponse: apiResponse = {
    success: false
  };

  beforeEach(() => {
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const mockMatDialog = {
      open: jasmine.createSpy('open').and.returnValue({
        afterClosed: () => of()
      })
    };
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        MatDialogModule,
        NoopAnimationsModule
      ],
      providers: [
        ApiSettingsService,
        { provide: MatDialog, useValue: dialogSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    service = TestBed.inject(ApiSettingsService);
    httpTestingController = TestBed.inject(HttpTestingController);
    mockDialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
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

    it('should have router injected', () => {
      expect(service.router).toBeTruthy();
    });

    it('should have dialog injected', () => {
      expect(service.dialog).toBeTruthy();
    });
  });

  // 2. Create API Settings Tests
  describe('createApiSettings', () => {
    it('should create API settings successfully', async () => {
      const promise = service.createApiSettings(mockApiSettingsData);

      const req = httpTestingController.expectOne(`${environment.apiBaseUrl}api-settings`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockApiSettingsData);

      // Check that the correct context is set
      expect(req.request.context).toBeInstanceOf(HttpContext);
      expect(req.request.context.get(SKIP_REFRESH_KEY)).toBe(true);
      expect(req.request.context.get(SKIP_AUTH_KEY)).toBe(true);

      req.flush(mockSuccessResponse);

      const result = await promise;
      expect(result).toEqual(mockSuccessResponse.data);
    });

    it('should use correct API endpoint for create', async () => {
      const promise = service.createApiSettings(mockApiSettingsData);

      const req = httpTestingController.expectOne(`${environment.apiBaseUrl}api-settings`);
      expect(req.request.url).toBe(`${environment.apiBaseUrl}api-settings`);

      req.flush(mockSuccessResponse);
      await promise;
    });

    it('should throw ApiResponseError when validation errors exist on create', async () => {
      const promise = service.createApiSettings(mockApiSettingsData);

      const req = httpTestingController.expectOne(`${environment.apiBaseUrl}api-settings`);
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

    it('should throw generic error when no validation errors on create', async () => {
      const promise = service.createApiSettings(mockApiSettingsData);

      const req = httpTestingController.expectOne(`${environment.apiBaseUrl}api-settings`);
      req.flush(mockGenericErrorResponse);

      try {
        await promise;
        fail('Should have thrown generic Error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('API settings creation failed without specific validation errors.');
      }
    });
  });

  // 3. Get API Settings by ID Tests
  describe('getApiSettings', () => {
    it('should get API settings by ID successfully', async () => {
      const testId = '1';
      const promise = service.getApiSettings(testId);

      const req = httpTestingController.expectOne(`${environment.apiBaseUrl}api-settings/${testId}`);
      expect(req.request.method).toBe('GET');

      // Check that the correct context is set (no SKIP_AUTH_KEY for get)
      expect(req.request.context).toBeInstanceOf(HttpContext);
      expect(req.request.context.get(SKIP_REFRESH_KEY)).toBe(true);
      expect(req.request.context.get(SKIP_AUTH_KEY)).toBe(false);

      req.flush(mockSuccessResponse);

      const result = await promise;
      expect(result).toEqual(mockSuccessResponse.data);
    });

    it('should use correct API endpoint for get by ID', async () => {
      const testId = '123';
      const promise = service.getApiSettings(testId);

      const req = httpTestingController.expectOne(`${environment.apiBaseUrl}api-settings/${testId}`);
      expect(req.request.url).toBe(`${environment.apiBaseUrl}api-settings/${testId}`);

      req.flush(mockSuccessResponse);
      await promise;
    });

    it('should throw ApiResponseError when validation errors exist on get', async () => {
      const promise = service.getApiSettings('1');

      const req = httpTestingController.expectOne(`${environment.apiBaseUrl}api-settings/1`);
      req.flush(mockErrorResponse);

      try {
        await promise;
        fail('Should have thrown ApiResponseError');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiResponseError);
        expect((error as ApiResponseError).message).toBe('Validation errors');
      }
    });

    it('should throw generic error when no validation errors on get', async () => {
      const promise = service.getApiSettings('1');

      const req = httpTestingController.expectOne(`${environment.apiBaseUrl}api-settings/1`);
      req.flush(mockGenericErrorResponse);

      try {
        await promise;
        fail('Should have thrown generic Error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('API settings retrieval failed without specific validation errors.');
      }
    });
  });

  // 4. Get All API Settings Tests
  describe('getAllApiSettings', () => {
    it('should get all API settings successfully', async () => {
      const promise = service.getAllApiSettings();

      const req = httpTestingController.expectOne(`${environment.apiBaseUrl}api-settings`);
      expect(req.request.method).toBe('GET');

      // Check that the correct context is set
      expect(req.request.context).toBeInstanceOf(HttpContext);
      expect(req.request.context.get(SKIP_REFRESH_KEY)).toBe(true);

      req.flush(mockListSuccessResponse);

      const result = await promise;
      expect(result).toEqual(mockListSuccessResponse.data);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should use correct API endpoint for get all', async () => {
      const promise = service.getAllApiSettings();

      const req = httpTestingController.expectOne(`${environment.apiBaseUrl}api-settings`);
      expect(req.request.url).toBe(`${environment.apiBaseUrl}api-settings`);

      req.flush(mockListSuccessResponse);
      await promise;
    });

    it('should throw ApiResponseError when validation errors exist on get all', async () => {
      const promise = service.getAllApiSettings();

      const req = httpTestingController.expectOne(`${environment.apiBaseUrl}api-settings`);
      req.flush(mockErrorResponse);

      try {
        await promise;
        fail('Should have thrown ApiResponseError');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiResponseError);
        expect((error as ApiResponseError).message).toBe('Validation errors');
      }
    });
  });

  // 5. Update API Settings Tests
  describe('updateApiSettings', () => {
    it('should update API settings successfully', async () => {
      const testId = '1';
      const updateData = { name: 'Updated API Setting' };
      const promise = service.updateApiSettings(testId, updateData);

      const req = httpTestingController.expectOne(`${environment.apiBaseUrl}api-settings/${testId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateData);

      // Check that the correct context is set
      expect(req.request.context).toBeInstanceOf(HttpContext);
      expect(req.request.context.get(SKIP_REFRESH_KEY)).toBe(true);

      req.flush(mockSuccessResponse);

      const result = await promise;
      expect(result).toEqual(mockSuccessResponse.data);
    });

    it('should use correct API endpoint for update', async () => {
      const testId = '123';
      const promise = service.updateApiSettings(testId, mockApiSettingsData);

      const req = httpTestingController.expectOne(`${environment.apiBaseUrl}api-settings/${testId}`);
      expect(req.request.url).toBe(`${environment.apiBaseUrl}api-settings/${testId}`);

      req.flush(mockSuccessResponse);
      await promise;
    });

    it('should throw ApiResponseError when validation errors exist on update', async () => {
      const promise = service.updateApiSettings('1', mockApiSettingsData);

      const req = httpTestingController.expectOne(`${environment.apiBaseUrl}api-settings/1`);
      req.flush(mockErrorResponse);

      try {
        await promise;
        fail('Should have thrown ApiResponseError');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiResponseError);
        expect((error as ApiResponseError).message).toBe('Validation errors');
      }
    });

    it('should throw generic error when no validation errors on update', async () => {
      const promise = service.updateApiSettings('1', mockApiSettingsData);

      const req = httpTestingController.expectOne(`${environment.apiBaseUrl}api-settings/1`);
      req.flush(mockGenericErrorResponse);

      try {
        await promise;
        fail('Should have thrown generic Error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('API settings update failed without specific validation errors.');
      }
    });
  });

  // 6. Delete API Settings Tests
  describe('deleteApiSettings', () => {
    it('should delete API settings successfully', async () => {
      const testId = '1';
      const promise = service.deleteApiSettings(testId);

      const req = httpTestingController.expectOne(`${environment.apiBaseUrl}api-settings/${testId}`);
      expect(req.request.method).toBe('DELETE');

      // Check that the correct context is set
      expect(req.request.context).toBeInstanceOf(HttpContext);
      expect(req.request.context.get(SKIP_REFRESH_KEY)).toBe(true);

      req.flush(mockSuccessResponse);

      const result = await promise;
      expect(result).toEqual(mockSuccessResponse.data);
    });

    it('should use correct API endpoint for delete', async () => {
      const testId = '123';
      const promise = service.deleteApiSettings(testId);

      const req = httpTestingController.expectOne(`${environment.apiBaseUrl}api-settings/${testId}`);
      expect(req.request.url).toBe(`${environment.apiBaseUrl}api-settings/${testId}`);

      req.flush(mockSuccessResponse);
      await promise;
    });

    it('should throw ApiResponseError when validation errors exist on delete', async () => {
      const promise = service.deleteApiSettings('1');

      const req = httpTestingController.expectOne(`${environment.apiBaseUrl}api-settings/1`);
      req.flush(mockErrorResponse);

      try {
        await promise;
        fail('Should have thrown ApiResponseError');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiResponseError);
        expect((error as ApiResponseError).message).toBe('Validation errors');
      }
    });

    it('should throw generic error when no validation errors on delete', async () => {
      const promise = service.deleteApiSettings('1');

      const req = httpTestingController.expectOne(`${environment.apiBaseUrl}api-settings/1`);
      req.flush(mockGenericErrorResponse);

      try {
        await promise;
        fail('Should have thrown generic Error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('API settings deletion failed without specific validation errors.');
      }
    });
  });

  // 7. HTTP Error Handling Tests
  describe('HTTP Error Handling', () => {
    it('should handle HTTP errors gracefully on create', async () => {
      const promise = service.createApiSettings(mockApiSettingsData);

      const req = httpTestingController.expectOne(`${environment.apiBaseUrl}api-settings`);
      req.error(new ErrorEvent('Network error'), { status: 500, statusText: 'Internal Server Error' });

      try {
        await promise;
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeTruthy();
      }
    });

    it('should handle HTTP errors gracefully on get', async () => {
      const promise = service.getApiSettings('1');

      const req = httpTestingController.expectOne(`${environment.apiBaseUrl}api-settings/1`);
      req.error(new ErrorEvent('Network error'), { status: 404, statusText: 'Not Found' });

      try {
        await promise;
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeTruthy();
      }
    });

    it('should handle HTTP errors gracefully on update', async () => {
      const promise = service.updateApiSettings('1', mockApiSettingsData);

      const req = httpTestingController.expectOne(`${environment.apiBaseUrl}api-settings/1`);
      req.error(new ErrorEvent('Network error'), { status: 400, statusText: 'Bad Request' });

      try {
        await promise;
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeTruthy();
      }
    });

    it('should handle HTTP errors gracefully on delete', async () => {
      const promise = service.deleteApiSettings('1');

      const req = httpTestingController.expectOne(`${environment.apiBaseUrl}api-settings/1`);
      req.error(new ErrorEvent('Network error'), { status: 403, statusText: 'Forbidden' });

      try {
        await promise;
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeTruthy();
      }
    });
  });
});
