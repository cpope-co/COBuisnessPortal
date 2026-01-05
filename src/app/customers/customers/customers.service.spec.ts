import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SampleApplicationService } from './customers.service';
import { environment } from '../../../environments/environment';
import { ApiResponseError } from '../../shared/api-response-error';
import { MOCK_CUSTOMERS, MOCK_UDC_OPTIONS } from '../../../testing/test-helpers';
import { SampleData, SampleDataPayload, UDCOption } from './customer.model';

describe('SampleApplicationService', () => {
  let service: SampleApplicationService;
  let originalUseMockData: boolean;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SampleApplicationService]
    });
    service = TestBed.inject(SampleApplicationService);
    
    // Save original mock setting
    originalUseMockData = environment.useMockSampleData;
    
    // Enable mock mode for all tests
    environment.useMockSampleData = true;
    
    // Reset mock errors before each test
    service.resetMockErrors();
    
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    // Restore original setting
    environment.useMockSampleData = originalUseMockData;
    service.resetMockErrors();
    localStorage.clear();
  });

  describe('Service Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should have udcOptions signal', () => {
      expect(service.udcOptions).toBeDefined();
      expect(service.udcOptions()).toEqual([]);
    });
  });

  describe('loadAllSampleData', () => {
    it('should return all 8 customers from MOCK_SAMPLE_DATA', async () => {
      const result = await service.loadAllSampleData();
      
      expect(result).toEqual(MOCK_CUSTOMERS);
      expect(result.length).toBe(8);
      expect(result[0].CustNumber).toBe(1001);
      expect(result[0].CustName).toBe('Acme Corporation');
    });

    it('should simulate network delay between 300-600ms', async () => {
      const startTime = Date.now();
      await service.loadAllSampleData();
      const duration = Date.now() - startTime;
      
      expect(duration).toBeGreaterThanOrEqual(300);
      expect(duration).toBeLessThan(1000); // Allow some overhead
    });

    it('should return a copy of data (not original array)', async () => {
      const result1 = await service.loadAllSampleData();
      const result2 = await service.loadAllSampleData();
      
      expect(result1).not.toBe(result2); // Different array instances
      expect(result1).toEqual(result2); // But same content
    });

    it('should throw server error when simulateServerError is enabled', async () => {
      service.setMockError('serverError', true);
      
      try {
        await service.loadAllSampleData();
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiResponseError);
        expect((error as ApiResponseError).validationErrors[0].errDesc).toBe('Internal server error occurred');
      }
    });

    it('should handle edge case of empty MOCK_SAMPLE_DATA', async () => {
      // Access private property for testing
      (service as any).MOCK_SAMPLE_DATA = [];
      
      const result = await service.loadAllSampleData();
      
      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });
  });

  describe('getSampleDataById', () => {
    it('should return customer 1001 by ID', async () => {
      const result = await service.getSampleDataById(1001);
      
      expect(result).toEqual(MOCK_CUSTOMERS[0]);
      expect(result.CustNumber).toBe(1001);
      expect(result.CustName).toBe('Acme Corporation');
    });

    it('should return customer 1008 by ID', async () => {
      const result = await service.getSampleDataById(1008);
      
      expect(result).toEqual(MOCK_CUSTOMERS[7]);
      expect(result.CustNumber).toBe(1008);
      expect(result.CustName).toBe('Mountain View Partners');
    });

    it('should throw 404 error for non-existent customer ID 9999', async () => {
      try {
        await service.getSampleDataById(9999);
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiResponseError);
        expect((error as ApiResponseError).validationErrors[0].errDesc).toBe('Customer record not found');
      }
    });

    it('should throw 404 when simulateNotFound is enabled', async () => {
      service.setMockError('notFound', true);
      
      try {
        await service.getSampleDataById(1001);
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiResponseError);
        expect((error as ApiResponseError).validationErrors[0].errDesc).toBe('Customer record not found');
      }
    });

    it('should handle edge case of null ID gracefully', async () => {
      try {
        await service.getSampleDataById(null as any);
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiResponseError);
      }
    });

    it('should handle edge case of undefined ID gracefully', async () => {
      try {
        await service.getSampleDataById(undefined as any);
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiResponseError);
      }
    });

    it('should handle edge case of zero ID', async () => {
      try {
        await service.getSampleDataById(0);
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiResponseError);
      }
    });

    it('should return a copy of customer (not original)', async () => {
      const result1 = await service.getSampleDataById(1001);
      const result2 = await service.getSampleDataById(1001);
      
      expect(result1).not.toBe(result2); // Different object instances
      expect(result1).toEqual(result2); // But same content
    });
  });

  describe('loadUDCOptions', () => {
    it('should return 4 UDC options', async () => {
      const result = await service.loadUDCOptions();
      
      expect(result).toEqual(MOCK_UDC_OPTIONS);
      expect(result.length).toBe(4);
    });

    it('should return options with correct structure', async () => {
      const result = await service.loadUDCOptions();
      
      expect(result[0].TypeCodeList).toBe('A');
      expect(result[0].TypeDescList).toBe('Premium Customer');
      expect(result[1].TypeCodeList).toBe('B');
      expect(result[1].TypeDescList).toBe('Standard Customer');
    });

    it('should cache options in localStorage', async () => {
      await service.loadUDCOptions();
      
      const cached = localStorage.getItem('sampleData_udcOptions');
      expect(cached).toBeTruthy();
      expect(JSON.parse(cached!)).toEqual(MOCK_UDC_OPTIONS);
    });

    it('should update udcOptions signal', async () => {
      await service.loadUDCOptions();
      
      expect(service.udcOptions()).toEqual(MOCK_UDC_OPTIONS);
    });

    it('should simulate 300ms delay', async () => {
      const startTime = Date.now();
      await service.loadUDCOptions();
      const duration = Date.now() - startTime;
      
      expect(duration).toBeGreaterThanOrEqual(300);
    });

    it('should throw server error when simulateServerError is enabled', async () => {
      service.setMockError('serverError', true);
      
      try {
        await service.loadUDCOptions();
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiResponseError);
        expect((error as ApiResponseError).validationErrors[0].errDesc).toBe('Internal server error occurred');
      }
    });

    it('should handle edge case when localStorage.setItem fails', async () => {
      spyOn(localStorage, 'setItem').and.throwError('Storage quota exceeded');
      
      // Service will throw error if localStorage fails during mock
      try {
        await service.loadUDCOptions();
        fail('Expected error to be thrown');
      } catch (error: any) {
        expect(error.message).toContain('Storage quota exceeded');
      }
    });

    it('should handle edge case of empty options array', async () => {
      (service as any).MOCK_UDC_OPTIONS = [];
      
      const result = await service.loadUDCOptions();
      
      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });
  });

  describe('createSampleData', () => {
    it('should create new customer with auto-generated CustNumber', async () => {
      const payload: SampleDataPayload = {
        CustNum: null,
        CustTypeCode: 'A',
        CandyLiker: true
      };
      
      const result = await service.createSampleData(payload);
      
      expect(result.CustNumber).toBe(1009); // Max is 1008, so next is 1009
      expect(result.CustTypeCode).toBe('A');
      expect(result.CustTypeDesc).toBe('Premium Customer');
      expect(result.CandyLiker).toBe(true);
    });

    it('should add new customer to MOCK_SAMPLE_DATA array', async () => {
      const initialLength = (service as any).MOCK_SAMPLE_DATA.length;
      
      const payload: SampleDataPayload = {
        CustNum: null,
        CustTypeCode: 'B',
        CandyLiker: false
      };
      
      await service.createSampleData(payload);
      
      const newLength = (service as any).MOCK_SAMPLE_DATA.length;
      expect(newLength).toBe(initialLength + 1);
    });

    it('should find and set correct TypeDesc for type code', async () => {
      const payload: SampleDataPayload = {
        CustNum: null,
        CustTypeCode: 'D',
        CandyLiker: true
      };
      
      const result = await service.createSampleData(payload);
      
      expect(result.CustTypeDesc).toBe('Wholesale Customer');
    });

    it('should simulate 600ms delay', async () => {
      const startTime = Date.now();
      
      const payload: SampleDataPayload = {
        CustNum: null,
        CustTypeCode: 'A',
        CandyLiker: true
      };
      
      await service.createSampleData(payload);
      const duration = Date.now() - startTime;
      
      expect(duration).toBeGreaterThanOrEqual(600);
    });

    it('should throw 409 Conflict when simulateConflict is enabled', async () => {
      service.setMockError('conflict', true);
      
      const payload: SampleDataPayload = {
        CustNum: null,
        CustTypeCode: 'A',
        CandyLiker: true
      };
      
      try {
        await service.createSampleData(payload);
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiResponseError);
        expect((error as ApiResponseError).validationErrors[0].errDesc).toBe('Customer record already exists');
      }
    });

    it('should throw 400 Bad Request when simulateBadRequest is enabled', async () => {
      service.setMockError('badRequest', true);
      
      const payload: SampleDataPayload = {
        CustNum: null,
        CustTypeCode: 'A',
        CandyLiker: true
      };
      
      try {
        await service.createSampleData(payload);
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiResponseError);
        const validationErrors = (error as ApiResponseError).validationErrors;
        expect(validationErrors.length).toBe(2);
        expect(validationErrors[0].field).toBe('CustTypeCode');
      }
    });

    it('should handle edge case of null CustTypeCode', async () => {
      const payload: SampleDataPayload = {
        CustNum: null,
        CustTypeCode: null as any,
        CandyLiker: true
      };
      
      const result = await service.createSampleData(payload);
      
      expect(result.CustTypeDesc).toBe(''); // No match found
    });

    it('should handle edge case of undefined CandyLiker', async () => {
      const payload: SampleDataPayload = {
        CustNum: null,
        CustTypeCode: 'A',
        CandyLiker: undefined as any
      };
      
      const result = await service.createSampleData(payload);
      
      expect(result.CandyLiker).toBeUndefined();
    });
  });

  describe('updateSampleData', () => {
    it('should update existing customer', async () => {
      const payload: SampleDataPayload = {
        CustNum: 1001,
        CustTypeCode: 'B',
        CandyLiker: false
      };
      
      const result = await service.updateSampleData(payload);
      
      expect(result.CustNumber).toBe(1001);
      expect(result.CustTypeCode).toBe('B');
      expect(result.CustTypeDesc).toBe('Standard Customer');
      expect(result.CandyLiker).toBe(false);
    });

    it('should modify MOCK_SAMPLE_DATA array', async () => {
      const payload: SampleDataPayload = {
        CustNum: 1002,
        CustTypeCode: 'A',
        CandyLiker: true
      };
      
      await service.updateSampleData(payload);
      
      const updated = (service as any).MOCK_SAMPLE_DATA.find((c: SampleData) => c.CustNumber === 1002);
      expect(updated.CustTypeCode).toBe('A');
      expect(updated.CandyLiker).toBe(true);
    });

    it('should preserve other customer fields (CustName, CustAddress)', async () => {
      const payload: SampleDataPayload = {
        CustNum: 1003,
        CustTypeCode: 'C',
        CandyLiker: false
      };
      
      const result = await service.updateSampleData(payload);
      
      expect(result.CustName).toBe('Tech Solutions Inc');
      expect(result.CustAddress).toBe('789 Pine Rd, Austin, TX 78701');
    });

    it('should throw 404 for non-existent customer ID', async () => {
      const payload: SampleDataPayload = {
        CustNum: 9999,
        CustTypeCode: 'A',
        CandyLiker: true
      };
      
      try {
        await service.updateSampleData(payload);
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiResponseError);
        expect((error as ApiResponseError).validationErrors[0].errDesc).toBe('Customer record not found');
      }
    });

    it('should throw 404 when simulateNotFound is enabled', async () => {
      service.setMockError('notFound', true);
      
      const payload: SampleDataPayload = {
        CustNum: 1001,
        CustTypeCode: 'A',
        CandyLiker: true
      };
      
      try {
        await service.updateSampleData(payload);
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiResponseError);
      }
    });

    it('should throw 400 Bad Request when simulateBadRequest is enabled', async () => {
      service.setMockError('badRequest', true);
      
      const payload: SampleDataPayload = {
        CustNum: 1001,
        CustTypeCode: 'A',
        CandyLiker: true
      };
      
      try {
        await service.updateSampleData(payload);
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiResponseError);
      }
    });

    it('should handle edge case of partial payload with missing CandyLiker', async () => {
      const payload: SampleDataPayload = {
        CustNum: 1001,
        CustTypeCode: 'B',
        CandyLiker: undefined as any
      };
      
      const result = await service.updateSampleData(payload);
      
      expect(result.CustNumber).toBe(1001);
      expect(result.CandyLiker).toBeUndefined();
    });

    it('should simulate 600ms delay', async () => {
      const startTime = Date.now();
      
      const payload: SampleDataPayload = {
        CustNum: 1001,
        CustTypeCode: 'A',
        CandyLiker: true
      };
      
      await service.updateSampleData(payload);
      const duration = Date.now() - startTime;
      
      expect(duration).toBeGreaterThanOrEqual(600);
    });
  });

  describe('deleteSampleData', () => {
    it('should delete customer from MOCK_SAMPLE_DATA', async () => {
      const initialLength = (service as any).MOCK_SAMPLE_DATA.length;
      
      await service.deleteSampleData(1001);
      
      const newLength = (service as any).MOCK_SAMPLE_DATA.length;
      expect(newLength).toBe(initialLength - 1);
      
      const deleted = (service as any).MOCK_SAMPLE_DATA.find((c: SampleData) => c.CustNumber === 1001);
      expect(deleted).toBeUndefined();
    });

    it('should not throw error for valid customer ID', async () => {
      await expectAsync(service.deleteSampleData(1002)).toBeResolved();
    });

    it('should throw 404 for non-existent customer ID', async () => {
      try {
        await service.deleteSampleData(9999);
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiResponseError);
        expect((error as ApiResponseError).validationErrors[0].errDesc).toBe('Customer record not found');
      }
    });

    it('should throw 404 when simulateNotFound is enabled', async () => {
      service.setMockError('notFound', true);
      
      try {
        await service.deleteSampleData(1001);
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiResponseError);
      }
    });

    it('should throw 500 when simulateServerError is enabled', async () => {
      service.setMockError('serverError', true);
      
      try {
        await service.deleteSampleData(1001);
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiResponseError);
        expect((error as ApiResponseError).validationErrors[0].errDesc).toBe('Internal server error occurred');
      }
    });

    it('should handle edge case of null ID', async () => {
      try {
        await service.deleteSampleData(null as any);
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiResponseError);
      }
    });

    it('should handle edge case of undefined ID', async () => {
      try {
        await service.deleteSampleData(undefined as any);
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiResponseError);
      }
    });

    it('should simulate 600ms delay', async () => {
      const startTime = Date.now();
      
      await service.deleteSampleData(1008);
      const duration = Date.now() - startTime;
      
      expect(duration).toBeGreaterThanOrEqual(600);
    });
  });

  describe('Mock Error Configuration', () => {
    it('should set notFound error flag', () => {
      service.setMockError('notFound', true);
      expect((service as any).mockErrorConfig.simulateNotFound).toBe(true);
      
      service.setMockError('notFound', false);
      expect((service as any).mockErrorConfig.simulateNotFound).toBe(false);
    });

    it('should set conflict error flag', () => {
      service.setMockError('conflict', true);
      expect((service as any).mockErrorConfig.simulateConflict).toBe(true);
    });

    it('should set badRequest error flag', () => {
      service.setMockError('badRequest', true);
      expect((service as any).mockErrorConfig.simulateBadRequest).toBe(true);
    });

    it('should set serverError flag', () => {
      service.setMockError('serverError', true);
      expect((service as any).mockErrorConfig.simulateServerError).toBe(true);
    });

    it('should reset all mock errors', () => {
      service.setMockError('notFound', true);
      service.setMockError('conflict', true);
      service.setMockError('badRequest', true);
      service.setMockError('serverError', true);
      
      service.resetMockErrors();
      
      expect((service as any).mockErrorConfig.simulateNotFound).toBe(false);
      expect((service as any).mockErrorConfig.simulateConflict).toBe(false);
      expect((service as any).mockErrorConfig.simulateBadRequest).toBe(false);
      expect((service as any).mockErrorConfig.simulateServerError).toBe(false);
    });
  });

  describe('Real API Mode', () => {
    let httpMock: HttpTestingController;
    const apiBaseUrl = environment.apiBaseUrl;

    beforeEach(() => {
      httpMock = TestBed.inject(HttpTestingController);
      // Switch to real API mode
      environment.useMockSampleData = false;
    });

    afterEach(() => {
      httpMock.verify(); // Verify no outstanding requests
      environment.useMockSampleData = true;
    });

    describe('loadAllSampleData', () => {
      it('should load all customers via HTTP GET', async () => {
        const mockResponse = {
          success: true,
          data: MOCK_CUSTOMERS
        };

        const promise = service.loadAllSampleData();
        
        const req = httpMock.expectOne(`${apiBaseUrl}SampleData`);
        expect(req.request.method).toBe('GET');
        req.flush(mockResponse);

        const result = await promise;
        expect(result).toEqual(MOCK_CUSTOMERS);
      });

      it('should throw ApiResponseError when response has validation errors', async () => {
        const mockResponse = {
          success: false,
          validationErrors: [{ errDesc: 'Failed to load data' }]
        };

        const promise = service.loadAllSampleData();
        
        const req = httpMock.expectOne(`${apiBaseUrl}SampleData`);
        req.flush(mockResponse);

        try {
          await promise;
          fail('Expected error to be thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(ApiResponseError);
          expect((error as ApiResponseError).validationErrors[0].errDesc).toBe('Failed to load data');
        }
      });

      it('should throw generic error when response fails without validation errors', async () => {
        const mockResponse = {
          success: false
        };

        const promise = service.loadAllSampleData();
        
        const req = httpMock.expectOne(`${apiBaseUrl}SampleData`);
        req.flush(mockResponse);

        try {
          await promise;
          fail('Expected error to be thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
          expect((error as Error).message).toContain('Failed to load sample data');
        }
      });
    });

    describe('getSampleDataById', () => {
      it('should load customer by ID via HTTP GET', async () => {
        const mockCustomer = MOCK_CUSTOMERS[0];
        const mockResponse = {
          success: true,
          data: mockCustomer
        };

        const promise = service.getSampleDataById(1001);
        
        const req = httpMock.expectOne(`${apiBaseUrl}SampleData/1001`);
        expect(req.request.method).toBe('GET');
        req.flush(mockResponse);

        const result = await promise;
        expect(result).toEqual(mockCustomer);
      });

      it('should throw ApiResponseError when customer not found with validation errors', async () => {
        const mockResponse = {
          success: false,
          validationErrors: [{ errDesc: 'Customer not found' }]
        };

        const promise = service.getSampleDataById(9999);
        
        const req = httpMock.expectOne(`${apiBaseUrl}SampleData/9999`);
        req.flush(mockResponse);

        try {
          await promise;
          fail('Expected error to be thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(ApiResponseError);
          expect((error as ApiResponseError).validationErrors[0].errDesc).toBe('Customer not found');
        }
      });

      it('should throw generic error when fails without validation errors', async () => {
        const mockResponse = {
          success: false
        };

        const promise = service.getSampleDataById(1001);
        
        const req = httpMock.expectOne(`${apiBaseUrl}SampleData/1001`);
        req.flush(mockResponse);

        try {
          await promise;
          fail('Expected error to be thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
          expect((error as Error).message).toContain('Failed to retrieve customer data');
        }
      });
    });

    describe('loadUDCOptions', () => {
      it('should load UDC options via HTTP GET when not cached', async () => {
        const mockResponse = {
          success: true,
          data: MOCK_UDC_OPTIONS
        };

        const promise = service.loadUDCOptions('55', 'SP');
        
        const req = httpMock.expectOne(`${apiBaseUrl}SampleData/udc/55/SP`);
        expect(req.request.method).toBe('GET');
        req.flush(mockResponse);

        const result = await promise;
        expect(result).toEqual(MOCK_UDC_OPTIONS);
        expect(service.udcOptions()).toEqual(MOCK_UDC_OPTIONS);
        
        // Verify cached to localStorage
        const cached = JSON.parse(localStorage.getItem('sampleData_udcOptions')!);
        expect(cached).toEqual(MOCK_UDC_OPTIONS);
      });

      it('should use cached UDC options from localStorage', async () => {
        const cachedOptions: UDCOption[] = [
          { TypeCodeList: 'X', TypeDescList: 'Cached Type' }
        ];
        localStorage.setItem('sampleData_udcOptions', JSON.stringify(cachedOptions));

        const result = await service.loadUDCOptions();

        // No HTTP request should be made
        httpMock.expectNone(`${apiBaseUrl}SampleData/udc/55/SP`);
        
        expect(result).toEqual(cachedOptions);
        expect(service.udcOptions()).toEqual(cachedOptions);
      });

      it('should fetch from API when cached value is empty array', async () => {
        localStorage.setItem('sampleData_udcOptions', '[]');
        
        const mockResponse = {
          success: true,
          data: MOCK_UDC_OPTIONS
        };

        const promise = service.loadUDCOptions();
        
        const req = httpMock.expectOne(`${apiBaseUrl}SampleData/udc/55/SP`);
        req.flush(mockResponse);

        const result = await promise;
        expect(result).toEqual(MOCK_UDC_OPTIONS);
      });

      it('should throw ApiResponseError when loading UDC options fails with validation errors', async () => {
        const mockResponse = {
          success: false,
          validationErrors: [{ errDesc: 'UDC options not available' }]
        };

        const promise = service.loadUDCOptions();
        
        const req = httpMock.expectOne(`${apiBaseUrl}SampleData/udc/55/SP`);
        req.flush(mockResponse);

        try {
          await promise;
          fail('Expected error to be thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(ApiResponseError);
          expect((error as ApiResponseError).validationErrors[0].errDesc).toBe('UDC options not available');
        }
      });

      it('should throw generic error when fails without validation errors', async () => {
        const mockResponse = {
          success: false
        };

        const promise = service.loadUDCOptions();
        
        const req = httpMock.expectOne(`${apiBaseUrl}SampleData/udc/55/SP`);
        req.flush(mockResponse);

        try {
          await promise;
          fail('Expected error to be thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
          expect((error as Error).message).toContain('Failed to load UDC options');
        }
      });
    });

    describe('createSampleData', () => {
      it('should create customer via HTTP POST', async () => {
        const payload: SampleDataPayload = {
          CustNum: null,
          CustTypeCode: 'A',
          CandyLiker: true
        };
        const newCustomer: SampleData = {
          CustNumber: 1009,
          CustName: 'New Customer',
          CustAddress: '123 New St',
          CustTypeCode: 'A',
          CustTypeDesc: 'Premium Customer',
          CandyLiker: true
        };
        const mockResponse = {
          success: true,
          data: newCustomer
        };

        const promise = service.createSampleData(payload);
        
        const req = httpMock.expectOne(`${apiBaseUrl}SampleData`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(payload);
        req.flush(mockResponse);

        const result = await promise;
        expect(result).toEqual(newCustomer);
      });

      it('should throw ApiResponseError when create fails with validation errors', async () => {
        const payload: SampleDataPayload = {
          CustNum: null,
          CustTypeCode: 'INVALID',
          CandyLiker: true
        };
        const mockResponse = {
          success: false,
          validationErrors: [
            { field: 'CustTypeCode', errDesc: 'Invalid customer type code' }
          ]
        };

        const promise = service.createSampleData(payload);
        
        const req = httpMock.expectOne(`${apiBaseUrl}SampleData`);
        req.flush(mockResponse);

        try {
          await promise;
          fail('Expected error to be thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(ApiResponseError);
          expect((error as ApiResponseError).validationErrors[0].errDesc).toBe('Invalid customer type code');
        }
      });

      it('should throw generic error when fails without validation errors', async () => {
        const payload: SampleDataPayload = {
          CustNum: null,
          CustTypeCode: 'A',
          CandyLiker: true
        };
        const mockResponse = {
          success: false
        };

        const promise = service.createSampleData(payload);
        
        const req = httpMock.expectOne(`${apiBaseUrl}SampleData`);
        req.flush(mockResponse);

        try {
          await promise;
          fail('Expected error to be thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
          expect((error as Error).message).toContain('Failed to create customer record');
        }
      });
    });

    describe('updateSampleData', () => {
      it('should update customer via HTTP PUT', async () => {
        const payload: SampleDataPayload = {
          CustNum: 1001,
          CustTypeCode: 'B',
          CandyLiker: false
        };
        const updatedCustomer: SampleData = {
          ...MOCK_CUSTOMERS[0],
          CustTypeCode: 'B',
          CustTypeDesc: 'Standard Customer',
          CandyLiker: false
        };
        const mockResponse = {
          success: true,
          data: updatedCustomer
        };

        const promise = service.updateSampleData(payload);
        
        const req = httpMock.expectOne(`${apiBaseUrl}SampleData`);
        expect(req.request.method).toBe('PUT');
        expect(req.request.body).toEqual(payload);
        req.flush(mockResponse);

        const result = await promise;
        expect(result).toEqual(updatedCustomer);
      });

      it('should throw ApiResponseError when update fails with validation errors', async () => {
        const payload: SampleDataPayload = {
          CustNum: 1001,
          CustTypeCode: 'INVALID',
          CandyLiker: true
        };
        const mockResponse = {
          success: false,
          validationErrors: [
            { field: 'CustTypeCode', errDesc: 'Invalid customer type code' }
          ]
        };

        const promise = service.updateSampleData(payload);
        
        const req = httpMock.expectOne(`${apiBaseUrl}SampleData`);
        req.flush(mockResponse);

        try {
          await promise;
          fail('Expected error to be thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(ApiResponseError);
          expect((error as ApiResponseError).validationErrors[0].errDesc).toBe('Invalid customer type code');
        }
      });

      it('should throw generic error when fails without validation errors', async () => {
        const payload: SampleDataPayload = {
          CustNum: 1001,
          CustTypeCode: 'A',
          CandyLiker: true
        };
        const mockResponse = {
          success: false
        };

        const promise = service.updateSampleData(payload);
        
        const req = httpMock.expectOne(`${apiBaseUrl}SampleData`);
        req.flush(mockResponse);

        try {
          await promise;
          fail('Expected error to be thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
          expect((error as Error).message).toContain('Failed to update customer record');
        }
      });
    });

    describe('deleteSampleData', () => {
      it('should delete customer via HTTP DELETE', async () => {
        const mockResponse = {
          success: true,
          data: null
        };

        const promise = service.deleteSampleData(1008);
        
        const req = httpMock.expectOne(`${apiBaseUrl}SampleData/1008`);
        expect(req.request.method).toBe('DELETE');
        req.flush(mockResponse);

        await promise;
        expect().nothing(); // Just verify no error thrown
      });

      it('should throw ApiResponseError when delete fails with validation errors', async () => {
        const mockResponse = {
          success: false,
          validationErrors: [{ errDesc: 'Customer not found' }]
        };

        const promise = service.deleteSampleData(9999);
        
        const req = httpMock.expectOne(`${apiBaseUrl}SampleData/9999`);
        req.flush(mockResponse);

        try {
          await promise;
          fail('Expected error to be thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(ApiResponseError);
          expect((error as ApiResponseError).validationErrors[0].errDesc).toBe('Customer not found');
        }
      });

      it('should throw generic error when fails without validation errors', async () => {
        const mockResponse = {
          success: false
        };

        const promise = service.deleteSampleData(1001);
        
        const req = httpMock.expectOne(`${apiBaseUrl}SampleData/1001`);
        req.flush(mockResponse);

        try {
          await promise;
          fail('Expected error to be thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
          expect((error as Error).message).toContain('Failed to delete customer record');
        }
      });
    });
  });

  describe('Constructor Effect Edge Cases', () => {
    it('should save UDC options to localStorage when loaded', (done) => {
      const setItemSpy = spyOn(localStorage, 'setItem');
      
      // Load UDC options which triggers the effect
      service.loadUDCOptions().then(() => {
        // Wait for effect to run
        setTimeout(() => {
          expect(setItemSpy).toHaveBeenCalledWith(
            'sampleData_udcOptions',
            jasmine.any(String)
          );
          const savedData = JSON.parse(setItemSpy.calls.mostRecent().args[1]);
          expect(savedData.length).toBeGreaterThan(0);
          done();
        }, 50);
      });
    });
  });
});
