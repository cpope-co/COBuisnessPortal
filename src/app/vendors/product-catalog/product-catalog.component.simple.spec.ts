import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductCatalogComponent } from './product-catalog.component';
import { ProductCatalogService } from './product-catalog.service';
import { ProductCategoryService } from './product-category.service';
import { MessagesService } from '../../messages/messages.service';
import { MatDialog } from '@angular/material/dialog';
import { Product } from '../../models/product.model';
import { ProductCategory } from '../../models/product-category.model';
import { signal } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ProductCatalogComponent - Simple Unit Tests', () => {
    let component: ProductCatalogComponent;
    let fixture: ComponentFixture<ProductCatalogComponent>;
    let mockProductCatalogService: jasmine.SpyObj<ProductCatalogService>;
    let mockProductCategoryService: jasmine.SpyObj<ProductCategoryService>;
    let mockMessagesService: jasmine.SpyObj<MessagesService>;
    let mockDialog: jasmine.SpyObj<MatDialog>;

    const mockProduct: Product = {
        SKU: 1,
        manufacturerSKU: 100,
        categoryID: 1,
        description: 'Test Product',
        size: 'Medium',
        unitOfMeasurement: 1,
        supplierID: 1,
        cost: 10.99,
        UPCCodes: [{ retailUPC: '123456789', wholesaleUPC: '987654321' }]
    };

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

        productCatalogServiceSpy.loadAllProducts.and.returnValue(Promise.resolve([mockProduct]));
        productCategoryServiceSpy.loadAllProductCategories.and.returnValue(Promise.resolve(mockCategories));

        await TestBed.configureTestingModule({
            imports: [ProductCatalogComponent, HttpClientTestingModule],
            providers: [
                { provide: ProductCatalogService, useValue: productCatalogServiceSpy },
                { provide: ProductCategoryService, useValue: productCategoryServiceSpy },
                { provide: MessagesService, useValue: messagesServiceSpy },
                { provide: MatDialog, useValue: dialogSpy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ProductCatalogComponent);
        component = fixture.componentInstance;
        mockProductCatalogService = TestBed.inject(ProductCatalogService) as jasmine.SpyObj<ProductCatalogService>;
        mockProductCategoryService = TestBed.inject(ProductCategoryService) as jasmine.SpyObj<ProductCategoryService>;
        mockMessagesService = TestBed.inject(MessagesService) as jasmine.SpyObj<MessagesService>;
        mockDialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize table columns and config', () => {
        expect(component.tableColumns.length).toBeGreaterThan(0);
        expect(component.tableConfig.showFilter).toBeTrue();
        expect(component.tableConfig.pageSize).toBe(10);
    });

    it('should return category name for valid categoryID', () => {
        component.productCategoriesSignal.set(mockCategories);
        expect(component.getCategoryName('1')).toBe('Category 1');
        expect(component.getCategoryName('2')).toBe('Category 2');
    });

    it('should return "Unknown" for invalid categoryID', () => {
        component.productCategoriesSignal.set(mockCategories);
        expect(component.getCategoryName('invalid')).toBe('Unknown');
    });

    it('should load products and set productsSignal', async () => {
        mockProductCatalogService.loadAllProducts.and.returnValue(Promise.resolve([mockProduct]));
        await component.loadProducts();
        expect(component.productsSignal()).toEqual([mockProduct]);
    });

    it('should show error message if loadProducts fails', async () => {
        mockProductCatalogService.loadAllProducts.and.returnValue(Promise.reject('error'));
        await component.loadProducts();
        expect(mockMessagesService.showMessage).toHaveBeenCalledWith('Failed to load products', 'danger');
    });

    it('should load product categories and set productCategoriesSignal', async () => {
        mockProductCategoryService.loadAllProductCategories.and.returnValue(Promise.resolve(mockCategories));
        await component.loadProductCategories();
        expect(component.productCategoriesSignal()).toEqual(mockCategories);
    });

    it('should show error message if loadProductCategories fails', async () => {
        mockProductCategoryService.loadAllProductCategories.and.returnValue(Promise.reject('error'));
        await component.loadProductCategories();
        expect(mockMessagesService.showMessage).toHaveBeenCalledWith('Failed to load product categories', 'danger');
    });

    it('should handle onViewProduct call', async () => {
        // Test that the method can be called without throwing an error
        expect(async () => {
            await component.onViewProduct(mockProduct);
        }).not.toThrow();
    });
});