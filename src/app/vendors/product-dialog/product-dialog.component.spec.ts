import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { ProductDialogComponent, openProductDialog } from './product-dialog.component';
import { ProductDialogDataModel } from './product-dialog.data.model';
import { Product, UPCCode } from '../../models/product.model';
import { CurrencyPipe } from '@angular/common';
import { of } from 'rxjs';

describe('ProductDialogComponent', () => {
  let component: ProductDialogComponent;
  let fixture: ComponentFixture<ProductDialogComponent>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<ProductDialogComponent>>;
  let mockProduct: Product;

  beforeEach(async () => {
    const upcCodes: UPCCode[] = [
      {
        retailUPC: '123456789012',
        wholesaleUPC: '123456789013'
      },
      {
        retailUPC: '234567890123',
        wholesaleUPC: '234567890124'
      }
    ];

    mockProduct = {
      SKU: 12345,
      manufacturerSKU: 67890,
      categoryID: 101,
      description: 'Test Product Description',
      size: 'Medium',
      unitOfMeasurement: 1,
      supplierID: 202,
      cost: 19.99,
      UPCCodes: upcCodes
    };

    const mockDialogData: ProductDialogDataModel = {
      mode: 'view',
      title: 'Product Details',
      product: mockProduct
    };

    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close', 'afterClosed']);
    mockDialogRef.afterClosed.and.returnValue(of(undefined));

    await TestBed.configureTestingModule({
      imports: [ProductDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should inject dialog dependencies correctly', () => {
      expect(component.dialogRef).toBe(mockDialogRef);
      expect(component.data).toBeDefined();
      expect(component.data.product).toEqual(mockProduct);
    });

    it('should have correct data structure', () => {
      expect(component.data.mode).toBe('view');
      expect(component.data.title).toBe('Product Details');
      expect(component.data.product).toBeDefined();
    });
  });

  describe('Template rendering', () => {
    it('should display product SKU in dialog title', () => {
      const titleElement = fixture.nativeElement.querySelector('[mat-dialog-title]');
      expect(titleElement.textContent.trim()).toBe(mockProduct.SKU.toString());
    });

    it('should display all product information fields', () => {
      const content = fixture.nativeElement.querySelector('mat-dialog-content');
      
      expect(content.textContent).toContain('SKU:');
      expect(content.textContent).toContain(mockProduct.SKU.toString());
      expect(content.textContent).toContain('Manufacturer SKU:');
      expect(content.textContent).toContain(mockProduct.manufacturerSKU.toString());
      expect(content.textContent).toContain('Category ID:');
      expect(content.textContent).toContain(mockProduct.categoryID.toString());
      expect(content.textContent).toContain('Description:');
      expect(content.textContent).toContain(mockProduct.description);
      expect(content.textContent).toContain('Size:');
      expect(content.textContent).toContain(mockProduct.size);
      expect(content.textContent).toContain('Unit of Measurement:');
      expect(content.textContent).toContain(mockProduct.unitOfMeasurement.toString());
      expect(content.textContent).toContain('Supplier ID:');
      expect(content.textContent).toContain(mockProduct.supplierID.toString());
      expect(content.textContent).toContain('Cost:');
    });

    it('should display formatted cost using currency pipe', () => {
      const content = fixture.nativeElement.querySelector('mat-dialog-content');
      // The currency pipe should format 19.99 as $19.99
      expect(content.textContent).toContain('$19.99');
    });

    it('should display all UPC codes', () => {
      const content = fixture.nativeElement.querySelector('mat-dialog-content');
      
      mockProduct.UPCCodes.forEach(upc => {
        expect(content.textContent).toContain('Retail UPC:');
        expect(content.textContent).toContain(upc.retailUPC);
        expect(content.textContent).toContain('Wholesale UPC:');
        expect(content.textContent).toContain(upc.wholesaleUPC);
      });
    });

    it('should render mat-dialog-actions section', () => {
      const actions = fixture.nativeElement.querySelector('mat-dialog-actions');
      expect(actions).toBeTruthy();
    });
  });

  describe('Data variations', () => {
    it('should handle product with minimal data', () => {
      const minimalProduct: Product = {
        SKU: 1,
        manufacturerSKU: 2,
        categoryID: 3,
        description: 'Minimal Product',
        size: 'Small',
        unitOfMeasurement: 1,
        supplierID: 4,
        cost: 9.99,
        UPCCodes: []
      };

      component.data.product = minimalProduct;
      fixture.detectChanges();

      const content = fixture.nativeElement.querySelector('mat-dialog-content');
      expect(content.textContent).toContain('Minimal Product');
      expect(content.textContent).toContain('$9.99');
    });

    it('should handle product with single UPC code', () => {
      const productWithSingleUPC: Product = {
        ...mockProduct,
        UPCCodes: [{
          retailUPC: '999888777666',
          wholesaleUPC: '999888777667'
        }]
      };

      component.data.product = productWithSingleUPC;
      fixture.detectChanges();

      const content = fixture.nativeElement.querySelector('mat-dialog-content');
      expect(content.textContent).toContain('999888777666');
      expect(content.textContent).toContain('999888777667');
    });

    it('should handle product with multiple UPC codes', () => {
      const content = fixture.nativeElement.querySelector('mat-dialog-content');
      
      // Check that both UPC codes are displayed
      expect(content.textContent).toContain('123456789012');
      expect(content.textContent).toContain('123456789013');
      expect(content.textContent).toContain('234567890123');
      expect(content.textContent).toContain('234567890124');
    });

    it('should handle zero cost', () => {
      component.data.product = { ...mockProduct, cost: 0 };
      fixture.detectChanges();

      const content = fixture.nativeElement.querySelector('mat-dialog-content');
      expect(content.textContent).toContain('$0.00');
    });

    it('should handle large cost values', () => {
      component.data.product = { ...mockProduct, cost: 1234.56 };
      fixture.detectChanges();

      const content = fixture.nativeElement.querySelector('mat-dialog-content');
      expect(content.textContent).toContain('$1,234.56');
    });
  });

  describe('Component structure', () => {
    it('should have correct dialog structure', () => {
      const dialogTitle = fixture.nativeElement.querySelector('[mat-dialog-title]');
      const dialogContent = fixture.nativeElement.querySelector('mat-dialog-content');
      const dialogActions = fixture.nativeElement.querySelector('mat-dialog-actions');

      expect(dialogTitle).toBeTruthy();
      expect(dialogContent).toBeTruthy();
      expect(dialogActions).toBeTruthy();
    });

    it('should use @if directive for conditional rendering', () => {
      // The template uses @if(data) to conditionally render content
      expect(component.data).toBeTruthy();
      
      const content = fixture.nativeElement.querySelector('mat-dialog-content');
      expect(content.children.length).toBeGreaterThan(0);
    });

    it('should use @for directive for UPC codes iteration', () => {
      // The template uses @for to iterate over UPC codes
      const content = fixture.nativeElement.querySelector('mat-dialog-content');
      const upcElements = content.textContent.match(/Retail UPC:/g);
      
      expect(upcElements).toBeTruthy();
      expect(upcElements!.length).toBe(mockProduct.UPCCodes.length);
    });
  });
});

describe('openProductDialog utility function', () => {
  let mockDialog: jasmine.SpyObj<MatDialog>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<ProductDialogComponent>>;

  beforeEach(() => {
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close', 'afterClosed']);
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);
    mockDialog.open.and.returnValue(mockDialogRef);
  });

  it('should open dialog with correct configuration', () => {
    const testData: ProductDialogDataModel = {
      mode: 'view',
      title: 'Test Product Dialog',
      product: {
        SKU: 123,
        manufacturerSKU: 456,
        categoryID: 789,
        description: 'Test Product',
        size: 'Large',
        unitOfMeasurement: 2,
        supplierID: 101,
        cost: 29.99,
        UPCCodes: []
      }
    };

    const result = openProductDialog(mockDialog, testData);

    expect(mockDialog.open).toHaveBeenCalledWith(ProductDialogComponent, jasmine.objectContaining({
      disableClose: false,
      autoFocus: true,
      width: '400px',
      data: testData
    }));
    expect(result).toBe(mockDialogRef);
  });

  it('should create dialog with default configuration', () => {
    const testData: ProductDialogDataModel = {
      mode: 'view',
      title: 'Config Test',
      product: undefined
    };

    openProductDialog(mockDialog, testData);

    const calledConfig = mockDialog.open.calls.mostRecent().args[1];
    expect(calledConfig).toEqual(jasmine.objectContaining({
      disableClose: false,
      autoFocus: true,
      width: '400px',
      data: testData
    }));
  });

  it('should handle undefined product data', () => {
    const testData: ProductDialogDataModel = {
      mode: 'view',
      title: 'No Product Dialog',
      product: undefined
    };

    const result = openProductDialog(mockDialog, testData);

    expect(mockDialog.open).toHaveBeenCalledWith(ProductDialogComponent, jasmine.objectContaining({
      data: testData
    }));
    expect(result).toBe(mockDialogRef);
  });

  it('should return dialog reference for chaining', () => {
    const testData: ProductDialogDataModel = {
      mode: 'view',
      title: 'Return Test',
      product: undefined
    };

    const result = openProductDialog(mockDialog, testData);

    expect(result).toBe(mockDialogRef);
    expect(typeof result.close).toBe('function');
    expect(typeof result.afterClosed).toBe('function');
  });
});