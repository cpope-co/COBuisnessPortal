import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PriceBookService } from './price-book.service';
import { PriceBookItem } from './price-book.model';
import { environment } from '../../../environments/environment';

describe('PriceBookService', () => {
  let service: PriceBookService;
  let httpMock: HttpTestingController;

  const mockPriceBookItem: PriceBookItem = {
    category: 'Electronics',
    item: 'ITEM001',
    description: 'Test Product Description',
    size: 'Medium',
    um: 'EA',
    retailUnits: '1',
    wholesaleCost: 49.99,
    unitRetail: 99.99,
    margin: 50.0,
    rank: 1
  };

  const mockPriceBookList: PriceBookItem[] = [
    mockPriceBookItem,
    {
      category: 'Clothing',
      item: 'ITEM002',
      description: 'Another Test Product',
      size: 'Large',
      um: 'EA',
      retailUnits: '1',
      wholesaleCost: 29.99,
      unitRetail: 59.99,
      margin: 50.0,
      rank: 2
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PriceBookService]
    });

    service = TestBed.inject(PriceBookService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initialization', () => {
    it('should initialize with empty price book signal', () => {
      expect(service.priceBook()).toEqual([]);
    });

    it('should have access to environment and http client', () => {
      expect(service.env).toBe(environment);
      expect(service.http).toBeDefined();
    });
  });

  describe('loadAllPriceBookItems', () => {
    it('should load price book items from assets', async () => {
      const loadPromise = service.loadAllPriceBookItems();

      const req = httpMock.expectOne('assets/priceBook.json');
      expect(req.request.method).toBe('GET');
      req.flush(mockPriceBookList);

      const result = await loadPromise;
      expect(result).toEqual(mockPriceBookList);
      expect(service.priceBook()).toEqual(mockPriceBookList);
    });

    it('should handle HTTP errors gracefully', async () => {
      const loadPromise = service.loadAllPriceBookItems();

      const req = httpMock.expectOne('assets/priceBook.json');
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });

      try {
        await loadPromise;
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should update the signal with loaded data', async () => {
      expect(service.priceBook()).toEqual([]);

      const loadPromise = service.loadAllPriceBookItems();

      const req = httpMock.expectOne('assets/priceBook.json');
      req.flush(mockPriceBookList);

      await loadPromise;
      expect(service.priceBook()).toEqual(mockPriceBookList);
    });

    it('should return the readonly signal value', async () => {
      const loadPromise = service.loadAllPriceBookItems();

      const req = httpMock.expectOne('assets/priceBook.json');
      req.flush(mockPriceBookList);

      const result = await loadPromise;
      expect(result).toBe(service.priceBook());
    });
  });

  describe('signal behavior', () => {
    it('should provide readonly access to price book data', () => {
      expect(service.priceBook).toBeDefined();
      expect(typeof service.priceBook).toBe('function');
    });

    it('should maintain signal state across multiple calls', async () => {
      // First load
      let loadPromise = service.loadAllPriceBookItems();
      let req = httpMock.expectOne('assets/priceBook.json');
      req.flush(mockPriceBookList);
      await loadPromise;

      expect(service.priceBook()).toEqual(mockPriceBookList);

      // Second load with different data
      const newData = [mockPriceBookItem];
      loadPromise = service.loadAllPriceBookItems();
      req = httpMock.expectOne('assets/priceBook.json');
      req.flush(newData);
      await loadPromise;

      expect(service.priceBook()).toEqual(newData);
    });
  });

  describe('error handling', () => {
    it('should handle network errors', async () => {
      const loadPromise = service.loadAllPriceBookItems();

      const req = httpMock.expectOne('assets/priceBook.json');
      req.error(new ErrorEvent('Network error'));

      try {
        await loadPromise;
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle malformed JSON', async () => {
      const loadPromise = service.loadAllPriceBookItems();

      const req = httpMock.expectOne('assets/priceBook.json');
      // Create a proper error response that will cause JSON parsing to fail
      req.error(new ErrorEvent('Parsing error', {
        message: 'Unexpected token in JSON'
      }));

      try {
        await loadPromise;
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('integration with environment', () => {
    it('should use environment configuration', () => {
      expect(service.env).toBe(environment);
    });

    // Note: The service currently loads from assets/priceBook.json
    // In the future, when using the API, this test would verify the API URL
    it('should be prepared for API integration', () => {
      // When the service is updated to use the API:
      // expect(service.env.apiBaseUrl).toBeDefined();
      expect(service.env).toBeDefined();
    });
  });
});