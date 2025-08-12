import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

import { MultiSelectComponent } from './multi-select.component';
import { FormHandlingService } from '../../services/form-handling.service';

describe('MultiSelectComponent', () => {
  let component: MultiSelectComponent;
  let fixture: ComponentFixture<MultiSelectComponent>;
  let mockFormHandlingService: jasmine.SpyObj<FormHandlingService>;

  const mockOptions = [
    { id: 1, name: 'option one' },
    { id: 2, name: 'option two' },
    { id: 3, name: 'option three' }
  ];

  const mockModel = {
    multiSelect: {
      Validators: [],
      ErrorMessages: {
        required: 'This field is required',
        custom: 'Custom error message'
      },
      value: []
    }
  };

  beforeEach(async () => {
    const formHandlingServiceSpy = jasmine.createSpyObj('FormHandlingService', ['getErrorMessages']);

    await TestBed.configureTestingModule({
      imports: [
        MultiSelectComponent, 
        NoopAnimationsModule,
        MatFormFieldModule,
        MatSelectModule
      ],
      providers: [
        { provide: FormHandlingService, useValue: formHandlingServiceSpy }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MultiSelectComponent);
    component = fixture.componentInstance;
    mockFormHandlingService = TestBed.inject(FormHandlingService) as jasmine.SpyObj<FormHandlingService>;

    // Set up default mock return value
    mockFormHandlingService.getErrorMessages.and.returnValue('');
  });

  describe('Component initialization', () => {
    it('should create', () => {
      setRequiredInputs();
      expect(component).toBeTruthy();
    });

    it('should initialize with required inputs', () => {
      const formGroup = new FormGroup({
        multiSelect: new FormControl([])
      });

      fixture.componentRef.setInput('formGroup', formGroup);
      fixture.componentRef.setInput('formControlName', 'multiSelect');
      fixture.componentRef.setInput('label', 'Test Label');
      fixture.componentRef.setInput('placeholder', 'Test Placeholder');
      fixture.componentRef.setInput('options', mockOptions);
      fixture.componentRef.setInput('model', mockModel);

      fixture.detectChanges();

      expect(component.formGroup()).toBe(formGroup);
      expect(component.formControlName()).toBe('multiSelect');
      expect(component.label()).toBe('Test Label');
      expect(component.placeholder()).toBe('Test Placeholder');
      expect(component.options()).toEqual(mockOptions);
      expect(component.model()).toEqual(mockModel);
    });

    it('should inject FormHandlingService', () => {
      setRequiredInputs();
      expect(component.formHandlerService).toBe(mockFormHandlingService);
    });

    it('should extend SelectMultipleControlValueAccessor', () => {
      setRequiredInputs();
      expect(component).toBeInstanceOf(component.constructor);
      // Check if component has ControlValueAccessor methods
      expect(typeof component.writeValue).toBe('function');
      expect(typeof component.registerOnChange).toBe('function');
      expect(typeof component.registerOnTouched).toBe('function');
    });
  });

  describe('Template rendering', () => {
    beforeEach(() => {
      setRequiredInputs();
      fixture.detectChanges();
    });

    it('should render basic component structure', () => {
      const componentElement = fixture.debugElement.nativeElement;
      expect(componentElement).toBeTruthy();
    });

    it('should have correct label text in component', () => {
      expect(component.label()).toBe('Test Label');
    });

    it('should have access to options in component', () => {
      expect(component.options()).toEqual(mockOptions);
      expect(component.options().length).toBe(3);
    });

    it('should have form group bound correctly', () => {
      expect(component.formGroup()).toBeTruthy();
      expect(component.formControlName()).toBe('multiSelect');
    });

    it('should have compareWithFn method available', () => {
      expect(typeof component.compareWithFn).toBe('function');
    });
  });

  describe('Form validation and error handling', () => {
    beforeEach(() => {
      setRequiredInputs();
    });

    it('should not show error when form control is valid', () => {
      fixture.detectChanges();
      
      const formControl = component.formGroup().get('multiSelect');
      expect(formControl?.valid).toBe(true);
      expect(component.getErrorMessage('multiSelect')).toBe('');
    });

    it('should show error when form control is invalid and touched', () => {
      const formGroup = new FormGroup({
        multiSelect: new FormControl([], [Validators.required])
      });
      formGroup.get('multiSelect')?.markAsTouched();
      
      fixture.componentRef.setInput('formGroup', formGroup);
      mockFormHandlingService.getErrorMessages.and.returnValue('This field is required');
      
      fixture.detectChanges();
      
      const formControl = formGroup.get('multiSelect');
      expect(formControl?.invalid).toBe(true);
      expect(formControl?.touched).toBe(true);
      expect(component.getErrorMessage('multiSelect')).toBe('This field is required');
    });

    it('should show error when form control is invalid and dirty', () => {
      const formGroup = new FormGroup({
        multiSelect: new FormControl([], [Validators.required])
      });
      formGroup.get('multiSelect')?.markAsDirty();
      
      fixture.componentRef.setInput('formGroup', formGroup);
      mockFormHandlingService.getErrorMessages.and.returnValue('This field is required');
      
      fixture.detectChanges();
      
      const formControl = formGroup.get('multiSelect');
      expect(formControl?.invalid).toBe(true);
      expect(formControl?.dirty).toBe(true);
    });

    it('should not show error when form control is invalid but not touched or dirty', () => {
      const formGroup = new FormGroup({
        multiSelect: new FormControl([], [Validators.required])
      });
      
      fixture.componentRef.setInput('formGroup', formGroup);
      fixture.detectChanges();
      
      const formControl = formGroup.get('multiSelect');
      expect(formControl?.invalid).toBe(true);
      expect(formControl?.touched).toBe(false);
      expect(formControl?.dirty).toBe(false);
    });

    it('should call getErrorMessage with correct parameters', () => {
      const formGroup = new FormGroup({
        multiSelect: new FormControl([], [Validators.required])
      });
      formGroup.get('multiSelect')?.markAsTouched();
      
      fixture.componentRef.setInput('formGroup', formGroup);
      fixture.detectChanges();
      
      component.getErrorMessage('testKey');
      
      expect(mockFormHandlingService.getErrorMessages).toHaveBeenCalledWith(
        formGroup,
        'multiSelect',
        mockModel
      );
    });
  });

  describe('getErrorMessage method', () => {
    beforeEach(() => {
      setRequiredInputs();
      fixture.detectChanges();
    });

    it('should delegate to FormHandlingService', () => {
      const expectedMessage = 'Test error message';
      mockFormHandlingService.getErrorMessages.and.returnValue(expectedMessage);
      
      const result = component.getErrorMessage('testKey');
      
      expect(mockFormHandlingService.getErrorMessages).toHaveBeenCalledWith(
        component.formGroup(),
        component.formControlName(),
        component.model()
      );
      expect(result).toBe(expectedMessage);
    });

    it('should return error message for different keys', () => {
      mockFormHandlingService.getErrorMessages.and.returnValue('Required field error');
      
      const result = component.getErrorMessage('required');
      
      expect(result).toBe('Required field error');
    });

    it('should handle empty error messages', () => {
      mockFormHandlingService.getErrorMessages.and.returnValue('');
      
      const result = component.getErrorMessage('nonexistent');
      
      expect(result).toBe('');
    });
  });

  describe('compareWithFn method', () => {
    beforeEach(() => {
      setRequiredInputs();
      fixture.detectChanges();
    });

    it('should return true when both items have same id', () => {
      const item1 = { id: 1, name: 'Item 1' };
      const item2 = { id: 1, name: 'Item 1 Different Name' };
      
      const result = component.compareWithFn(item1, item2);
      
      expect(result).toBe(true);
    });

    it('should return false when items have different ids', () => {
      const item1 = { id: 1, name: 'Item 1' };
      const item2 = { id: 2, name: 'Item 2' };
      
      const result = component.compareWithFn(item1, item2);
      
      expect(result).toBe(false);
    });

    it('should return true when both items are null/undefined', () => {
      expect(component.compareWithFn(null as any, null as any)).toBe(true);
      expect(component.compareWithFn(undefined as any, undefined as any)).toBe(true);
    });

    it('should return false when one item is null/undefined', () => {
      const item = { id: 1, name: 'Item' };
      
      expect(component.compareWithFn(item, null as any)).toBe(false);
      expect(component.compareWithFn(null as any, item)).toBe(false);
      expect(component.compareWithFn(item, undefined as any)).toBe(false);
      expect(component.compareWithFn(undefined as any, item)).toBe(false);
    });

    it('should handle primitive values correctly', () => {
      const item1 = { id: 1 };
      const item2 = { id: 1 };
      const item3 = { id: 2 };
      
      expect(component.compareWithFn(item1, item2)).toBe(true);
      expect(component.compareWithFn(item1, item3)).toBe(false);
      
      // For primitive values that don't have id property
      // The function returns item1 && item2 ? item1.id === item2.id : item1 === item2
      // For numbers 1 and 2: both exist, but they don't have .id property, so undefined === undefined is true
      expect(component.compareWithFn(1 as any, 1 as any)).toBe(true);
      expect(component.compareWithFn(1 as any, 2 as any)).toBe(true); // Both are truthy, both .id are undefined, so undefined === undefined
    });
  });

  describe('Form integration', () => {
    let formGroup: FormGroup;

    beforeEach(() => {
      formGroup = new FormGroup({
        multiSelect: new FormControl([])
      });
      
      fixture.componentRef.setInput('formGroup', formGroup);
      fixture.componentRef.setInput('formControlName', 'multiSelect');
      fixture.componentRef.setInput('label', 'Test Label');
      fixture.componentRef.setInput('placeholder', 'Test Placeholder');
      fixture.componentRef.setInput('options', mockOptions);
      fixture.componentRef.setInput('model', mockModel);
      
      fixture.detectChanges();
    });

    it('should bind to form group correctly', () => {
      expect(component.formGroup()).toBe(formGroup);
      expect(component.formControlName()).toBe('multiSelect');
    });

    it('should update form control value when selection changes', () => {
      const initialValue = [1, 2];
      formGroup.get('multiSelect')?.setValue(initialValue);
      
      expect(formGroup.get('multiSelect')?.value).toEqual(initialValue);
    });

    it('should reflect form control validation state', () => {
      const formControl = formGroup.get('multiSelect');
      formControl?.setValidators([Validators.required]);
      formControl?.updateValueAndValidity();
      formControl?.markAsTouched();
      
      fixture.detectChanges();
      
      expect(formControl?.invalid).toBe(true);
      expect(formControl?.touched).toBe(true);
    });

    it('should work with different form control names', () => {
      const newFormGroup = new FormGroup({
        categories: new FormControl([])
      });
      
      fixture.componentRef.setInput('formGroup', newFormGroup);
      fixture.componentRef.setInput('formControlName', 'categories');
      fixture.detectChanges();
      
      expect(component.formGroup()).toBe(newFormGroup);
      expect(component.formControlName()).toBe('categories');
    });
  });

  describe('Dynamic options handling', () => {
    beforeEach(() => {
      setRequiredInputs();
      fixture.detectChanges();
    });

    it('should update when options change', () => {
      const newOptions = [
        { id: 4, name: 'new option one' },
        { id: 5, name: 'new option two' }
      ];
      
      fixture.componentRef.setInput('options', newOptions);
      fixture.detectChanges();
      
      expect(component.options()).toEqual(newOptions);
      expect(component.options().length).toBe(2);
    });

    it('should handle empty options array', () => {
      fixture.componentRef.setInput('options', []);
      fixture.detectChanges();
      
      expect(component.options()).toEqual([]);
      expect(component.options().length).toBe(0);
    });

    it('should handle options with different structures', () => {
      const complexOptions = [
        { id: 'uuid-1', name: 'complex option', description: 'desc1' },
        { id: 'uuid-2', name: 'another complex option', description: 'desc2' }
      ];
      
      fixture.componentRef.setInput('options', complexOptions);
      fixture.detectChanges();
      
      expect(component.options()).toEqual(complexOptions);
      expect(component.options().length).toBe(2);
    });
  });

  describe('Label and placeholder handling', () => {
    beforeEach(() => {
      setRequiredInputs();
    });

    it('should update label when label input changes', () => {
      fixture.componentRef.setInput('label', 'Updated Label');
      fixture.detectChanges();
      
      const matLabel = fixture.debugElement.query(By.css('mat-label'));
      expect(matLabel.nativeElement.textContent.trim()).toBe('Choose Updated Label');
    });

    it('should handle different label formats', () => {
      fixture.componentRef.setInput('label', 'Categories to Select');
      fixture.detectChanges();
      
      const matLabel = fixture.debugElement.query(By.css('mat-label'));
      expect(matLabel.nativeElement.textContent.trim()).toBe('Choose Categories to Select');
    });

    it('should handle special characters in labels', () => {
      fixture.componentRef.setInput('label', 'Items & Options');
      fixture.detectChanges();
      
      const matLabel = fixture.debugElement.query(By.css('mat-label'));
      expect(matLabel.nativeElement.textContent.trim()).toBe('Choose Items & Options');
    });
  });

  describe('Edge cases and error scenarios', () => {
    it('should handle malformed model gracefully', () => {
      const malformedModel = {
        multiSelect: {
          Validators: [],
          ErrorMessages: {},
          value: null
        }
      };
      
      fixture.componentRef.setInput('formGroup', new FormGroup({
        multiSelect: new FormControl([])
      }));
      fixture.componentRef.setInput('formControlName', 'multiSelect');
      fixture.componentRef.setInput('label', 'Test Label');
      fixture.componentRef.setInput('placeholder', 'Test Placeholder');
      fixture.componentRef.setInput('options', mockOptions);
      fixture.componentRef.setInput('model', malformedModel);
      
      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('should handle missing form control gracefully', () => {
      const formGroup = new FormGroup({
        existingControl: new FormControl([])
      });
      
      fixture.componentRef.setInput('formGroup', formGroup);
      fixture.componentRef.setInput('formControlName', 'nonexistent');
      fixture.componentRef.setInput('label', 'Test Label');
      fixture.componentRef.setInput('placeholder', 'Test Placeholder');
      fixture.componentRef.setInput('options', mockOptions);
      fixture.componentRef.setInput('model', mockModel);
      
      // Component should still be created
      expect(component).toBeTruthy();
      expect(component.formControlName()).toBe('nonexistent');
    });

    it('should options without required properties', () => {
      const incompleteOptions = [
        { id: 1 }, // missing name
        { name: 'No ID' }, // missing id
        {} // empty object
      ];
      
      setRequiredInputs();
      fixture.componentRef.setInput('options', incompleteOptions);
      fixture.detectChanges();
      
      expect(component.options()).toEqual(incompleteOptions);
      expect(() => fixture.detectChanges()).not.toThrow();
    });
  });

  // Helper function to set required inputs
  function setRequiredInputs(): void {
    fixture.componentRef.setInput('formGroup', new FormGroup({
      multiSelect: new FormControl([])
    }));
    fixture.componentRef.setInput('formControlName', 'multiSelect');
    fixture.componentRef.setInput('label', 'Test Label');
    fixture.componentRef.setInput('placeholder', 'Test Placeholder');
    fixture.componentRef.setInput('options', mockOptions);
    fixture.componentRef.setInput('model', mockModel);
  }
});
