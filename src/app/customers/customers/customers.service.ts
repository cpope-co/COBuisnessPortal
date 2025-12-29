import { effect, inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { apiResponse } from '../../models/response.model';
import { ApiResponseError } from '../../shared/api-response-error';
import { SKIP_REFRESH_KEY } from '../../shared/http-context-keys';
import { SampleData, SampleDataPayload, UDCOption } from './customer.model';

@Injectable({
  providedIn: 'root',
})
export class SampleApplicationService {
  env = environment;
  http = inject(HttpClient);

  // Private signal for UDC options with localStorage caching
  #udcOptionsSignal = signal<UDCOption[]>([]);
  
  // Public readonly signal for UDC options
  udcOptions = this.#udcOptionsSignal.asReadonly();

  constructor() {
    // Auto-save UDC options to localStorage when signal changes
    effect(() => {
      const options = this.udcOptions();
      if (options && options.length > 0) {
        localStorage.setItem('sampleData_udcOptions', JSON.stringify(options));
      }
    });
  }

  // ========== MOCK DATA FOR DEMO MODE ==========
  
  /**
   * Mock UDC options for customer type dropdown
   */
  private readonly MOCK_UDC_OPTIONS: UDCOption[] = [
    { TypeCodeList: 'A', TypeDescList: 'Premium Customer' },
    { TypeCodeList: 'B', TypeDescList: 'Standard Customer' },
    { TypeCodeList: 'C', TypeDescList: 'Budget Customer' },
    { TypeCodeList: 'D', TypeDescList: 'Wholesale Customer' }
  ];

  /**
   * Mock sample data records
   */
  private MOCK_SAMPLE_DATA: SampleData[] = [
    {
      CustNumber: 1001,
      CustName: 'Acme Corporation',
      CustAddress: '123 Main St, Springfield, IL 62701',
      CustTypeCode: 'A',
      CustTypeDesc: 'Premium Customer',
      CandyLiker: true
    },
    {
      CustNumber: 1002,
      CustName: 'Global Industries LLC',
      CustAddress: '456 Oak Ave, Chicago, IL 60601',
      CustTypeCode: 'B',
      CustTypeDesc: 'Standard Customer',
      CandyLiker: false
    },
    {
      CustNumber: 1003,
      CustName: 'Tech Solutions Inc',
      CustAddress: '789 Pine Rd, Austin, TX 78701',
      CustTypeCode: 'A',
      CustTypeDesc: 'Premium Customer',
      CandyLiker: true
    },
    {
      CustNumber: 1004,
      CustName: 'Smith & Associates',
      CustAddress: '321 Elm St, Boston, MA 02101',
      CustTypeCode: 'C',
      CustTypeDesc: 'Budget Customer',
      CandyLiker: true
    },
    {
      CustNumber: 1005,
      CustName: 'Johnson Wholesale',
      CustAddress: '654 Maple Dr, Seattle, WA 98101',
      CustTypeCode: 'D',
      CustTypeDesc: 'Wholesale Customer',
      CandyLiker: false
    },
    {
      CustNumber: 1006,
      CustName: 'Metro Retail Group',
      CustAddress: '987 Broadway, New York, NY 10001',
      CustTypeCode: 'B',
      CustTypeDesc: 'Standard Customer',
      CandyLiker: true
    },
    {
      CustNumber: 1007,
      CustName: 'West Coast Distributors',
      CustAddress: '147 Beach Blvd, Los Angeles, CA 90001',
      CustTypeCode: 'D',
      CustTypeDesc: 'Wholesale Customer',
      CandyLiker: false
    },
    {
      CustNumber: 1008,
      CustName: 'Mountain View Partners',
      CustAddress: '258 Summit Ave, Denver, CO 80201',
      CustTypeCode: 'A',
      CustTypeDesc: 'Premium Customer',
      CandyLiker: true
    }
  ];

  /**
   * Error simulation configuration
   * Set these to true to simulate specific errors in mock mode
   */
  private mockErrorConfig = {
    simulateNotFound: false,      // 404
    simulateConflict: false,       // 409
    simulateBadRequest: false,     // 400
    simulateServerError: false     // 500
  };

  /**
   * Simulates network delay for realistic mock behavior
   */
  private async simulateDelay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Helper to simulate error responses
   */
  private throwMockError(errorType: 'notFound' | 'conflict' | 'badRequest' | 'serverError'): void {
    const errorMessages = {
      notFound: [{ errDesc: 'Customer record not found' }],
      conflict: [{ errDesc: 'Customer record already exists' }],
      badRequest: [
        { field: 'CustTypeCode', errDesc: 'Invalid customer type code' },
        { field: 'CandyLiker', errDesc: 'Invalid boolean value' }
      ],
      serverError: [{ errDesc: 'Internal server error occurred' }]
    };
    throw new ApiResponseError('Mock error simulation', errorMessages[errorType]);
  }

  /**
   * Retrieve data for all Active Customers where Sch Type C
   * GET /SampleData
   * @returns Promise<SampleData[]> - All customers with their data
   */
  async loadAllSampleData(): Promise<SampleData[]> {
    // Mock mode
    if (this.env.useMockSampleData) {
      await this.simulateDelay();
      if (this.mockErrorConfig.simulateServerError) {
        this.throwMockError('serverError');
      }
      return [...this.MOCK_SAMPLE_DATA];
    }

    // Real API call
    const context = new HttpContext().set(SKIP_REFRESH_KEY, true);
    const sampleData$ = this.http.get<apiResponse>(
      `${this.env.apiBaseUrl}SampleData`,
      { context }
    );
    const response = await firstValueFrom(sampleData$);

    if (!response.success) {
      if (response.validationErrors && response.validationErrors.length > 0) {
        throw new ApiResponseError('Validation errors', response.validationErrors || []);
      } else {
        throw new Error('Failed to load sample data without specific validation errors.');
      }
    }

    return response.data as SampleData[];
  }

  /**
   * Retrieve data for 1 specified customer
   * GET /SampleData/{CustNumber}
   * @param custNumber - Customer number to retrieve
   * @returns Promise<SampleData> - Single customer data
   */
  async getSampleDataById(custNumber: number): Promise<SampleData> {
    // Mock mode
    if (this.env.useMockSampleData) {
      await this.simulateDelay();
      if (this.mockErrorConfig.simulateNotFound) {
        this.throwMockError('notFound');
      }
      const found = this.MOCK_SAMPLE_DATA.find(d => d.CustNumber === custNumber);
      if (!found) {
        this.throwMockError('notFound');
      }
      return { ...found! };
    }

    // Real API call
    const context = new HttpContext().set(SKIP_REFRESH_KEY, true);
    const sampleData$ = this.http.get<apiResponse>(
      `${this.env.apiBaseUrl}SampleData/${custNumber}`,
      { context }
    );
    const response = await firstValueFrom(sampleData$);

    if (!response.success) {
      if (response.validationErrors && response.validationErrors.length > 0) {
        throw new ApiResponseError('Validation errors', response.validationErrors || []);
      } else {
        throw new Error('Failed to retrieve customer data without specific validation errors.');
      }
    }

    return response.data as SampleData;
  }

  /**
   * Retrieve Type code list/description for Option dropdown
   * GET /SampleData/udc/{SysCode}/{UsrCode}
   * Uses localStorage caching to avoid repeated API calls
   * @param sysCode - System code (default: '55')
   * @param usrCode - User code (default: 'SP')
   * @returns Promise<UDCOption[]> - List of type codes and descriptions
   */
  async loadUDCOptions(sysCode: string = '55', usrCode: string = 'SP'): Promise<UDCOption[]> {
    // Mock mode
    if (this.env.useMockSampleData) {
      await this.simulateDelay(300);
      if (this.mockErrorConfig.simulateServerError) {
        this.throwMockError('serverError');
      }
      const options = [...this.MOCK_UDC_OPTIONS];
      this.#udcOptionsSignal.set(options);
      localStorage.setItem('sampleData_udcOptions', JSON.stringify(options));
      return options;
    }

    // Real API call with caching
    let cachedOptions = localStorage.getItem('sampleData_udcOptions');

    if (!cachedOptions || cachedOptions === '[]') {
      // Fetch from API
      const context = new HttpContext().set(SKIP_REFRESH_KEY, true);
      const udcOptions$ = this.http.get<apiResponse>(
        `${this.env.apiBaseUrl}SampleData/udc/${sysCode}/${usrCode}`,
        { context }
      );
      const response = await firstValueFrom(udcOptions$);

      if (!response.success) {
        if (response.validationErrors && response.validationErrors.length > 0) {
          throw new ApiResponseError('Validation errors', response.validationErrors || []);
        } else {
          throw new Error('Failed to load UDC options without specific validation errors.');
        }
      }

      const options = response.data as UDCOption[];
      this.#udcOptionsSignal.set(options);
      cachedOptions = JSON.stringify(options);
      localStorage.setItem('sampleData_udcOptions', cachedOptions);
    } else {
      // Use cached data and update signal
      const options = JSON.parse(cachedOptions) as UDCOption[];
      this.#udcOptionsSignal.set(options);
    }

    return JSON.parse(cachedOptions) as UDCOption[];
  }

  /**
   * Create Customer Options Record
   * POST /SampleData
   * @param payload - Customer data payload (CustNum should be null for create)
   * @returns Promise<SampleData> - Created customer data
   * @throws ApiResponseError - 400 (invalid data), 409 (record already exists)
   */
  async createSampleData(payload: SampleDataPayload): Promise<SampleData> {
    // Mock mode
    if (this.env.useMockSampleData) {
      await this.simulateDelay(600);
      
      if (this.mockErrorConfig.simulateBadRequest) {
        this.throwMockError('badRequest');
      }
      if (this.mockErrorConfig.simulateConflict) {
        this.throwMockError('conflict');
      }
      if (this.mockErrorConfig.simulateServerError) {
        this.throwMockError('serverError');
      }

      // Generate new customer number
      const maxCustNum = Math.max(...this.MOCK_SAMPLE_DATA.map(d => d.CustNumber), 1000);
      const newCustNumber = maxCustNum + 1;

      // Find type description
      const typeDesc = this.MOCK_UDC_OPTIONS.find(
        opt => opt.TypeCodeList === payload.CustTypeCode
      )?.TypeDescList || '';

      const newRecord: SampleData = {
        CustNumber: newCustNumber,
        CustName: `New Customer ${newCustNumber}`,
        CustAddress: '999 New Street, City, ST 12345',
        CustTypeCode: payload.CustTypeCode,
        CustTypeDesc: typeDesc,
        CandyLiker: payload.CandyLiker
      };

      this.MOCK_SAMPLE_DATA.push(newRecord);
      return { ...newRecord };
    }

    // Real API call
    const context = new HttpContext().set(SKIP_REFRESH_KEY, true);
    const create$ = this.http.post<apiResponse>(
      `${this.env.apiBaseUrl}SampleData`,
      payload,
      { context }
    );
    const response = await firstValueFrom(create$);

    if (!response.success) {
      if (response.validationErrors && response.validationErrors.length > 0) {
        throw new ApiResponseError('Validation errors', response.validationErrors || []);
      } else {
        throw new Error('Failed to create customer record without specific validation errors.');
      }
    }

    return response.data as SampleData;
  }

  /**
   * Update Customer Options Record
   * PUT /SampleData
   * @param payload - Customer data payload (CustNum must exist)
   * @returns Promise<SampleData> - Updated customer data
   * @throws ApiResponseError - 400 (invalid data), 404 (not found)
   */
  async updateSampleData(payload: SampleDataPayload): Promise<SampleData> {
    // Mock mode
    if (this.env.useMockSampleData) {
      await this.simulateDelay(600);
      
      if (this.mockErrorConfig.simulateBadRequest) {
        this.throwMockError('badRequest');
      }
      if (this.mockErrorConfig.simulateNotFound) {
        this.throwMockError('notFound');
      }
      if (this.mockErrorConfig.simulateServerError) {
        this.throwMockError('serverError');
      }

      const index = this.MOCK_SAMPLE_DATA.findIndex(d => d.CustNumber === payload.CustNum);
      if (index === -1) {
        this.throwMockError('notFound');
      }

      // Find type description
      const typeDesc = this.MOCK_UDC_OPTIONS.find(
        opt => opt.TypeCodeList === payload.CustTypeCode
      )?.TypeDescList || '';

      const updated: SampleData = {
        ...this.MOCK_SAMPLE_DATA[index],
        CustTypeCode: payload.CustTypeCode,
        CustTypeDesc: typeDesc,
        CandyLiker: payload.CandyLiker
      };

      this.MOCK_SAMPLE_DATA[index] = updated;
      return { ...updated };
    }

    // Real API call
    const context = new HttpContext().set(SKIP_REFRESH_KEY, true);
    const update$ = this.http.put<apiResponse>(
      `${this.env.apiBaseUrl}SampleData`,
      payload,
      { context }
    );
    const response = await firstValueFrom(update$);

    if (!response.success) {
      if (response.validationErrors && response.validationErrors.length > 0) {
        throw new ApiResponseError('Validation errors', response.validationErrors || []);
      } else {
        throw new Error('Failed to update customer record without specific validation errors.');
      }
    }

    return response.data as SampleData;
  }

  /**
   * Delete Customer Options Record
   * DELETE /SampleData/{CustNum}
   * @param custNum - Customer number to delete
   * @returns Promise<void>
   * @throws ApiResponseError - 404 (not found)
   */
  async deleteSampleData(custNum: number): Promise<void> {
    // Mock mode
    if (this.env.useMockSampleData) {
      await this.simulateDelay(600);
      
      if (this.mockErrorConfig.simulateNotFound) {
        this.throwMockError('notFound');
      }
      if (this.mockErrorConfig.simulateServerError) {
        this.throwMockError('serverError');
      }

      const index = this.MOCK_SAMPLE_DATA.findIndex(d => d.CustNumber === custNum);
      if (index === -1) {
        this.throwMockError('notFound');
      }

      this.MOCK_SAMPLE_DATA.splice(index, 1);
      return;
    }

    // Real API call
    const context = new HttpContext().set(SKIP_REFRESH_KEY, true);
    const delete$ = this.http.delete<apiResponse>(
      `${this.env.apiBaseUrl}SampleData/${custNum}`,
      { context }
    );
    const response = await firstValueFrom(delete$);

    if (!response.success) {
      if (response.validationErrors && response.validationErrors.length > 0) {
        throw new ApiResponseError('Validation errors', response.validationErrors || []);
      } else {
        throw new Error('Failed to delete customer record without specific validation errors.');
      }
    }
  }

  /**
   * Enable/disable specific mock error simulations for testing
   */
  setMockError(errorType: 'notFound' | 'conflict' | 'badRequest' | 'serverError', enabled: boolean): void {
    switch (errorType) {
      case 'notFound':
        this.mockErrorConfig.simulateNotFound = enabled;
        break;
      case 'conflict':
        this.mockErrorConfig.simulateConflict = enabled;
        break;
      case 'badRequest':
        this.mockErrorConfig.simulateBadRequest = enabled;
        break;
      case 'serverError':
        this.mockErrorConfig.simulateServerError = enabled;
        break;
    }
  }

  /**
   * Reset all mock error simulations
   */
  resetMockErrors(): void {
    this.mockErrorConfig = {
      simulateNotFound: false,
      simulateConflict: false,
      simulateBadRequest: false,
      simulateServerError: false
    };
  }
}
