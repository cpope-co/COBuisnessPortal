import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { ProductCatalogComponent } from './product-catalog.component';
import { ProductCatalogService } from './product-catalog.service';
import { ProductCategoryService } from './product-category.service';
import { MessagesService } from '../../messages/messages.service';
import { Product } from '../../models/product.model';
import { ProductCategory } from '../../models/product-category.model';
import { MatDialog } from '@angular/material/dialog';

describe('ProductCatalogComponent', () => {
  let component: ProductCatalogComponent;
  let fixture: ComponentFixture<ProductCatalogComponent>;
  let productCatalogService: jasmine.SpyObj<ProductCatalogService>;
  let productCategoryService: jasmine.SpyObj<ProductCategoryService>;
  let messagesService: jasmine.SpyObj<MessagesService>;
  let dialog: jasmine.SpyObj<MatDialog>;

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

  const mockCategories: ProductCategory[] = [
    { id: '1', name: 'Category 1' },
    { id: '2', name: 'Category 2' }
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
    
    await TestBed.configureTestingModule({
      imports: [ProductCatalogComponent, NoopAnimationsModule],
      providers: [
        { provide: ProductCatalogService, useValue: productCatalogServiceSpy },
        { provide: ProductCategoryService, useValue: productCategoryServiceSpy },
        { provide: MessagesService, useValue: messagesServiceSpy },
        { provide: MatDialog, useValue: dialogSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductCatalogComponent);
    component = fixture.componentInstance;
    productCatalogService = TestBed.inject(ProductCatalogService) as jasmine.SpyObj<ProductCatalogService>;
    productCategoryService = TestBed.inject(ProductCategoryService) as jasmine.SpyObj<ProductCategoryService>;
    messagesService = TestBed.inject(MessagesService) as jasmine.SpyObj<MessagesService>;
    dialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;

    // Set up default mock returns
    productCatalogService.loadAllProducts.and.returnValue(Promise.resolve(mockProducts));
    productCategoryService.loadAllProductCategories.and.returnValue(Promise.resolve(mockCategories));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have table columns configured', () => {
    expect(component.tableColumns).toBeDefined();
    expect(component.tableColumns.length).toBeGreaterThan(0);
    
    // Check for key columns
    const skuColumn = component.tableColumns.find(col => col.column === 'SKU');
    expect(skuColumn).toBeDefined();
    expect(skuColumn!.label).toBe('SKU');
    
    const categoryColumn = component.tableColumns.find(col => col.column === 'categoryID');
    expect(categoryColumn).toBeDefined();
    expect(categoryColumn!.label).toBe('Category');
  });

  it('should have table config defined', () => {
    expect(component.tableConfig).toBeDefined();
    expect(component.tableConfig.showFilter).toBe(true);
    expect(component.tableConfig.showPagination).toBe(true);
    expect(component.tableConfig.clickableRows).toBe(true);
  });

  it('should load products data', async () => {
    component.productsSignal.set(mockProducts);
    
    expect(component.products()).toEqual(mockProducts);
    expect(productCatalogService.loadAllProducts).toHaveBeenCalled();
  });

  it('should load product categories', async () => {
    component.productCategoriesSignal.set(mockCategories);
    
    expect(component.productCategories()).toEqual(mockCategories);
    expect(productCategoryService.loadAllProductCategories).toHaveBeenCalled();
  });

  it('should have category name mapping method', () => {
    component.productCategoriesSignal.set(mockCategories);
    
    expect(component.getCategoryName('1')).toBe('Category 1');
    expect(component.getCategoryName('2')).toBe('Category 2');
    expect(component.getCategoryName('999')).toBe('Unknown');
  });

  it('should handle onViewProduct method', () => {
    const testProduct = mockProducts[0];
    
    expect(() => component.onViewProduct(testProduct)).not.toThrow();
    expect(typeof component.onViewProduct).toBe('function');
  });

  it('should handle load products error', async () => {
    productCatalogService.loadAllProducts.and.returnValue(Promise.reject('Load error'));
    
    await component.loadProducts();
    
    expect(messagesService.showMessage).toHaveBeenCalledWith('Failed to load products', 'danger');
  });

  it('should handle load categories error', async () => {
    productCategoryService.loadAllProductCategories.and.returnValue(Promise.reject('Category error'));
    
    await component.loadProductCategories();
    
    expect(messagesService.showMessage).toHaveBeenCalledWith('Failed to load product categories', 'danger');
  });
});