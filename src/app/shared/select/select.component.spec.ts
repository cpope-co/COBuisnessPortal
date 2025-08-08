import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';

import { SelectComponent } from './select.component';

describe('SelectComponent', () => {
  let component: SelectComponent;
  let fixture: ComponentFixture<SelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SelectComponent);
    component = fixture.componentInstance;
    
    // Set required inputs
    fixture.componentRef.setInput('formGroup', new FormGroup({
      select: new FormControl('')
    }));
    fixture.componentRef.setInput('formControlName', 'select');
    fixture.componentRef.setInput('label', 'Test Label');
    fixture.componentRef.setInput('placeholder', 'Test Placeholder');
    fixture.componentRef.setInput('options', []);
    fixture.componentRef.setInput('model', { select: { ErrorMessages: { required: 'Required' } } });
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
