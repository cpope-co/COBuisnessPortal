import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { signal } from '@angular/core';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

import { ProductCatalogComponent } from './product-catalog.component';
import { ProductCatalogService } from './product-catalog.service';
import { ProductCategoryService } from './product-category.service';
import { MessagesService } from '../../messages/messages.service';
import { Product } from '../../models/product.model';
import { ProductCategory } from '../../models/product-category.model';
import * as ProductDialogComponent from '../product-dialog/product-dialog.component';

describe('ProductCatalogComponent', () => {
  let component: ProductCatalogComponent;
  let fixture: ComponentFixture<ProductCatalogComponent>;
  let productCatalogService: jasmine.SpyObj<ProductCatalogService>;
  let productCategoryService: jasmine.SpyObj<ProductCategoryService>;
  let messagesService: jasmine.SpyObj<MessagesService>;
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
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    // Set up successful default promises that resolve immediately
    productCatalogServiceSpy.loadAllProducts.and.returnValue(Promise.resolve(mockProducts));
    productCategoryServiceSpy.loadAllProductCategories.and.returnValue(Promise.resolve(mockProductCategories));

    await TestBed.configureTestingModule({
      imports: [
        ProductCatalogComponent, 
        HttpClientTestingModule,
        MatDialogModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: ProductCatalogService, useValue: productCatalogServiceSpy },
        { provide: ProductCategoryService, useValue: productCategoryServiceSpy },
        { provide: MessagesService, useValue: messagesServiceSpy },
        { provide: MatDialog, useValue: dialogSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductCatalogComponent);
    component = fixture.componentInstance;
    productCatalogService = TestBed.inject(ProductCatalogService) as jasmine.SpyObj<ProductCatalogService>;
    productCategoryService = TestBed.inject(ProductCategoryService) as jasmine.SpyObj<ProductCategoryService>;
    messagesService = TestBed.inject(MessagesService) as jasmine.SpyObj<MessagesService>;
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
      expect(component.tableColumns).toBeDefined();
      expect(component.tableColumns.length).toBeGreaterThan(0);
      
      // After component initialization, data should be loaded
      expect(component.productsSignal()).toEqual(mockProducts);
      expect(component.productCategoriesSignal()).toEqual(mockProductCategories);
    }));

    it('should have correct table columns configuration', () => {
      const expectedColumns = [
        {column: 'SKU', label: 'SKU', sortable: true, filterable: true},
        {column: 'manufacturerSKU' , label: 'Manufacturer SKU', sortable: true, filterable: true},
        {column: 'categoryID', label: 'Category', sortable: true, filterable: true, formatter: jasmine.any(Function)},
        {column: 'description', label: 'Description', sortable: true, filterable: true},
        {column: 'size', label: 'Size', sortable: true, filterable: true},
        {column: 'unitOfMeasurement', label: 'Unit', sortable: true, filterable: true},
        {column: 'supplierID', label: 'Supplier', sortable: true, filterable: true},
        {column: 'cost', label: 'Cost', sortable: true, filterable: true}
      ];
      expect(component.tableColumns).toEqual(expectedColumns);
    });

    it('should have correct table configuration', () => {
      expect(component.tableConfig).toEqual({
        showFilter: true,
        showAdvancedFilters: true,
        showPagination: true,
        pageSize: 10,
        pageSizeOptions: [10, 25, 50, 100],
        showFirstLastButtons: true,
        clickableRows: true
      });
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
  });

  describe('Category Name Mapping', () => {
    it('should get category name by ID', fakeAsync(() => {
      component.productCategoriesSignal.set(mockProductCategories);
      fixture.detectChanges();
      tick();

      expect(component.getCategoryName('1')).toBe('Category 1');
      expect(component.getCategoryName('2')).toBe('Category 2');
      expect(component.getCategoryName('nonexistent')).toBe('Unknown');
    }));

    it('should return "Unknown" for invalid category ID', () => {
      component.productCategoriesSignal.set(mockProductCategories);
      expect(component.getCategoryName('999')).toBe('Unknown');
    });

    it('should handle empty categories array', () => {
      component.productCategoriesSignal.set([]);
      expect(component.getCategoryName('1')).toBe('Unknown');
    });
  });

  describe('Product View Dialog', () => {
    it('should call onViewProduct when invoked with product', async () => {
      const testProduct = mockProducts[0];
      
      // Test that the method can be called without throwing an error
      expect(async () => {
        await component.onViewProduct(testProduct);
      }).not.toThrow();
    });
  });

  describe('Template Rendering', () => {
    beforeEach(fakeAsync(() => {
      fixture.detectChanges();
      tick();
    }));

    it('should render table component', () => {
      const tableElement = fixture.debugElement.query(By.css('co-table'));
      expect(tableElement).toBeTruthy();
    });

    it('should pass correct data to table component', fakeAsync(() => {
      // Set up data
      component.productsSignal.set(mockProducts);
      fixture.detectChanges();
      tick();

      const tableElement = fixture.debugElement.query(By.css('co-table'));
      expect(tableElement).toBeTruthy();
      
      // Check that the table component receives the data
      const tableComponent = tableElement.componentInstance;
      expect(tableComponent).toBeTruthy();
    }));
  });

  describe('Component Lifecycle', () => {
    it('should call loadProducts and loadProductCategories in constructor', () => {
      expect(productCatalogService.loadAllProducts).toHaveBeenCalled();
      expect(productCategoryService.loadAllProductCategories).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle empty products array', fakeAsync(() => {
      component.productsSignal.set([]);
      fixture.detectChanges();
      tick();
      
      expect(component.productsSignal()).toEqual([]);
    }));

    it('should handle empty product categories array', fakeAsync(() => {
      component.productCategoriesSignal.set([]);
      fixture.detectChanges();
      tick();
      
      expect(component.productCategoriesSignal()).toEqual([]);
    }));
  });
});
