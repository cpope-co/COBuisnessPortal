import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InputComponent } from './input.component';
import { NgxMaskDirective, IConfig, NGX_MASK_CONFIG } from 'ngx-mask';

describe('InputComponent', () => {
  let component: InputComponent;
  let fixture: ComponentFixture<InputComponent>;

  const maskConfig: Partial<IConfig> = {
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
