import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { RadioComponent } from './radio.component';

describe('RadioComponent', () => {
  let component: RadioComponent;
  let fixture: ComponentFixture<RadioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadioComponent, ReactiveFormsModule, NoopAnimationsModule]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RadioComponent);
    component = fixture.componentInstance;
    
    const formGroup = new FormGroup({
      testRadio: new FormControl('')
    });
    
    // Set required inputs
    fixture.componentRef.setInput('formGroup', formGroup);
    fixture.componentRef.setInput('label', 'Test Label');
    fixture.componentRef.setInput('placeholder', 'Select option');
    fixture.componentRef.setInput('model', { testRadio: 'Test Radio' });
    fixture.componentRef.setInput('options', [
      { id: 'option1', name: 'Option 1' },
      { id: 'option2', name: 'Option 2' }
    ]);
    
    // Set the form control name manually since it's inherited from RadioControlValueAccessor
    component.formControlName = 'testRadio';
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
