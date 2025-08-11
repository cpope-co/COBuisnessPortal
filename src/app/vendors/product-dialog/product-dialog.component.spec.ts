import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ProductDialogComponent } from './product-dialog.component'; // Add this import

describe('ProductDialogComponent', () => { // Add the describe block
  let component: ProductDialogComponent;
  let fixture: ComponentFixture<ProductDialogComponent>;

  beforeEach(async () => {
    const mockDialogData = {
      product: {
        SKU: 'TEST-SKU-001',
        manufacturerSKU: 'MFG-SKU-001',
        categoryID: 'CAT-001',
        description: 'Test Product Description',
        size: 'Medium',
        unitOfMeasurement: 'Each',
        supplierID: 'SUP-001',
        cost: 19.99,
        UPCCodes: [
          {
            retailUPC: '123456789012',
            wholesaleUPC: '123456789013'
          }
        ]
      }
    };

    await TestBed.configureTestingModule({
      imports: [ProductDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: { close: jasmine.createSpy('close') } },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});