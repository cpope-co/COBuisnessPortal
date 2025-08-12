import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProductCategoryService } from './product-category.service';
import { ProductCategory } from '../../models/product-category.model';

describe('ProductCategoryService', () => {
  let service: ProductCategoryService;
  let httpTestingController: HttpTestingController;

  const mockProductCategories: ProductCategory[] = [
    { id: '1', name: 'Electronics' },
    { id: '2', name: 'Clothing' },
    { id: '3', name: 'Books' },
    { id: '4', name: 'Home & Garden' },
    { id: '5', name: 'Sports & Outdoors' }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductCategoryService]
    });
    service = TestBed.inject(ProductCategoryService);
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

    it('should initialize with empty product category signal', () => {
      expect(service.productCategorySignal()).toEqual([]);
    });

    it('should have readonly product category accessor', () => {
      expect(service.productCategory).toBeDefined();
      expect(service.productCategory()).toEqual([]);
    });
  });

  describe('loadAllProductCategories', () => {
    it('should load product categories from assets/productCategory.json', async () => {
      const loadPromise = service.loadAllProductCategories();

      const req = httpTestingController.expectOne('assets/productCategory.json');
      expect(req.request.method).toBe('GET');
      req.flush(mockProductCategories);

      const result = await loadPromise;
      expect(result).toEqual(mockProductCategories);
    });

    it('should update productCategorySignal with loaded categories', async () => {
      const loadPromise = service.loadAllProductCategories();

      const req = httpTestingController.expectOne('assets/productCategory.json');
      req.flush(mockProductCategories);

      await loadPromise;
      expect(service.productCategorySignal()).toEqual(mockProductCategories);
    });

    it('should return readonly product category after loading', async () => {
      const loadPromise = service.loadAllProductCategories();

      const req = httpTestingController.expectOne('assets/productCategory.json');
      req.flush(mockProductCategories);

      const result = await loadPromise;
      expect(result).toBe(service.productCategory());
    });

    it('should handle empty category array', async () => {
      const loadPromise = service.loadAllProductCategories();

      const req = httpTestingController.expectOne('assets/productCategory.json');
      req.flush([]);

      const result = await loadPromise;
      expect(result).toEqual([]);
      expect(service.productCategorySignal()).toEqual([]);
    });

    it('should handle HTTP errors', async () => {
      const loadPromise = service.loadAllProductCategories();

      const req = httpTestingController.expectOne('assets/productCategory.json');
      req.error(new ErrorEvent('Network error'));

      try {
        await loadPromise;
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeTruthy();
      }
    });

    it('should handle HTTP error responses', async () => {
      const loadPromise = service.loadAllProductCategories();

      const req = httpTestingController.expectOne('assets/productCategory.json');
      req.flush('Error loading categories', { status: 500, statusText: 'Internal Server Error' });

      try {
        await loadPromise;
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeTruthy();
      }
    });
  });

  describe('Signal Management', () => {
    it('should maintain signal consistency between productCategorySignal and productCategory', async () => {
      const loadPromise = service.loadAllProductCategories();

      const req = httpTestingController.expectOne('assets/productCategory.json');
      req.flush(mockProductCategories);

      await loadPromise;
      
      expect(service.productCategorySignal()).toBe(service.productCategory());
    });

    it('should allow direct signal updates', () => {
      const testCategories = [mockProductCategories[0]];
      service.productCategorySignal.set(testCategories);
      
      expect(service.productCategory()).toEqual(testCategories);
    });

    it('should preserve signal reactivity', () => {
      let signalValue: ProductCategory[] = [];
      
      // Simulate a reactive context
      const effect = () => {
        signalValue = service.productCategory();
      };
      
      effect(); // Initial call
      expect(signalValue).toEqual([]);
      
      service.productCategorySignal.set(mockProductCategories);
      effect(); // Simulate effect re-run
      expect(signalValue).toEqual(mockProductCategories);
    });
  });

  describe('Multiple API Calls', () => {
    it('should handle multiple consecutive loadAllProductCategories calls', async () => {
      const firstLoadPromise = service.loadAllProductCategories();
      const secondLoadPromise = service.loadAllProductCategories();

      // Should have two pending requests
      const reqs = httpTestingController.match('assets/productCategory.json');
      expect(reqs.length).toBe(2);

      reqs[0].flush(mockProductCategories);
      reqs[1].flush([mockProductCategories[0]]);

      const firstResult = await firstLoadPromise;
      const secondResult = await secondLoadPromise;

      expect(firstResult).toEqual(mockProductCategories);
      expect(secondResult).toEqual([mockProductCategories[0]]);
      // Signal should have the result from the last completed request
      expect(service.productCategorySignal()).toEqual([mockProductCategories[0]]);
    });

    it('should handle concurrent loadAllProductCategories calls', async () => {
      const promise1 = service.loadAllProductCategories();
      const promise2 = service.loadAllProductCategories();

      const reqs = httpTestingController.match('assets/productCategory.json');
      expect(reqs.length).toBe(2);

      // Complete requests in reverse order
      reqs[1].flush([mockProductCategories[1]]);
      reqs[0].flush(mockProductCategories);

      const [result1, result2] = await Promise.all([promise1, promise2]);

      expect(result1).toEqual(mockProductCategories);
      expect(result2).toEqual([mockProductCategories[1]]);
    });
  });

  describe('Service Integration', () => {
    it('should work with firstValueFrom conversion', async () => {
      const loadPromise = service.loadAllProductCategories();

      const req = httpTestingController.expectOne('assets/productCategory.json');
      req.flush(mockProductCategories);

      const result = await loadPromise;
      expect(result).toEqual(mockProductCategories);
    });

    it('should properly inject environment configuration', () => {
      expect(service.env).toBeDefined();
      expect(typeof service.env).toBe('object');
    });

    it('should be provided as singleton service', () => {
      const secondInstance = TestBed.inject(ProductCategoryService);
      expect(service).toBe(secondInstance);
    });
  });

  describe('Error Scenarios', () => {
    it('should handle 404 errors', async () => {
      const loadPromise = service.loadAllProductCategories();

      const req = httpTestingController.expectOne('assets/productCategory.json');
      req.error(new ErrorEvent('Not Found'), { status: 404, statusText: 'Not Found' });

      try {
        await loadPromise;
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeTruthy();
      }
    });

    it('should handle 500 server errors', async () => {
      const loadPromise = service.loadAllProductCategories();

      const req = httpTestingController.expectOne('assets/productCategory.json');
      req.error(new ErrorEvent('Server Error'), { status: 500, statusText: 'Internal Server Error' });

      try {
        await loadPromise;
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeTruthy();
      }
    });

    it('should handle timeout errors', async () => {
      const loadPromise = service.loadAllProductCategories();

      const req = httpTestingController.expectOne('assets/productCategory.json');
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
    it('should handle categories with required fields', async () => {
      const validCategories: ProductCategory[] = [
        { id: '10', name: 'New Category 1' },
        { id: '20', name: 'New Category 2' },
        { id: '30', name: 'Category with Special Characters !@#$%' }
      ];

      const loadPromise = service.loadAllProductCategories();

      const req = httpTestingController.expectOne('assets/productCategory.json');
      req.flush(validCategories);

      const result = await loadPromise;
      expect(result).toEqual(validCategories);
      expect(service.productCategorySignal()).toEqual(validCategories);
    });

    it('should handle categories with numeric string IDs', async () => {
      const categoriesWithNumericIds: ProductCategory[] = [
        { id: '001', name: 'Category with Leading Zeros' },
        { id: '999', name: 'Category with Large ID' },
        { id: '0', name: 'Category with Zero ID' }
      ];

      const loadPromise = service.loadAllProductCategories();

      const req = httpTestingController.expectOne('assets/productCategory.json');
      req.flush(categoriesWithNumericIds);

      const result = await loadPromise;
      expect(result).toEqual(categoriesWithNumericIds);
    });

    it('should handle categories with long names', async () => {
      const categoryWithLongName: ProductCategory = {
        id: '999',
        name: 'This is a very long category name that might be used in some systems to provide detailed descriptions of what products belong in this category and it should be handled properly by the service'
      };

      const loadPromise = service.loadAllProductCategories();

      const req = httpTestingController.expectOne('assets/productCategory.json');
      req.flush([categoryWithLongName]);

      const result = await loadPromise;
      expect(result[0].name.length).toBeGreaterThan(100);
      expect(result[0]).toEqual(categoryWithLongName);
    });

    it('should handle empty category names', async () => {
      const categoryWithEmptyName: ProductCategory = {
        id: '100',
        name: ''
      };

      const loadPromise = service.loadAllProductCategories();

      const req = httpTestingController.expectOne('assets/productCategory.json');
      req.flush([categoryWithEmptyName]);

      const result = await loadPromise;
      expect(result[0].name).toBe('');
    });

    it('should handle categories with special characters in names', async () => {
      const categoriesWithSpecialChars: ProductCategory[] = [
        { id: '1', name: 'Category & Subcategory' },
        { id: '2', name: 'Category/Subcategory' },
        { id: '3', name: 'Category-Subcategory' },
        { id: '4', name: 'Category (Subcategory)' },
        { id: '5', name: 'Category "Subcategory"' },
        { id: '6', name: 'Categoría with Accent Marks' },
        { id: '7', name: 'Category with Emoji 📱' }
      ];

      const loadPromise = service.loadAllProductCategories();

      const req = httpTestingController.expectOne('assets/productCategory.json');
      req.flush(categoriesWithSpecialChars);

      const result = await loadPromise;
      expect(result.length).toBe(7);
      expect(result).toEqual(categoriesWithSpecialChars);
    });

    it('should handle large category datasets', async () => {
      const largeCategoryArray: ProductCategory[] = Array.from({ length: 500 }, (_, index) => ({
        id: (index + 1).toString(),
        name: `Category ${index + 1}`
      }));

      const loadPromise = service.loadAllProductCategories();

      const req = httpTestingController.expectOne('assets/productCategory.json');
      req.flush(largeCategoryArray);

      const result = await loadPromise;
      expect(result.length).toBe(500);
      expect(service.productCategorySignal().length).toBe(500);
    });

    it('should handle duplicate category IDs', async () => {
      const categoriesWithDuplicateIds: ProductCategory[] = [
        { id: '1', name: 'First Category' },
        { id: '1', name: 'Duplicate ID Category' },
        { id: '2', name: 'Unique Category' }
      ];

      const loadPromise = service.loadAllProductCategories();

      const req = httpTestingController.expectOne('assets/productCategory.json');
      req.flush(categoriesWithDuplicateIds);

      const result = await loadPromise;
      expect(result.length).toBe(3);
      expect(result).toEqual(categoriesWithDuplicateIds);
    });

    it('should handle categories with whitespace in names', async () => {
      const categoriesWithWhitespace: ProductCategory[] = [
        { id: '1', name: '  Leading Spaces' },
        { id: '2', name: 'Trailing Spaces  ' },
        { id: '3', name: '  Both Ends  ' },
        { id: '4', name: 'Multiple    Internal    Spaces' },
        { id: '5', name: '\tTab Characters\t' },
        { id: '6', name: '\nNew Line Characters\n' }
      ];

      const loadPromise = service.loadAllProductCategories();

      const req = httpTestingController.expectOne('assets/productCategory.json');
      req.flush(categoriesWithWhitespace);

      const result = await loadPromise;
      expect(result.length).toBe(6);
      expect(result).toEqual(categoriesWithWhitespace);
    });
  });

  describe('Service State Management', () => {
    it('should reset state when loading new categories', async () => {
      // Load initial categories
      const firstLoadPromise = service.loadAllProductCategories();
      let req = httpTestingController.expectOne('assets/productCategory.json');
      req.flush(mockProductCategories);
      await firstLoadPromise;

      expect(service.productCategorySignal().length).toBe(5);

      // Load different categories
      const secondLoadPromise = service.loadAllProductCategories();
      req = httpTestingController.expectOne('assets/productCategory.json');
      req.flush([mockProductCategories[0]]);
      await secondLoadPromise;

      expect(service.productCategorySignal().length).toBe(1);
      expect(service.productCategorySignal()).toEqual([mockProductCategories[0]]);
    });

    it('should maintain state consistency across multiple service instances', () => {
      const secondInstance = TestBed.inject(ProductCategoryService);
      expect(service.productCategorySignal()).toBe(secondInstance.productCategorySignal());
    });
  });
});
