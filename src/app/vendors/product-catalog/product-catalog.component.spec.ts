import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ProductCatalogComponent } from './product-catalog.component';

describe('ProductCatalogComponent', () => {
  let component: ProductCatalogComponent;
  let fixture: ComponentFixture<ProductCatalogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductCatalogComponent, HttpClientTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductCatalogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
