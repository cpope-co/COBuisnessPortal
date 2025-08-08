import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';

import { MultiSelectComponent } from './multi-select.component';

describe('MultiSelectComponent', () => {
  let component: MultiSelectComponent;
  let fixture: ComponentFixture<MultiSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultiSelectComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MultiSelectComponent);
    component = fixture.componentInstance;
    
    // Set required inputs
    fixture.componentRef.setInput('formGroup', new FormGroup({
      multiSelect: new FormControl([])
    }));
    fixture.componentRef.setInput('formControlName', 'multiSelect');
    fixture.componentRef.setInput('label', 'Test Label');
    fixture.componentRef.setInput('placeholder', 'Test Placeholder');
    fixture.componentRef.setInput('options', []);
    fixture.componentRef.setInput('model', { multiSelect: { ErrorMessages: { required: 'Required' } } });
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
