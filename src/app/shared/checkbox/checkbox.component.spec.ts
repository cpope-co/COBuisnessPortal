import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { CheckboxComponent } from './checkbox.component';
import { signal } from '@angular/core';

describe('CheckboxComponent', () => {
  let component: CheckboxComponent;
  let fixture: ComponentFixture<CheckboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, CheckboxComponent],
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CheckboxComponent);
    component = fixture.componentInstance;
    
    // Set the required inputs
    fixture.componentRef.setInput('formGroup', new FormGroup({
      checkbox: new FormControl(false)
    }));
    fixture.componentRef.setInput('formControlName', 'checkbox');
    fixture.componentRef.setInput('label', 'Test Label');
    fixture.componentRef.setInput('placeholder', 'Test Placeholder');
    fixture.componentRef.setInput('options', { value: true });
    fixture.componentRef.setInput('model', { checkbox: { ErrorMessages: { required: 'Required' } } });
    
    fixture.detectChanges();
  });
  
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

