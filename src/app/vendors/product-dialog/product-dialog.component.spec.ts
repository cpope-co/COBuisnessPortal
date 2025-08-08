import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { ProductDialogComponent } from './product-dialog.component'; // Add this import

describe('ProductDialogComponent', () => { // Add the describe block
  let component: ProductDialogComponent;
  let fixture: ComponentFixture<ProductDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: { close: jasmine.createSpy('close') } }
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