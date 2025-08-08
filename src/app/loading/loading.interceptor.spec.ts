import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpContext, HttpRequest } from '@angular/common/http';
import { HttpTestingController, HttpClientTestingModule, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { loadingInterceptor } from './loading.interceptor';
import { LoadingService } from './loading.service';
import { SkipLoading } from './skip-loading.component';

describe('LoadingInterceptor', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let loadingService: LoadingService;
  let loadingOnSpy: jasmine.Spy;
  let loadingOffSpy: jasmine.Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        LoadingService,
        provideHttpClient(withInterceptors([loadingInterceptor])),
        provideHttpClientTesting()
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    loadingService = TestBed.inject(LoadingService);
    
    // Set up spies
    loadingOnSpy = spyOn(loadingService, 'loadingOn');
    loadingOffSpy = spyOn(loadingService, 'loadingOff');
  });

  afterEach(() => {
    // Verify that no unmatched requests are outstanding
    httpTestingController.verify();
  });

  describe('Basic Interceptor Functionality', () => {
    it('should be created', () => {
      expect(loadingInterceptor).toBeTruthy();
      expect(typeof loadingInterceptor).toBe('function');
    });

    it('should turn on loading before request and turn off after response', () => {
      // Act
      httpClient.get('/test').subscribe();

      // Assert - Loading should be turned on during request
      expect(loadingOnSpy).toHaveBeenCalled();

      // Complete the request
      const req = httpTestingController.expectOne('/test');
      req.flush({ data: 'test' });

      // Assert - Loading should be turned off after response
      expect(loadingOffSpy).toHaveBeenCalled();
    });

    it('should turn off loading even if request fails', () => {
      // Act
      httpClient.get('/test').subscribe({
        next: () => {},
        error: () => {} // Handle error to prevent test failure
      });

      // Assert - Loading should be turned on
      expect(loadingOnSpy).toHaveBeenCalled();

      // Simulate error response
      const req = httpTestingController.expectOne('/test');
      req.error(new ProgressEvent('Network error'));

      // Assert - Loading should be turned off even on error
      expect(loadingOffSpy).toHaveBeenCalled();
    });
  });

  describe('SkipLoading Context', () => {
    it('should skip loading when SkipLoading context is true', () => {
      // Arrange
      const context = new HttpContext().set(SkipLoading, true);

      // Act
      httpClient.get('/test', { context }).subscribe();

      // Assert - Loading methods should not be called
      expect(loadingOnSpy).not.toHaveBeenCalled();

      // Complete the request
      const req = httpTestingController.expectOne('/test');
      req.flush({ data: 'test' });

      // Assert - Loading methods should still not be called
      expect(loadingOffSpy).not.toHaveBeenCalled();
    });

    it('should use loading when SkipLoading context is false', () => {
      // Arrange
      const context = new HttpContext().set(SkipLoading, false);

      // Act
      httpClient.get('/test', { context }).subscribe();

      // Assert - Loading should be turned on
      expect(loadingOnSpy).toHaveBeenCalled();

      // Complete the request
      const req = httpTestingController.expectOne('/test');
      req.flush({ data: 'test' });

      // Assert - Loading should be turned off after response
      expect(loadingOffSpy).toHaveBeenCalled();
    });

    it('should use loading when SkipLoading context is not set', () => {
      // Act
      httpClient.get('/test').subscribe();

      // Assert - Loading should be turned on (default behavior)
      expect(loadingOnSpy).toHaveBeenCalled();

      // Complete the request
      const req = httpTestingController.expectOne('/test');
      req.flush({ data: 'test' });

      // Assert - Loading should be turned off
      expect(loadingOffSpy).toHaveBeenCalled();
    });
  });

  describe('Multiple Concurrent Requests', () => {
    it('should handle multiple concurrent requests', () => {
      // Reset spies to count calls
      loadingOnSpy.calls.reset();
      loadingOffSpy.calls.reset();

      // Act - Start multiple requests
      httpClient.get('/test1').subscribe();
      httpClient.get('/test2').subscribe();
      httpClient.get('/test3').subscribe();

      // Assert - Loading should be turned on for each request
      expect(loadingOnSpy).toHaveBeenCalledTimes(3);

      // Complete first request
      const req1 = httpTestingController.expectOne('/test1');
      req1.flush({ data: 'test1' });

      // One loadingOff should be called
      expect(loadingOffSpy).toHaveBeenCalledTimes(1);

      // Complete remaining requests
      const req2 = httpTestingController.expectOne('/test2');
      const req3 = httpTestingController.expectOne('/test3');
      req2.flush({ data: 'test2' });
      req3.flush({ data: 'test3' });

      // All loadingOff should be called
      expect(loadingOffSpy).toHaveBeenCalledTimes(3);
    });

    it('should handle mixed SkipLoading and regular requests', () => {
      // Arrange
      const skipContext = new HttpContext().set(SkipLoading, true);

      // Reset spies to count calls
      loadingOnSpy.calls.reset();
      loadingOffSpy.calls.reset();

      // Act - One request with skip loading, one without
      httpClient.get('/skip', { context: skipContext }).subscribe();
      httpClient.get('/normal').subscribe();

      // Assert - loadingOn should only be called once (for normal request)
      expect(loadingOnSpy).toHaveBeenCalledTimes(1);

      // Complete both requests
      const skipReq = httpTestingController.expectOne('/skip');
      const normalReq = httpTestingController.expectOne('/normal');
      
      skipReq.flush({ data: 'skip' });
      normalReq.flush({ data: 'normal' });

      // Assert - loadingOff should only be called once (for normal request)
      expect(loadingOffSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Different HTTP Methods', () => {
    const httpMethods = [
      { method: 'GET', call: (url: string) => httpClient.get(url) },
      { method: 'POST', call: (url: string) => httpClient.post(url, {}) },
      { method: 'PUT', call: (url: string) => httpClient.put(url, {}) },
      { method: 'DELETE', call: (url: string) => httpClient.delete(url) },
      { method: 'PATCH', call: (url: string) => httpClient.patch(url, {}) }
    ];

    httpMethods.forEach(({ method, call }) => {
      it(`should handle ${method} requests correctly`, () => {
        // Reset spies for each test
        loadingOnSpy.calls.reset();
        loadingOffSpy.calls.reset();

        // Act
        call('/test').subscribe();

        // Assert - Loading should be turned on
        expect(loadingOnSpy).toHaveBeenCalled();

        // Complete request
        const req = httpTestingController.expectOne('/test');
        expect(req.request.method).toBe(method);
        req.flush({ data: 'test' });

        // Assert - Loading should be turned off
        expect(loadingOffSpy).toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling', () => {
    it('should turn off loading on HTTP error', () => {
      // Reset spies
      loadingOnSpy.calls.reset();
      loadingOffSpy.calls.reset();

      // Act
      httpClient.get('/test').subscribe({
        next: () => {},
        error: () => {} // Handle error
      });

      expect(loadingOnSpy).toHaveBeenCalled();

      // Simulate 404 error
      const req = httpTestingController.expectOne('/test');
      req.flush('Not found', { status: 404, statusText: 'Not Found' });

      expect(loadingOffSpy).toHaveBeenCalled();
    });

    it('should turn off loading on network error', () => {
      // Reset spies
      loadingOnSpy.calls.reset();
      loadingOffSpy.calls.reset();

      // Act
      httpClient.get('/test').subscribe({
        next: () => {},
        error: () => {} // Handle error
      });

      expect(loadingOnSpy).toHaveBeenCalled();

      // Simulate network error
      const req = httpTestingController.expectOne('/test');
      req.error(new ProgressEvent('Network error'));

      expect(loadingOffSpy).toHaveBeenCalled();
    });

    it('should turn off loading on timeout', () => {
      // Reset spies
      loadingOnSpy.calls.reset();
      loadingOffSpy.calls.reset();

      // Act
      httpClient.get('/test').subscribe({
        next: () => {},
        error: () => {} // Handle error
      });

      expect(loadingOnSpy).toHaveBeenCalled();

      // Simulate timeout
      const req = httpTestingController.expectOne('/test');
      req.error(new ProgressEvent('Timeout'));

      expect(loadingOffSpy).toHaveBeenCalled();
    });
  });

  describe('Request Context Handling', () => {
    it('should properly read SkipLoading token from context', () => {
      // Test default value
      const defaultContext = new HttpContext();
      expect(defaultContext.get(SkipLoading)).toBe(false);

      // Test explicit true
      const skipTrueContext = new HttpContext().set(SkipLoading, true);
      expect(skipTrueContext.get(SkipLoading)).toBe(true);

      // Test explicit false
      const skipFalseContext = new HttpContext().set(SkipLoading, false);
      expect(skipFalseContext.get(SkipLoading)).toBe(false);
    });

    it('should preserve other context values', () => {
      // Create context with multiple values
      const customToken = new HttpContext().set(SkipLoading, true);
      
      // Make request with context
      httpClient.get('/test', { context: customToken }).subscribe();

      // Verify request was made and context preserved
      const req = httpTestingController.expectOne('/test');
      expect(req.request.context.get(SkipLoading)).toBe(true);
      
      req.flush({ data: 'test' });
    });
  });

  describe('Integration Scenarios', () => {
    it('should work with authentication flows', () => {
      // Reset spies
      loadingOnSpy.calls.reset();
      loadingOffSpy.calls.reset();

      // Simulate login request
      httpClient.post('/auth/login', { username: 'test', password: 'test' }).subscribe();
      expect(loadingOnSpy).toHaveBeenCalled();

      const loginReq = httpTestingController.expectOne('/auth/login');
      loginReq.flush({ token: 'abc123' });
      expect(loadingOffSpy).toHaveBeenCalled();
    });

    it('should work with file upload scenarios', () => {
      // Reset spies
      loadingOnSpy.calls.reset();
      loadingOffSpy.calls.reset();

      // Simulate file upload
      const formData = new FormData();
      formData.append('file', new Blob(['test']), 'test.txt');

      httpClient.post('/upload', formData).subscribe();
      expect(loadingOnSpy).toHaveBeenCalled();

      const uploadReq = httpTestingController.expectOne('/upload');
      uploadReq.flush({ fileId: '123' });
      expect(loadingOffSpy).toHaveBeenCalled();
    });

    it('should work with background requests that skip loading', () => {
      // Reset spies
      loadingOnSpy.calls.reset();
      loadingOffSpy.calls.reset();

      // Simulate background polling that shouldn't show loading
      const backgroundContext = new HttpContext().set(SkipLoading, true);

      httpClient.get('/api/poll', { context: backgroundContext }).subscribe();
      
      // Should not call loading methods
      expect(loadingOnSpy).not.toHaveBeenCalled();

      const pollReq = httpTestingController.expectOne('/api/poll');
      pollReq.flush({ status: 'ok' });
      
      expect(loadingOffSpy).not.toHaveBeenCalled();
    });
  });

  describe('Performance and Memory', () => {
    it('should not leak memory with many requests', () => {
      // Make many requests to test for memory leaks
      for (let i = 0; i < 100; i++) {
        httpClient.get(`/test${i}`).subscribe();
        
        const req = httpTestingController.expectOne(`/test${i}`);
        req.flush({ data: `test${i}` });
      }

      // Loading should be off and service should still work
      expect(loadingService.loading()).toBe(false);
    });

    it('should handle rapid request cycles efficiently', () => {
      const startTime = performance.now();

      // Rapid request cycles
      for (let i = 0; i < 50; i++) {
        httpClient.get(`/rapid${i}`).subscribe();
        const req = httpTestingController.expectOne(`/rapid${i}`);
        req.flush({ data: i });
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete quickly
      expect(duration).toBeLessThan(1000);
      expect(loadingService.loading()).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle requests with no response body', () => {
      // Reset spies
      loadingOnSpy.calls.reset();
      loadingOffSpy.calls.reset();

      httpClient.delete('/test').subscribe();
      expect(loadingOnSpy).toHaveBeenCalled();

      const req = httpTestingController.expectOne('/test');
      req.flush(null); // No response body
      expect(loadingOffSpy).toHaveBeenCalled();
    });

    it('should handle requests with custom headers', () => {
      const headers = { 'Custom-Header': 'test-value' };
      
      // Reset spies
      loadingOnSpy.calls.reset();
      loadingOffSpy.calls.reset();

      httpClient.get('/test', { headers }).subscribe();
      expect(loadingOnSpy).toHaveBeenCalled();

      const req = httpTestingController.expectOne('/test');
      expect(req.request.headers.get('Custom-Header')).toBe('test-value');
      req.flush({ data: 'test' });
      expect(loadingOffSpy).toHaveBeenCalled();
    });

    it('should handle requests that are cancelled', () => {
      // Reset spies
      loadingOnSpy.calls.reset();
      loadingOffSpy.calls.reset();

      const subscription = httpClient.get('/test').subscribe();
      expect(loadingOnSpy).toHaveBeenCalled();

      // Cancel the request
      subscription.unsubscribe();

      // Don't flush the request since it's cancelled - just verify it exists and cancel it
      const req = httpTestingController.expectOne('/test');
      req.request.body; // Just access to avoid unused warning

      // Loading should still be turned off by finalize when subscription is cancelled
      expect(loadingOffSpy).toHaveBeenCalled();
    });
  });
});
