import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProductCatalogService } from './product-catalog.service';
import { Product } from '../../models/product.model';

describe('ProductCatalogService', () => {
  let service: ProductCatalogService;
  let httpTestingController: HttpTestingController;

  const mockProducts: Product[] = [
    {
      SKU: 1,
      manufacturerSKU: 100,
      categoryID: 1,
      description: 'Test Product 1',
      size: 'Medium',
      unitOfMeasurement: 1,
      supplierID: 1,
      cost: 10.99,
      UPCCodes: [{ retailUPC: '123456789', wholesaleUPC: '987654321' }]
    },
    {
      SKU: 2,
      manufacturerSKU: 200,
      categoryID: 2,
      description: 'Test Product 2',
      size: 'Large',
      unitOfMeasurement: 2,
      supplierID: 2,
      cost: 20.99,
      UPCCodes: [{ retailUPC: '111222333', wholesaleUPC: '444555666' }]
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductCatalogService]
    });
    service = TestBed.inject(ProductCatalogService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  describe('Service Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should have environment reference', () => {
      expect(service.env).toBeDefined();
    });

    it('should have http client injected', () => {
      expect(service.http).toBeDefined();
    });

    it('should initialize with empty product catalog signal', () => {
      expect(service.productCatalogSignal()).toEqual([]);
    });

    it('should have readonly product catalog accessor', () => {
      expect(service.productCatalog).toBeDefined();
      expect(service.productCatalog()).toEqual([]);
    });
  });

  describe('loadAllProducts', () => {
    it('should load products from assets/product.json', async () => {
      const loadPromise = service.loadAllProducts();

      const req = httpTestingController.expectOne('assets/product.json');
      expect(req.request.method).toBe('GET');
      req.flush(mockProducts);

      const result = await loadPromise;
      expect(result).toEqual(mockProducts);
    });

    it('should update productCatalogSignal with loaded products', async () => {
      const loadPromise = service.loadAllProducts();

      const req = httpTestingController.expectOne('assets/product.json');
      req.flush(mockProducts);

      await loadPromise;
      expect(service.productCatalogSignal()).toEqual(mockProducts);
    });

    it('should return readonly product catalog after loading', async () => {
      const loadPromise = service.loadAllProducts();

      const req = httpTestingController.expectOne('assets/product.json');
      req.flush(mockProducts);

      const result = await loadPromise;
      expect(result).toBe(service.productCatalog());
    });

    it('should handle empty product array', async () => {
      const loadPromise = service.loadAllProducts();

      const req = httpTestingController.expectOne('assets/product.json');
      req.flush([]);

      const result = await loadPromise;
      expect(result).toEqual([]);
      expect(service.productCatalogSignal()).toEqual([]);
    });

    it('should handle HTTP errors', async () => {
      const loadPromise = service.loadAllProducts();

      const req = httpTestingController.expectOne('assets/product.json');
      req.error(new ErrorEvent('Network error'));

      try {
        await loadPromise;
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeTruthy();
      }
    });

    it('should handle HTTP error responses', async () => {
      const loadPromise = service.loadAllProducts();

      const req = httpTestingController.expectOne('assets/product.json');
      req.flush('Error loading products', { status: 500, statusText: 'Internal Server Error' });

      try {
        await loadPromise;
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeTruthy();
      }
    });
  });

  describe('Signal Management', () => {
    it('should maintain signal consistency between productCatalogSignal and productCatalog', async () => {
      const loadPromise = service.loadAllProducts();

      const req = httpTestingController.expectOne('assets/product.json');
      req.flush(mockProducts);

      await loadPromise;
      
      expect(service.productCatalogSignal()).toBe(service.productCatalog());
    });

    it('should allow direct signal updates', () => {
      const testProducts = [mockProducts[0]];
      service.productCatalogSignal.set(testProducts);
      
      expect(service.productCatalog()).toEqual(testProducts);
    });

    it('should preserve signal reactivity', () => {
      let signalValue: Product[] = [];
      
      // Simulate a reactive context
      const effect = () => {
        signalValue = service.productCatalog();
      };
      
      effect(); // Initial call
      expect(signalValue).toEqual([]);
      
      service.productCatalogSignal.set(mockProducts);
      effect(); // Simulate effect re-run
      expect(signalValue).toEqual(mockProducts);
    });
  });

  describe('Multiple API Calls', () => {
    it('should handle multiple consecutive loadAllProducts calls', async () => {
      const firstLoadPromise = service.loadAllProducts();
      const secondLoadPromise = service.loadAllProducts();

      // Should have two pending requests
      const reqs = httpTestingController.match('assets/product.json');
      expect(reqs.length).toBe(2);

      reqs[0].flush(mockProducts);
      reqs[1].flush([mockProducts[0]]);

      const firstResult = await firstLoadPromise;
      const secondResult = await secondLoadPromise;

      expect(firstResult).toEqual(mockProducts);
      expect(secondResult).toEqual([mockProducts[0]]);
      // Signal should have the result from the last completed request
      expect(service.productCatalogSignal()).toEqual([mockProducts[0]]);
    });

    it('should handle concurrent loadAllProducts calls', async () => {
      const promise1 = service.loadAllProducts();
      const promise2 = service.loadAllProducts();

      const reqs = httpTestingController.match('assets/product.json');
      expect(reqs.length).toBe(2);

      // Complete requests in reverse order
      reqs[1].flush([mockProducts[1]]);
      reqs[0].flush(mockProducts);

      const [result1, result2] = await Promise.all([promise1, promise2]);

      expect(result1).toEqual(mockProducts);
      expect(result2).toEqual([mockProducts[1]]);
    });
  });

  describe('Service Integration', () => {
    it('should work with firstValueFrom conversion', async () => {
      const loadPromise = service.loadAllProducts();

      const req = httpTestingController.expectOne('assets/product.json');
      req.flush(mockProducts);

      const result = await loadPromise;
      expect(result).toEqual(mockProducts);
    });

    it('should properly inject environment configuration', () => {
      expect(service.env).toBeDefined();
      expect(typeof service.env).toBe('object');
    });

    it('should be provided as singleton service', () => {
      const secondInstance = TestBed.inject(ProductCatalogService);
      expect(service).toBe(secondInstance);
    });
  });

  describe('Error Scenarios', () => {
    it('should handle 404 errors', async () => {
      const loadPromise = service.loadAllProducts();

      const req = httpTestingController.expectOne('assets/product.json');
      req.error(new ErrorEvent('Not Found'), { status: 404, statusText: 'Not Found' });

      try {
        await loadPromise;
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeTruthy();
      }
    });

    it('should handle 500 server errors', async () => {
      const loadPromise = service.loadAllProducts();

      const req = httpTestingController.expectOne('assets/product.json');
      req.error(new ErrorEvent('Server Error'), { status: 500, statusText: 'Internal Server Error' });

      try {
        await loadPromise;
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeTruthy();
      }
    });

    it('should handle timeout errors', async () => {
      const loadPromise = service.loadAllProducts();

      const req = httpTestingController.expectOne('assets/product.json');
      req.error(new ErrorEvent('Timeout'));

      try {
        await loadPromise;
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeTruthy();
      }
    });
  });

  describe('Data Validation', () => {
    it('should handle products with all required fields', async () => {
      const validProduct: Product = {
        SKU: 999,
        manufacturerSKU: 888,
        categoryID: 5,
        description: 'Valid Product',
        size: 'Small',
        unitOfMeasurement: 3,
        supplierID: 7,
        cost: 15.50,
        UPCCodes: [{ retailUPC: '999888777', wholesaleUPC: '666555444' }]
      };

      const loadPromise = service.loadAllProducts();

      const req = httpTestingController.expectOne('assets/product.json');
      req.flush([validProduct]);

      const result = await loadPromise;
      expect(result).toEqual([validProduct]);
      expect(service.productCatalogSignal()).toEqual([validProduct]);
    });

    it('should handle products with multiple UPC codes', async () => {
      const productWithMultipleUPCs: Product = {
        SKU: 123,
        manufacturerSKU: 456,
        categoryID: 1,
        description: 'Product with Multiple UPCs',
        size: 'Medium',
        unitOfMeasurement: 1,
        supplierID: 1,
        cost: 25.99,
        UPCCodes: [
          { retailUPC: '111111111', wholesaleUPC: '222222222' },
          { retailUPC: '333333333', wholesaleUPC: '444444444' },
          { retailUPC: '555555555', wholesaleUPC: '666666666' }
        ]
      };

      const loadPromise = service.loadAllProducts();

      const req = httpTestingController.expectOne('assets/product.json');
      req.flush([productWithMultipleUPCs]);

      const result = await loadPromise;
      expect(result[0].UPCCodes.length).toBe(3);
      expect(result[0].UPCCodes).toEqual(productWithMultipleUPCs.UPCCodes);
    });

    it('should handle large product datasets', async () => {
      const largeProductArray: Product[] = Array.from({ length: 1000 }, (_, index) => ({
        SKU: index + 1,
        manufacturerSKU: (index + 1) * 10,
        categoryID: (index % 5) + 1,
        description: `Product ${index + 1}`,
        size: ['Small', 'Medium', 'Large'][index % 3],
        unitOfMeasurement: (index % 3) + 1,
        supplierID: (index % 10) + 1,
        cost: Math.round((Math.random() * 100 + 10) * 100) / 100,
        UPCCodes: [{ retailUPC: `R${index}`, wholesaleUPC: `W${index}` }]
      }));

      const loadPromise = service.loadAllProducts();

      const req = httpTestingController.expectOne('assets/product.json');
      req.flush(largeProductArray);

      const result = await loadPromise;
      expect(result.length).toBe(1000);
      expect(service.productCatalogSignal().length).toBe(1000);
    });
  });
});
