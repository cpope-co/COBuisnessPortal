import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxMaskDirective, NGX_MASK_CONFIG } from 'ngx-mask';
import { InputComponent } from './input.component';

describe('InputComponent', () => {
  let component: InputComponent;
  let fixture: ComponentFixture<InputComponent>;

  const maskConfig = {
    validation: false,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputComponent, NgxMaskDirective],
      providers: [
        { provide: NGX_MASK_CONFIG, useValue: maskConfig }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
