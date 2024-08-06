import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { CheckboxComponent } from './checkbox.component';

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
    
    // Provide the required input using InputSignal
    component.formGroup = signal(new FormGroup({
      checkbox: new FormControl(false)
    }));
    
    fixture.detectChanges();
  });
  
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
function signal(arg0: FormGroup<{ checkbox: FormControl<boolean | null>; }>): import("@angular/core").InputSignal<FormGroup<any>> {
  throw new Error('Function not implemented.');
}

