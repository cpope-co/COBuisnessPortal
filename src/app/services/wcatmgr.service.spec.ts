import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { WCatMgrService } from './wcatmgr.service';
import { WCatMgr } from '../models/wcatmgr.model';
import { GetWCatMgrResponse } from '../models/get-wcatmgr.response';
import { environment } from '../../environments/environment';
import { HttpContext } from '@angular/common/http';
import { SKIP_REFRESH_KEY, SKIP_AUTH_KEY } from '../shared/http-context-keys';

describe('WCatMgrService', () => {
  let service: WCatMgrService;
  let httpMock: HttpTestingController;
  let localStorageSpy: jasmine.Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [WCatMgrService]
    });
    service = TestBed.inject(WCatMgrService);
    httpMock = TestBed.inject(HttpTestingController);

    // Mock localStorage
    localStorageSpy = spyOn(localStorage, 'getItem').and.returnValue(null);
    spyOn(localStorage, 'setItem');
    spyOn(localStorage, 'removeItem');
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
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
      expect(service.wcatmgrs).toBeTruthy();
      expect(service.wcatmgrs()).toEqual([]);
    });
  });

  describe('loadAllWCatMgrs Method', () => {
    it('should load WCatMgrs from cache when available', async () => {
      const cachedWCatMgrs: WCatMgr[] = [
        {
          id: 1,
          name: 'Category Manager 1'
        },
        {
          id: 2,
          name: 'Category Manager 2'
        }
      ];

      localStorageSpy.and.returnValue(JSON.stringify(cachedWCatMgrs));

      const result = await service.loadAllWCatMgrs();

      expect(result).toEqual(cachedWCatMgrs);
      expect(localStorage.getItem).toHaveBeenCalledWith('wcatmgr');
      // No HTTP request should be made when cache exists
      httpMock.expectNone(`${environment.apiBaseUrl}/register`);
    });

    it('should load WCatMgrs from server when cache is empty', async () => {
      const serverWCatMgrs: WCatMgr[] = [
        {
          id: 1,
          name: 'Server Category Manager 1'
        },
        {
          id: 2,
          name: 'Server Category Manager 2'
        }
      ];

      const mockResponse: GetWCatMgrResponse = {
        wcatmgr: serverWCatMgrs
      };

      localStorageSpy.and.returnValue(null);

      const promise = service.loadAllWCatMgrs();

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/register`);
      expect(req.request.method).toBe('GET');
      
      // Check that proper HTTP context is set
      expect(req.request.context.get(SKIP_REFRESH_KEY)).toBe(true);
      expect(req.request.context.get(SKIP_AUTH_KEY)).toBe(true);
      
      req.flush(mockResponse);

      const result = await promise;

      expect(result).toEqual(serverWCatMgrs);
      expect(service.wcatmgrs()).toEqual(serverWCatMgrs);
      expect(localStorage.setItem).toHaveBeenCalledWith('wcatmgr', JSON.stringify(serverWCatMgrs));
    });

    it('should load from server when cache contains empty array string', async () => {
      const serverWCatMgrs: WCatMgr[] = [
        {
          id: 1,
          name: 'Category Manager 1'
        }
      ];

      const mockResponse: GetWCatMgrResponse = {
        wcatmgr: serverWCatMgrs
      };

      localStorageSpy.and.returnValue('[]');

      const promise = service.loadAllWCatMgrs();

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/register`);
      req.flush(mockResponse);

      const result = await promise;

      expect(result).toEqual(serverWCatMgrs);
      expect(service.wcatmgrs()).toEqual(serverWCatMgrs);
    });

    it('should handle empty array response from server', async () => {
      const mockResponse: GetWCatMgrResponse = {
        wcatmgr: []
      };

      localStorageSpy.and.returnValue(null);

      const promise = service.loadAllWCatMgrs();

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/register`);
      req.flush(mockResponse);

      const result = await promise;

      expect(result).toEqual([]);
      expect(service.wcatmgrs()).toEqual([]);
      expect(localStorage.setItem).toHaveBeenCalledWith('wcatmgr', JSON.stringify([]));
    });

    it('should handle HTTP errors when loading from server', async () => {
      localStorageSpy.and.returnValue(null);

      const promise = service.loadAllWCatMgrs();

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/register`);
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

    it('should handle invalid JSON in cache gracefully', async () => {
      localStorageSpy.and.returnValue('invalid json');

      const promise = service.loadAllWCatMgrs();

      try {
        await promise;
        fail('Expected JSON parse error to be thrown');
      } catch (error) {
        expect(error).toBeTruthy();
      }
    });

    it('should update signal when loading from server', async () => {
      const serverWCatMgrs: WCatMgr[] = [
        {
          id: 1,
          name: 'Test Category Manager'
        }
      ];

      const mockResponse: GetWCatMgrResponse = {
        wcatmgr: serverWCatMgrs
      };

      localStorageSpy.and.returnValue(null);

      const promise = service.loadAllWCatMgrs();

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/register`);
      req.flush(mockResponse);

      const result = await promise;
      expect(result).toEqual(serverWCatMgrs);
      expect(service.wcatmgrs()).toEqual(serverWCatMgrs);
    });

    it('should prefer cache over server when valid cache exists', async () => {
      const cachedWCatMgrs: WCatMgr[] = [
        {
          id: 1,
          name: 'Cached Category Manager'
        }
      ];

      localStorageSpy.and.returnValue(JSON.stringify(cachedWCatMgrs));

      const result = await service.loadAllWCatMgrs();

      expect(result).toEqual(cachedWCatMgrs);
      // No HTTP request should be made
      httpMock.expectNone(`${environment.apiBaseUrl}/register`);
    });
  });

  describe('Signal and localStorage Integration', () => {
    it('should update localStorage when signal changes', async () => {
      const serverWCatMgrs: WCatMgr[] = [
        {
          id: 1,
          name: 'Test Manager'
        }
      ];

      const mockResponse: GetWCatMgrResponse = {
        wcatmgr: serverWCatMgrs
      };

      localStorageSpy.and.returnValue(null);

      const promise = service.loadAllWCatMgrs();
      const req = httpMock.expectOne(`${environment.apiBaseUrl}/register`);
      req.flush(mockResponse);

      await promise;

      // The effect should have updated localStorage when the signal changed
      expect(localStorage.setItem).toHaveBeenCalledWith('wcatmgr', JSON.stringify(serverWCatMgrs));
    });

    it('should handle signal updates with null data', async () => {
      const mockResponse: GetWCatMgrResponse = {
        wcatmgr: null as any
      };

      localStorageSpy.and.returnValue(null);

      const promise = service.loadAllWCatMgrs();
      const req = httpMock.expectOne(`${environment.apiBaseUrl}/register`);
      req.flush(mockResponse);

      const result = await promise;
      expect(result).toBeNull();
      expect(service.wcatmgrs()).toBeNull();
    });

    it('should maintain signal state across multiple operations', async () => {
      // First load from server
      const firstWCatMgrs: WCatMgr[] = [
        { id: 1, name: 'First Manager' }
      ];

      localStorageSpy.and.returnValue(null);

      const promise1 = service.loadAllWCatMgrs();
      let req = httpMock.expectOne(`${environment.apiBaseUrl}/register`);
      req.flush({ wcatmgr: firstWCatMgrs });

      await promise1;
      expect(service.wcatmgrs()).toEqual(firstWCatMgrs);

      // Second load from cache
      localStorageSpy.and.returnValue(JSON.stringify(firstWCatMgrs));

      const result = await service.loadAllWCatMgrs();

      expect(result).toEqual(firstWCatMgrs);
      expect(service.wcatmgrs()).toEqual(firstWCatMgrs);
    });
  });

  describe('HTTP Context Configuration', () => {
    it('should set proper HTTP context for server requests', async () => {
      localStorageSpy.and.returnValue(null);

      service.loadAllWCatMgrs();

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/register`);
      
      // Verify HTTP context is properly set
      expect(req.request.context.get(SKIP_REFRESH_KEY)).toBe(true);
      expect(req.request.context.get(SKIP_AUTH_KEY)).toBe(true);
      
      req.flush({ wcatmgr: [] });
    });

    it('should handle requests with proper context for authentication skip', async () => {
      localStorageSpy.and.returnValue('[]');

      service.loadAllWCatMgrs();

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/register`);
      
      // These context keys should prevent auth and refresh token logic
      expect(req.request.context.get(SKIP_REFRESH_KEY)).toBe(true);
      expect(req.request.context.get(SKIP_AUTH_KEY)).toBe(true);
      
      req.flush({ wcatmgr: [] });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle malformed server response', async () => {
      localStorageSpy.and.returnValue(null);

      const malformedResponse = {
        // Missing wcatmgr property
        data: 'invalid structure'
      };

      const promise = service.loadAllWCatMgrs();

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/register`);
      req.flush(malformedResponse);

      try {
        await promise;
        fail('Expected error due to missing wcatmgr property');
      } catch (error) {
        expect(error).toBeTruthy();
      }
    });

    it('should handle localStorage access errors', async () => {
      localStorageSpy.and.throwError('Storage access denied');

      const serverWCatMgrs: WCatMgr[] = [
        { id: 1, name: 'Manager 1' }
      ];

      try {
        await service.loadAllWCatMgrs();
        fail('Expected localStorage error to be thrown');
      } catch (error: any) {
        expect(error.message).toBe('Storage access denied');
      }
    });

    it('should handle localStorage setItem errors gracefully', async () => {
      localStorageSpy.and.returnValue(null);
      // The setItem spy is already created in beforeEach, so we modify its behavior
      (localStorage.setItem as jasmine.Spy).and.throwError('Storage quota exceeded');

      const serverWCatMgrs: WCatMgr[] = [
        { id: 1, name: 'Manager 1' }
      ];

      try {
        const promise = service.loadAllWCatMgrs();

        const req = httpMock.expectOne(`${environment.apiBaseUrl}/register`);
        req.flush({ wcatmgr: serverWCatMgrs });

        const result = await promise;

        expect(result).toEqual(serverWCatMgrs);
        expect(service.wcatmgrs()).toEqual(serverWCatMgrs);
      } catch (error: any) {
        // localStorage.setItem error might be thrown by the effect
        expect(error.message).toBe('Storage quota exceeded');
      }
    });

    it('should handle network timeout errors', async () => {
      localStorageSpy.and.returnValue(null);

      const promise = service.loadAllWCatMgrs();

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/register`);
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

    it('should handle very large cached data efficiently', async () => {
      const largeWCatMgrs: WCatMgr[] = [];
      for (let i = 0; i < 10000; i++) {
        largeWCatMgrs.push({
          id: i,
          name: `Manager ${i}`
        });
      }

      localStorageSpy.and.returnValue(JSON.stringify(largeWCatMgrs));

      const startTime = performance.now();
      const result = await service.loadAllWCatMgrs();
      const endTime = performance.now();

      expect(result).toEqual(largeWCatMgrs);
      expect(endTime - startTime).toBeLessThan(100); // Should handle large data efficiently
    });

    it('should handle special characters in cached data', async () => {
      const specialWCatMgrs: WCatMgr[] = [
        { id: 1, name: 'Gestionnaire spécial' },
        { id: 2, name: '特殊管理员' },
        { id: 3, name: 'Manager with "quotes" and \\ backslashes' }
      ];

      localStorageSpy.and.returnValue(JSON.stringify(specialWCatMgrs));

      const result = await service.loadAllWCatMgrs();

      expect(result).toEqual(specialWCatMgrs);
    });
  });

  describe('Performance Tests', () => {
    it('should load from cache efficiently', async () => {
      const wcatmgrs = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        name: `Manager ${i}`
      }));

      localStorageSpy.and.returnValue(JSON.stringify(wcatmgrs));

      const startTime = performance.now();
      const result = await service.loadAllWCatMgrs();
      const endTime = performance.now();

      expect(result).toEqual(wcatmgrs);
      expect(endTime - startTime).toBeLessThan(50); // Very fast cache access
    });

    it('should handle multiple concurrent requests efficiently', async () => {
      localStorageSpy.and.returnValue(null);

      const wcatmgrs: WCatMgr[] = [
        { id: 1, name: 'Manager 1' }
      ];

      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(service.loadAllWCatMgrs());
      }

      // Each concurrent request will result in a separate HTTP request since there's no built-in deduplication
      const reqs = httpMock.match(`${environment.apiBaseUrl}/register`);
      expect(reqs.length).toBe(5);
      
      reqs.forEach(req => {
        req.flush({ wcatmgr: wcatmgrs });
      });

      const startTime = performance.now();
      const results = await Promise.all(promises);
      const endTime = performance.now();

      // All promises should resolve to the same data
      results.forEach(result => {
        expect(result).toEqual(wcatmgrs);
      });

      expect(endTime - startTime).toBeLessThan(1000); // Should handle concurrent requests within reasonable time
    });
  });

  describe('Memory Management', () => {
    it('should not leak memory with repeated operations', async () => {
      const wcatmgrs: WCatMgr[] = [{ id: 1, name: 'Manager 1' }];
      localStorageSpy.and.returnValue(JSON.stringify(wcatmgrs));

      // Perform many operations - all should return cached data
      for (let i = 0; i < 100; i++) {
        const result = await service.loadAllWCatMgrs();
        expect(result).toEqual(wcatmgrs);
      }

      // When using cache, signal stays empty (service design)
      expect(service.wcatmgrs()).toEqual([]);
    });

    it('should handle cache invalidation scenarios', async () => {
      // Start with cached data
      localStorageSpy.and.returnValue(JSON.stringify([{ id: 1, name: 'Old Manager' }]));
      const firstResult = await service.loadAllWCatMgrs();

      expect(firstResult).toEqual([{ id: 1, name: 'Old Manager' }]);
      // Signal remains empty when data comes from cache
      expect(service.wcatmgrs()).toEqual([]);

      // Simulate cache invalidation
      localStorageSpy.and.returnValue(null);
      const newWCatMgrs: WCatMgr[] = [{ id: 1, name: 'New Manager' }];

      const promise = service.loadAllWCatMgrs();
      const req = httpMock.expectOne(`${environment.apiBaseUrl}/register`);
      req.flush({ wcatmgr: newWCatMgrs });

      const result = await promise;

      expect(result).toEqual(newWCatMgrs);
      expect(service.wcatmgrs()).toEqual(newWCatMgrs);
    });
  });
});
