import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

import { RadioComponent } from './radio.component';
import { FormHandlingService } from '../../services/form-handling.service';

describe('RadioComponent', () => {
  let component: RadioComponent;
  let fixture: ComponentFixture<RadioComponent>;
  let mockFormHandlingService: jasmine.SpyObj<FormHandlingService>;

  const mockOptions = [
    { id: 'option1', name: 'Option 1' },
    { id: 'option2', name: 'Option 2' },
    { id: 'option3', name: 'Option 3' }
  ];

  const mockModel = {
    testRadio: {
      Validators: [],
      ErrorMessages: {
        required: 'This field is required'
      }
    }
  };

  beforeEach(async () => {
    const formHandlingServiceSpy = jasmine.createSpyObj('FormHandlingService', ['getErrorMessages']);

    await TestBed.configureTestingModule({
      imports: [RadioComponent, ReactiveFormsModule, NoopAnimationsModule],
      providers: [
        { provide: FormHandlingService, useValue: formHandlingServiceSpy }
      ]
    }).compileComponents();
    
    fixture = TestBed.createComponent(RadioComponent);
    component = fixture.componentInstance;
    mockFormHandlingService = TestBed.inject(FormHandlingService) as jasmine.SpyObj<FormHandlingService>;
    
    // Set up default mock return value
    mockFormHandlingService.getErrorMessages.and.returnValue('');
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      setRequiredInputs();
      expect(component).toBeTruthy();
    });

    it('should initialize with correct input values', () => {
      const formGroup = new FormGroup({
        testRadio: new FormControl('')
      });

      fixture.componentRef.setInput('formGroup', formGroup);
      fixture.componentRef.setInput('controlName', 'testRadio');
      fixture.componentRef.setInput('label', 'Test Radio Label');
      fixture.componentRef.setInput('placeholder', 'Select an option');
      fixture.componentRef.setInput('model', mockModel);
      fixture.componentRef.setInput('options', mockOptions);
      
      fixture.detectChanges();

      expect(component.formGroup()).toBe(formGroup);
      expect(component.controlName()).toBe('testRadio');
      expect(component.label()).toBe('Test Radio Label');
      expect(component.placeholder()).toBe('Select an option');
      expect(component.model()).toBe(mockModel);
      expect(component.options()).toBe(mockOptions);
    });

    it('should generate unique ID using HostBinding', () => {
      setRequiredInputs();
      expect(component.hostId).toContain('radio-');
      expect(component.hostId.length).toBeGreaterThan(6);
    });

    it('should have initial state', () => {
      setRequiredInputs();
      expect(component.value).toBeUndefined(); // Component starts with undefined value, not empty string
      expect(component.disabled).toBe(false);
    });

    it('should inject FormHandlingService', () => {
      setRequiredInputs();
      expect(component.formHandlerService).toBe(mockFormHandlingService);
    });
  });

  describe('ControlValueAccessor Implementation', () => {
    beforeEach(() => {
      setRequiredInputs();
    });

    it('should write value correctly', () => {
      const testValue = 'option2';
      component.writeValue(testValue);
      expect(component.value).toBe(testValue);
    });

    it('should register onChange callback', () => {
      const mockOnChange = jasmine.createSpy('onChange');
      component.registerOnChange(mockOnChange);
      
      component.onValueChange('option1');
      expect(mockOnChange).toHaveBeenCalledWith('option1');
    });

    it('should register onTouched callback', () => {
      const mockOnTouched = jasmine.createSpy('onTouched');
      component.registerOnTouched(mockOnTouched);
      
      component.onValueChange('option1');
      expect(mockOnTouched).toHaveBeenCalled();
    });

    it('should set disabled state', () => {
      component.setDisabledState(true);
      expect(component.disabled).toBe(true);
      
      component.setDisabledState(false);
      expect(component.disabled).toBe(false);
    });

    it('should handle value changes correctly', () => {
      const mockOnChange = jasmine.createSpy('onChange');
      const mockOnTouched = jasmine.createSpy('onTouched');
      
      component.registerOnChange(mockOnChange);
      component.registerOnTouched(mockOnTouched);
      
      const newValue = 'option2';
      component.onValueChange(newValue);
      
      expect(component.value).toBe(newValue);
      expect(mockOnChange).toHaveBeenCalledWith(newValue);
      expect(mockOnTouched).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      setRequiredInputs();
    });

    it('should get error message from FormHandlingService', () => {
      const mockErrorMessage = 'Field is required';
      mockFormHandlingService.getErrorMessages.and.returnValue(mockErrorMessage);
      
      const result = component.getErrorMessage();
      
      expect(mockFormHandlingService.getErrorMessages).toHaveBeenCalledWith(
        jasmine.any(FormGroup),
        'testRadio',
        jasmine.any(Object)
      );
      expect(result).toBe(mockErrorMessage);
    });

    it('should handle empty error message', () => {
      mockFormHandlingService.getErrorMessages.and.returnValue('');
      
      const result = component.getErrorMessage();
      expect(result).toBe('');
    });
  });

  describe('Signal Input Updates', () => {
    beforeEach(() => {
      setRequiredInputs();
    });

    it('should update when formGroup signal changes', () => {
      const newFormGroup = new FormGroup({
        testRadio: new FormControl('') // Keep the same control name to avoid template errors
      });
      
      fixture.componentRef.setInput('formGroup', newFormGroup);
      fixture.detectChanges();
      
      expect(component.formGroup()).toBe(newFormGroup);
    });

    it('should update when options signal changes', () => {
      const newOptions = [
        { id: 'new1', name: 'New Option 1' },
        { id: 'new2', name: 'New Option 2' }
      ];
      
      fixture.componentRef.setInput('options', newOptions);
      fixture.detectChanges();
      
      expect(component.options()).toBe(newOptions);
    });

    it('should update when label signal changes', () => {
      const newLabel = 'Updated Radio Label';
      
      fixture.componentRef.setInput('label', newLabel);
      fixture.detectChanges();
      
      expect(component.label()).toBe(newLabel);
    });

    it('should update when controlName signal changes', () => {
      const newControlName = 'newRadioControl';
      
      // First, update the FormGroup to have the new control
      const newFormGroup = new FormGroup({
        newRadioControl: new FormControl('')
      });
      
      fixture.componentRef.setInput('formGroup', newFormGroup);
      fixture.componentRef.setInput('controlName', newControlName);
      fixture.detectChanges();
      
      expect(component.controlName()).toBe(newControlName);
    });

    it('should update when model signal changes', () => {
      const newModel = { newField: { Validators: [], ErrorMessages: {} } };
      
      fixture.componentRef.setInput('model', newModel);
      fixture.detectChanges();
      
      expect(component.model()).toBe(newModel);
    });
  });

  describe('Form Integration', () => {
    beforeEach(() => {
      setRequiredInputs();
    });

    it('should integrate with FormGroup correctly', () => {
      const formGroup = component.formGroup();
      const testValue = 'option2';
      
      formGroup.get('testRadio')?.setValue(testValue);
      fixture.detectChanges();
      
      expect(formGroup.get('testRadio')?.value).toBe(testValue);
    });

    it('should handle value changes through form control', () => {
      const testValue = 'option3';
      component.onValueChange(testValue);
      
      expect(component.value).toBe(testValue);
    });

    it('should respect disabled state from form control', () => {
      const formGroup = component.formGroup();
      formGroup.get('testRadio')?.disable();
      component.setDisabledState(true);
      
      expect(component.disabled).toBe(true);
    });
  });

  // Helper function to set required inputs
  function setRequiredInputs(): void {
    fixture.componentRef.setInput('formGroup', new FormGroup({
      testRadio: new FormControl('')
    }));
    fixture.componentRef.setInput('controlName', 'testRadio');
    fixture.componentRef.setInput('label', 'Test Radio Label');
    fixture.componentRef.setInput('placeholder', 'Select an option');
    fixture.componentRef.setInput('model', mockModel);
    fixture.componentRef.setInput('options', mockOptions);
    
    fixture.detectChanges();
  }
});
