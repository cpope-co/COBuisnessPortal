import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxMaskDirective, NGX_MASK_CONFIG } from 'ngx-mask';
import { InputComponent } from './input.component';
import { FormGroup, FormControl } from '@angular/forms';

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
    
    // Set the required inputs
    fixture.componentRef.setInput('formGroup', new FormGroup({
      input: new FormControl('')
    }));
    fixture.componentRef.setInput('formControlName', 'input');
    fixture.componentRef.setInput('label', 'Test Label');
    fixture.componentRef.setInput('placeholder', 'Test Placeholder');
    fixture.componentRef.setInput('type', 'text');
    fixture.componentRef.setInput('model', { input: { ErrorMessages: { required: 'Required' } } });
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
