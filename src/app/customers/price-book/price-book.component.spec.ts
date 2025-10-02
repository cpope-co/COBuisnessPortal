import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { PriceBookComponent } from './price-book.component';

describe('PriceBookComponent', () => {
  let component: PriceBookComponent;
  let fixture: ComponentFixture<PriceBookComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PriceBookComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PriceBookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
