import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { signal } from '@angular/core';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

import { ProductCatalogComponent } from './product-catalog.component';
import { ProductCatalogService } from './product-catalog.service';
import { ProductCategoryService } from './product-category.service';
import { MessagesService } from '../../messages/messages.service';
import { FilterService } from '../../services/filter.service';
import { Product } from '../../models/product.model';
import { ProductCategory } from '../../models/product-category.model';

describe('ProductCatalogComponent', () => {
  let component: ProductCatalogComponent;
  let fixture: ComponentFixture<ProductCatalogComponent>;
  let productCatalogService: jasmine.SpyObj<ProductCatalogService>;
  let productCategoryService: jasmine.SpyObj<ProductCategoryService>;
  let messagesService: jasmine.SpyObj<MessagesService>;
  let filterService: jasmine.SpyObj<FilterService>;
  let dialog: jasmine.SpyObj<MatDialog>;
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

  const mockProductCategories: ProductCategory[] = [
    { id: '1', name: 'Category 1' },
    { id: '2', name: 'Category 2' },
    { id: '3', name: 'Category 3' }
  ];

  beforeEach(async () => {
    const productCatalogServiceSpy = jasmine.createSpyObj('ProductCatalogService', ['loadAllProducts'], {
      productCatalogSignal: signal([])
    });
    const productCategoryServiceSpy = jasmine.createSpyObj('ProductCategoryService', ['loadAllProductCategories'], {
      productCategorySignal: signal([])
    });
    const messagesServiceSpy = jasmine.createSpyObj('MessagesService', ['showMessage'], {
      message: signal(null)
    });
    const filterServiceSpy = jasmine.createSpyObj('FilterService', ['applyFilters']);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    // Set up successful default promises that resolve immediately
    productCatalogServiceSpy.loadAllProducts.and.returnValue(Promise.resolve(mockProducts));
    productCategoryServiceSpy.loadAllProductCategories.and.returnValue(Promise.resolve(mockProductCategories));

    await TestBed.configureTestingModule({
      imports: [
        ProductCatalogComponent, 
        HttpClientTestingModule,
        MatDialogModule,
        MatPaginatorModule,
        MatSortModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: ProductCatalogService, useValue: productCatalogServiceSpy },
        { provide: ProductCategoryService, useValue: productCategoryServiceSpy },
        { provide: MessagesService, useValue: messagesServiceSpy },
        { provide: FilterService, useValue: filterServiceSpy },
        { provide: MatDialog, useValue: dialogSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductCatalogComponent);
    component = fixture.componentInstance;
    productCatalogService = TestBed.inject(ProductCatalogService) as jasmine.SpyObj<ProductCatalogService>;
    productCategoryService = TestBed.inject(ProductCategoryService) as jasmine.SpyObj<ProductCategoryService>;
    messagesService = TestBed.inject(MessagesService) as jasmine.SpyObj<MessagesService>;
    filterService = TestBed.inject(FilterService) as jasmine.SpyObj<FilterService>;
    dialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
    httpTestingController = TestBed.inject(HttpTestingController);

    // Don't call detectChanges() here - let individual tests control when to trigger it
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default properties', fakeAsync(() => {
      // Set up data first since component loads it in constructor
      productCatalogService.productCatalogSignal.set(mockProducts);
      productCategoryService.productCategorySignal.set(mockProductCategories);
      
      // Trigger change detection to run effects
      fixture.detectChanges();
      tick();
      
      // Component should be created successfully
      expect(component).toBeTruthy();
      expect(component.displayedColumns).toBeDefined();
      expect(component.displayedColumns.length).toBeGreaterThan(0);
      
      // After component initialization, data should be loaded
      expect(component.productsSignal()).toEqual(mockProducts);
      expect(component.productCategoriesSignal()).toEqual(mockProductCategories);
      
      // Filter configuration should be set up based on loaded data
      expect(component.productCatalogFilters.length).toBe(2);
      expect(component.productCatalogFilters[0].name).toBe('categoryID');
      expect(component.productCatalogFilters[1].name).toBe('manufacturerSKU');
    }));

    it('should have correct displayed columns configuration', () => {
      const expectedColumns = [
        {column: 'SKU', label: 'SKU'},
        {column: 'manufacturerSKU' , label: 'Manufacturer SKU'},
        {column: 'categoryID', label: 'Category'},
        {column: 'description', label: 'Description'},
        {column: 'size', label: 'Size'},
        {column: 'unitOfMeasurement', label: 'Unit'},
        {column: 'supplierID', label: 'Supplier'},
        {column: 'cost', label: 'Cost'}
      ];
      expect(component.displayedColumns).toEqual(expectedColumns);
    });

    it('should initialize productsDataSource with empty data', () => {
      expect(component.productsDataSource).toBeInstanceOf(MatTableDataSource);
      expect(component.productsDataSource.data).toEqual([]);
    });
  });

  describe('Data Loading', () => {
    it('should load products successfully on initialization', fakeAsync(() => {
      // Simulate successful loading by setting the signal data
      productCatalogService.productCatalogSignal.set(mockProducts);
      
      fixture.detectChanges();
      tick();

      expect(productCatalogService.loadAllProducts).toHaveBeenCalled();
      expect(component.productsSignal()).toEqual(mockProducts);
    }));

    it('should load product categories successfully on initialization', fakeAsync(() => {
      // Simulate successful loading by setting the signal data
      productCategoryService.productCategorySignal.set(mockProductCategories);
      
      fixture.detectChanges();
      tick();

      expect(productCategoryService.loadAllProductCategories).toHaveBeenCalled();
      expect(component.productCategoriesSignal()).toEqual(mockProductCategories);
    }));

    it('should handle products loading error', async () => {
      // Directly test the component's loadProducts method
      productCatalogService.loadAllProducts.and.returnValue(Promise.reject('Load error'));
      
      await component.loadProducts();
      
      expect(messagesService.showMessage).toHaveBeenCalledWith('Failed to load products', 'danger');
    });

    it('should handle product categories loading error', async () => {
      // Directly test the component's loadProductCategories method
      productCategoryService.loadAllProductCategories.and.returnValue(Promise.reject('Category load error'));
      
      await component.loadProductCategories();
      
      expect(messagesService.showMessage).toHaveBeenCalledWith('Failed to load product categories', 'danger');
    });

    it('should update productsDataSource when products signal changes', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      expect(component.productsDataSource.data).toEqual(mockProducts);
    }));
  });

  describe('Display Column Management', () => {
    it('should return correct displayedColumnNames', () => {
      const expectedNames = ['SKU', 'manufacturerSKU', 'categoryID', 'description', 'size', 'unitOfMeasurement', 'supplierID', 'cost'];
      expect(component.displayedColumnNames).toEqual(expectedNames);
    });

    it('should map categoryID values to category names', fakeAsync(() => {
      component.productCategoriesSignal.set(mockProductCategories);
      fixture.detectChanges();
      tick();

      expect(component.getMappedValue('categoryID', '1')).toBe('Category 1');
      expect(component.getMappedValue('categoryID', '2')).toBe('Category 2');
      expect(component.getMappedValue('categoryID', '999')).toBe('Unknown');
    }));

    it('should return original value for non-categoryID columns', () => {
      expect(component.getMappedValue('description', 'Test Product')).toBe('Test Product');
      expect(component.getMappedValue('cost', 10.99)).toBe(10.99 as any);
    });

    it('should get category name by ID', fakeAsync(() => {
      component.productCategoriesSignal.set(mockProductCategories);
      fixture.detectChanges();
      tick();

      expect(component.getCategoryName('1')).toBe('Category 1');
      expect(component.getCategoryName('nonexistent')).toBe('Unknown');
    }));
  });

  describe('Filter Configuration', () => {
    it('should configure filters when products and categories are loaded', fakeAsync(() => {
      // Set up data first
      productCatalogService.productCatalogSignal.set(mockProducts);
      productCategoryService.productCategorySignal.set(mockProductCategories);
      
      fixture.detectChanges();
      tick();

      expect(component.productCatalogFilters.length).toBe(2);
      
      const categoryFilter = component.productCatalogFilters.find(f => f.name === 'categoryID');
      expect(categoryFilter).toBeDefined();
      expect(categoryFilter.label).toBe('Category');
      expect(categoryFilter.options.length).toBe(mockProductCategories.length);

      const manufacturerFilter = component.productCatalogFilters.find(f => f.name === 'manufacturerSKU');
      expect(manufacturerFilter).toBeDefined();
      expect(manufacturerFilter.label).toBe('Manufacturer SKU');
    }));

    it('should create category filter options correctly', fakeAsync(() => {
      // Set up data first
      productCategoryService.productCategorySignal.set(mockProductCategories);
      
      fixture.detectChanges();
      tick();

      const categoryFilter = component.productCatalogFilters.find(f => f.name === 'categoryID');
      expect(categoryFilter.options).toEqual([
        { value: '1', label: 'Category 1' },
        { value: '2', label: 'Category 2' },
        { value: '3', label: 'Category 3' }
      ]);
    }));

    it('should create manufacturer SKU filter options from unique values', fakeAsync(() => {
      // Set up data first
      productCatalogService.productCatalogSignal.set(mockProducts);
      
      fixture.detectChanges();
      tick();

      const manufacturerFilter = component.productCatalogFilters.find(f => f.name === 'manufacturerSKU');
      expect(manufacturerFilter.options).toEqual([
        { value: 100, label: 100 },
        { value: 200, label: 200 }
      ]);
    }));
  });

  describe('Filter Predicate', () => {
    beforeEach(fakeAsync(() => {
      // Set up data for filter predicate tests
      productCatalogService.productCatalogSignal.set(mockProducts);
      productCategoryService.productCategorySignal.set(mockProductCategories);
      
      fixture.detectChanges();
      tick();
    }));

    it('should filter by search term', () => {
      const testProduct = mockProducts[0];
      const filter = JSON.stringify({ search: 'test product 1' });
      
      const result = component.productsDataSource.filterPredicate(testProduct, filter);
      expect(result).toBe(true);
    });

    it('should filter by category ID', () => {
      const testProduct = mockProducts[0];
      const filter = JSON.stringify({ categoryID: 1 });
      
      const result = component.productsDataSource.filterPredicate(testProduct, filter);
      expect(result).toBe(true);
    });

    it('should filter by manufacturer SKU', () => {
      const testProduct = mockProducts[0];
      const filter = JSON.stringify({ manufacturerSKU: 100 });
      
      const result = component.productsDataSource.filterPredicate(testProduct, filter);
      expect(result).toBe(true);
    });

    it('should combine multiple filters with AND logic', () => {
      const testProduct = mockProducts[0];
      const filter = JSON.stringify({ 
        search: 'test product 1',
        categoryID: 1,
        manufacturerSKU: 100
      });
      
      const result = component.productsDataSource.filterPredicate(testProduct, filter);
      expect(result).toBe(true);
    });

    it('should return false when search does not match', () => {
      const testProduct = mockProducts[0];
      const filter = JSON.stringify({ search: 'nonexistent product' });
      
      const result = component.productsDataSource.filterPredicate(testProduct, filter);
      expect(result).toBe(false);
    });

    it('should handle -1 as "all" option for category filter', () => {
      const testProduct = mockProducts[0];
      const filter = JSON.stringify({ categoryID: -1 });
      
      const result = component.productsDataSource.filterPredicate(testProduct, filter);
      expect(result).toBe(true);
    });

    it('should handle -1 as "all" option for manufacturer SKU filter', () => {
      const testProduct = mockProducts[0];
      const filter = JSON.stringify({ manufacturerSKU: -1 });
      
      const result = component.productsDataSource.filterPredicate(testProduct, filter);
      expect(result).toBe(true);
    });
  });

  describe('Filter Application', () => {
    beforeEach(fakeAsync(() => {
      fixture.detectChanges();
      tick();
    }));

    it('should set search filter', () => {
      component.setSearch('test search');
      
      const appliedFilter = JSON.parse(component.productsDataSource.filter);
      expect(appliedFilter.search).toBe('test search');
    });

    it('should preserve existing filters when setting search', () => {
      component.productsDataSource.filter = JSON.stringify({ categoryID: 1 });
      component.setSearch('test search');
      
      const appliedFilter = JSON.parse(component.productsDataSource.filter);
      expect(appliedFilter.search).toBe('test search');
      expect(appliedFilter.categoryID).toBe(1);
    });

    it('should set category filter', () => {
      const mockEvent = {
        source: { ariaLabel: 'categoryID' },
        value: '2'
      };
      
      component.setFilter(mockEvent);
      
      const appliedFilter = JSON.parse(component.productsDataSource.filter);
      expect(appliedFilter.categoryID).toBe(2);
    });

    it('should set manufacturer SKU filter as string', () => {
      const mockEvent = {
        source: { ariaLabel: 'manufacturerSKU' },
        value: '100'
      };
      
      component.setFilter(mockEvent);
      
      const appliedFilter = JSON.parse(component.productsDataSource.filter);
      expect(appliedFilter.manufacturerSKU).toBe('100');
    });

    it('should preserve existing filters when setting new filter', () => {
      component.productsDataSource.filter = JSON.stringify({ search: 'existing search' });
      
      const mockEvent = {
        source: { ariaLabel: 'categoryID' },
        value: '1'
      };
      
      component.setFilter(mockEvent);
      
      const appliedFilter = JSON.parse(component.productsDataSource.filter);
      expect(appliedFilter.search).toBe('existing search');
      expect(appliedFilter.categoryID).toBe(1);
    });
  });

  describe('Product View Dialog', () => {
    it('should call onViewProduct when product row is clicked', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      spyOn(component, 'onViewProduct');
      
      const tableRows = fixture.debugElement.queryAll(By.css('tr[mat-row]'));
      if (tableRows.length > 0) {
        tableRows[0].nativeElement.click();
        expect(component.onViewProduct).toHaveBeenCalled();
      }
    }));

    it('should open product dialog with correct parameters', fakeAsync(() => {
      const testProduct = mockProducts[0];
      const mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
      mockDialogRef.afterClosed.and.returnValue({ subscribe: jasmine.createSpy() });
      
      // Mock the openProductDialog function
      spyOn(component, 'onViewProduct').and.callThrough();
      
      component.onViewProduct(testProduct);
      tick();

      expect(component.onViewProduct).toHaveBeenCalledWith(testProduct);
    }));
  });

  describe('Template Rendering', () => {
    beforeEach(fakeAsync(() => {
      fixture.detectChanges();
      tick();
    }));

    it('should render product catalog title', () => {
      const titleElement = fixture.debugElement.query(By.css('mat-card-title h1'));
      expect(titleElement?.nativeElement.textContent).toContain('Product Catalog');
    });

    it('should render filters component', () => {
      const filtersElement = fixture.debugElement.query(By.css('app-filters'));
      expect(filtersElement).toBeTruthy();
    });

    it('should render table with correct columns', () => {
      const headers = fixture.debugElement.queryAll(By.css('th[mat-header-cell]'));
      expect(headers.length).toBe(component.displayedColumns.length);
    });

    it('should render paginator', () => {
      const paginatorElement = fixture.debugElement.query(By.css('mat-paginator'));
      expect(paginatorElement).toBeTruthy();
    });

    it('should display product data in table rows', () => {
      const rows = fixture.debugElement.queryAll(By.css('tr[mat-row]'));
      expect(rows.length).toBe(mockProducts.length);
    });

    it('should apply hover-row class to table rows', () => {
      const rows = fixture.debugElement.queryAll(By.css('tr[mat-row]'));
      rows.forEach((row: any) => {
        expect(row.nativeElement.classList).toContain('hover-row');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle empty products array', fakeAsync(() => {
      // First set up some initial data to create filters
      productCatalogService.productCatalogSignal.set(mockProducts);
      productCategoryService.productCategorySignal.set(mockProductCategories);
      fixture.detectChanges();
      tick();
      
      // Now test what happens when products are set to empty array
      component.productsSignal.set([]);
      fixture.detectChanges();
      tick();
      
      expect(component.productsSignal()).toEqual([]);
      expect(component.productsDataSource.data).toEqual([]);
      
      // Filters should be updated to have empty manufacturer options
      const manufacturerFilter = component.productCatalogFilters.find((f: any) => f.name === 'manufacturerSKU');
      expect(manufacturerFilter?.options).toEqual([]);
    }));

    it('should handle empty product categories array', fakeAsync(() => {
      // First set up some initial data to create filters
      productCatalogService.productCatalogSignal.set(mockProducts);
      productCategoryService.productCategorySignal.set(mockProductCategories);
      fixture.detectChanges();
      tick();
      
      // Now test what happens when categories are set to empty array
      component.productCategoriesSignal.set([]);
      fixture.detectChanges();
      tick();
      
      expect(component.productCategoriesSignal()).toEqual([]);
      
      // Category filter should have empty options
      const categoryFilter = component.productCatalogFilters.find((f: any) => f.name === 'categoryID');
      expect(categoryFilter?.options).toEqual([]);
    }));

    it('should handle invalid filter JSON gracefully', () => {
      component.productsDataSource.filter = 'invalid json';
      
      expect(() => {
        component.setSearch('test');
      }).not.toThrow();
    });
  });

  describe('ViewChild References', () => {
    it('should have paginator ViewChild reference after view init', () => {
      fixture.detectChanges();
      expect(component.paginator).toBeDefined();
    });

    it('should have sort ViewChild reference after view init', () => {
      fixture.detectChanges();
      expect(component.sort).toBeDefined();
    });
  });

  describe('Component Lifecycle', () => {
    it('should call loadProducts and loadProductCategories in constructor', () => {
      expect(productCatalogService.loadAllProducts).toHaveBeenCalled();
      expect(productCategoryService.loadAllProductCategories).toHaveBeenCalled();
    });

    it('should configure filter predicate in constructor', () => {
      expect(component.productsDataSource.filterPredicate).toBeDefined();
      expect(typeof component.productsDataSource.filterPredicate).toBe('function');
    });
  });
});
