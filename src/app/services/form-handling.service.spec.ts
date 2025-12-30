import { TestBed } from '@angular/core/testing';
import { FormBuilder, FormGroup, Validators, AbstractControlOptions } from '@angular/forms';
import { FormHandlingService } from './form-handling.service';
import { FormHandling } from '../models/form-handling.model';

describe('FormHandlingService', () => {
  let service: FormHandlingService;
  let formBuilder: FormBuilder;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FormHandlingService, FormBuilder]
    });
    service = TestBed.inject(FormHandlingService);
    formBuilder = TestBed.inject(FormBuilder);
  });

  describe('Service Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should inject FormBuilder', () => {
      expect(service.fb).toBeTruthy();
      expect(service.fb).toBeInstanceOf(FormBuilder);
    });
  });

  describe('createFormGroup Method', () => {
    it('should create a basic form group with simple controls', () => {
      const model: { [key: string]: FormHandling } = {
        username: {
          Validators: [Validators.required],
          ErrorMessages: { required: 'Username is required' },
          value: 'testuser'
        },
        email: {
          Validators: [Validators.email],
          ErrorMessages: { email: 'Invalid email format' },
          value: 'test@example.com'
        }
      };

      const formGroup = service.createFormGroup(model);

      expect(formGroup).toBeInstanceOf(FormGroup);
      expect(formGroup.get('username')).toBeTruthy();
      expect(formGroup.get('email')).toBeTruthy();
      expect(formGroup.get('username')?.value).toBe('testuser');
      expect(formGroup.get('email')?.value).toBe('test@example.com');
    });

    it('should create form group with nested form groups', () => {
      const model: { [key: string]: FormHandling } = {
        firstName: {
          Validators: [Validators.required],
          ErrorMessages: { required: 'First name is required' },
          value: 'John',
          formGroup: {
            name: 'personalInfo'
          }
        },
        lastName: {
          Validators: [Validators.required],
          ErrorMessages: { required: 'Last name is required' },
          value: 'Doe',
          formGroup: {
            name: 'personalInfo'
          }
        },
        email: {
          Validators: [Validators.email],
          ErrorMessages: { email: 'Invalid email' },
          value: 'john@example.com'
        }
      };

      const formGroup = service.createFormGroup(model);

      expect(formGroup.get('personalInfo')).toBeTruthy();
      expect(formGroup.get('personalInfo')?.get('firstName')).toBeTruthy();
      expect(formGroup.get('personalInfo')?.get('lastName')).toBeTruthy();
      expect(formGroup.get('email')).toBeTruthy();
      
      expect(formGroup.get('personalInfo')?.get('firstName')?.value).toBe('John');
      expect(formGroup.get('personalInfo')?.get('lastName')?.value).toBe('Doe');
      expect(formGroup.get('email')?.value).toBe('john@example.com');
    });

    it('should handle multiple nested form groups', () => {
      const model: { [key: string]: FormHandling } = {
        street: {
          Validators: [Validators.required],
          ErrorMessages: { required: 'Street is required' },
          value: '123 Main St',
          formGroup: { name: 'address' }
        },
        city: {
          Validators: [Validators.required],
          ErrorMessages: { required: 'City is required' },
          value: 'Springfield',
          formGroup: { name: 'address' }
        },
        phone: {
          Validators: [Validators.required],
          ErrorMessages: { required: 'Phone is required' },
          value: '555-1234',
          formGroup: { name: 'contact' }
        },
        email: {
          Validators: [Validators.email],
          ErrorMessages: { email: 'Invalid email' },
          value: 'test@example.com',
          formGroup: { name: 'contact' }
        }
      };

      const formGroup = service.createFormGroup(model);

      expect(formGroup.get('address')).toBeTruthy();
      expect(formGroup.get('contact')).toBeTruthy();
      expect(formGroup.get('address')?.get('street')?.value).toBe('123 Main St');
      expect(formGroup.get('address')?.get('city')?.value).toBe('Springfield');
      expect(formGroup.get('contact')?.get('phone')?.value).toBe('555-1234');
      expect(formGroup.get('contact')?.get('email')?.value).toBe('test@example.com');
    });

    it('should apply validators to controls', () => {
      const model: { [key: string]: FormHandling } = {
        required_field: {
          Validators: [Validators.required, Validators.minLength(3)],
          ErrorMessages: { required: 'Field is required', minlength: 'Minimum 3 characters' },
          value: ''
        }
      };

      const formGroup = service.createFormGroup(model);
      const control = formGroup.get('required_field');

      expect(control?.hasError('required')).toBe(true);
      
      control?.setValue('ab');
      expect(control?.hasError('minlength')).toBe(true);
      
      control?.setValue('abc');
      expect(control?.valid).toBe(true);
    });

    it('should handle empty model', () => {
      const model: { [key: string]: FormHandling } = {};

      const formGroup = service.createFormGroup(model);

      expect(formGroup).toBeInstanceOf(FormGroup);
      expect(Object.keys(formGroup.controls).length).toBe(0);
    });

    it('should handle controls with no validators', () => {
      const model: { [key: string]: FormHandling } = {
        optional_field: {
          Validators: [],
          ErrorMessages: {},
          value: 'test'
        }
      };

      const formGroup = service.createFormGroup(model);
      const control = formGroup.get('optional_field');

      expect(control?.value).toBe('test');
      expect(control?.valid).toBe(true);
    });

    it('should handle formGroup with options validators', () => {
      const groupValidator = (control: any) => {
        const firstName = control.get('firstName')?.value;
        const lastName = control.get('lastName')?.value;
        return firstName && lastName && firstName === lastName 
          ? { sameNameError: true } 
          : null;
      };

      const model: { [key: string]: FormHandling } = {
        firstName: {
          Validators: [Validators.required],
          ErrorMessages: { required: 'First name required' },
          value: 'John',
          formGroup: {
            name: 'names',
            options: { validators: [groupValidator] }
          }
        },
        lastName: {
          Validators: [Validators.required],
          ErrorMessages: { required: 'Last name required' },
          value: 'John',
          formGroup: {
            name: 'names',
            options: { validators: [groupValidator] }
          }
        }
      };

      const formGroup = service.createFormGroup(model);
      const namesGroup = formGroup.get('names');

      expect(namesGroup?.hasError('sameNameError')).toBe(true);
      
      namesGroup?.get('lastName')?.setValue('Doe');
      expect(namesGroup?.hasError('sameNameError')).toBe(false);
    });
  });

  describe('getErrorMessages Method', () => {
    let formGroup: FormGroup;
    let model: { [key: string]: FormHandling };

    beforeEach(() => {
      model = {
        username: {
          Validators: [Validators.required, Validators.minLength(3)],
          ErrorMessages: { 
            required: 'Username is required',
            minlength: 'Username must be at least 3 characters'
          },
          value: ''
        },
        email: {
          Validators: [Validators.email],
          ErrorMessages: { email: 'Please enter a valid email' },
          value: ''
        }
      };
      formGroup = service.createFormGroup(model);
    });

    it('should return error message for required field', () => {
      const control = formGroup.get('username');
      control?.markAsTouched();

      const errorMessage = service.getErrorMessages(formGroup, 'username', model);

      expect(errorMessage).toBe('Username is required');
    });

    it('should return error message for minlength validation', () => {
      const control = formGroup.get('username');
      control?.setValue('ab');
      control?.markAsTouched();

      const errorMessage = service.getErrorMessages(formGroup, 'username', model);

      expect(errorMessage).toBe('Username must be at least 3 characters');
    });

    it('should return email validation error message', () => {
      const control = formGroup.get('email');
      control?.setValue('invalid-email');
      control?.markAsTouched();

      const errorMessage = service.getErrorMessages(formGroup, 'email', model);

      expect(errorMessage).toBe('Please enter a valid email');
    });

    it('should return empty string when no errors', () => {
      const control = formGroup.get('username');
      control?.setValue('validusername');

      const errorMessage = service.getErrorMessages(formGroup, 'username', model);

      expect(errorMessage).toBe('');
    });

    it('should prioritize customError over other errors', () => {
      const control = formGroup.get('username');
      control?.setErrors({
        required: true,
        customError: 'Custom validation error message'
      });

      const errorMessage = service.getErrorMessages(formGroup, 'username', model);

      expect(errorMessage).toBe('Custom validation error message');
    });

    it('should handle non-existent control', () => {
      const errorMessage = service.getErrorMessages(formGroup, 'nonexistent', model);

      expect(errorMessage).toBe('');
    });

    it('should handle missing error message in model', () => {
      const incompleteModel = {
        username: {
          Validators: [Validators.required],
          ErrorMessages: {}, // Missing required error message
          value: ''
        }
      };
      
      const incompleteFormGroup = service.createFormGroup(incompleteModel);
      const control = incompleteFormGroup.get('username');
      control?.markAsTouched();

      const errorMessage = service.getErrorMessages(incompleteFormGroup, 'username', incompleteModel);

      expect(errorMessage).toBe('username required');
    });
  });

  describe('getNestedFormGroup Method', () => {
    let formGroup: FormGroup;

    beforeEach(() => {
      const model: { [key: string]: FormHandling } = {
        street: {
          Validators: [Validators.required],
          ErrorMessages: { required: 'Street is required' },
          value: '123 Main St',
          formGroup: { name: 'address' }
        },
        city: {
          Validators: [Validators.required],
          ErrorMessages: { required: 'City is required' },
          value: 'Springfield',
          formGroup: { name: 'address' }
        }
      };
      formGroup = service.createFormGroup(model);
    });

    it('should return nested form group', () => {
      const addressGroup = service.getNestedFormGroup(formGroup, 'address');

      expect(addressGroup).toBeInstanceOf(FormGroup);
      expect(addressGroup.get('street')).toBeTruthy();
      expect(addressGroup.get('city')).toBeTruthy();
    });

    it('should handle non-existent form group', () => {
      const nonExistentGroup = service.getNestedFormGroup(formGroup, 'nonexistent');

      expect(nonExistentGroup).toBeNull();
    });
  });

  describe('handleFormErrors Method', () => {
    let formGroup: FormGroup;

    beforeEach(() => {
      const model: { [key: string]: FormHandling } = {
        username: {
          Validators: [Validators.required],
          ErrorMessages: { required: 'Username is required' },
          value: 'testuser'
        },
        email: {
          Validators: [Validators.email],
          ErrorMessages: { email: 'Invalid email' },
          value: 'test@example.com'
        }
      };
      formGroup = service.createFormGroup(model);
    });

    it('should set custom errors on form controls', () => {
      const errors = [
        { field: 'username', errDesc: 'Username already exists' },
        { field: 'email', errDesc: 'Email is already registered' }
      ];

      service.handleFormErrors(errors, formGroup);

      expect(formGroup.get('username')?.hasError('customError')).toBe(true);
      expect(formGroup.get('username')?.getError('customError')).toBe('Username already exists');
      expect(formGroup.get('email')?.hasError('customError')).toBe(true);
      expect(formGroup.get('email')?.getError('customError')).toBe('Email is already registered');
    });

    it('should handle errors for non-existent fields gracefully', () => {
      const errors = [
        { field: 'nonexistent', errDesc: 'This field does not exist' }
      ];

      expect(() => service.handleFormErrors(errors, formGroup)).not.toThrow();
    });

    it('should handle empty errors array', () => {
      const errors: any[] = [];

      expect(() => service.handleFormErrors(errors, formGroup)).not.toThrow();
    });

    it('should override existing errors with custom errors', () => {
      // First set some validation errors
      const usernameControl = formGroup.get('username');
      usernameControl?.setValue('');
      usernameControl?.markAsTouched();

      expect(usernameControl?.hasError('required')).toBe(true);

      // Then set custom error
      const errors = [
        { field: 'username', errDesc: 'Custom server error' }
      ];

      service.handleFormErrors(errors, formGroup);

      expect(usernameControl?.hasError('customError')).toBe(true);
      expect(usernameControl?.getError('customError')).toBe('Custom server error');
    });

    it('should handle errors for nested form controls', () => {
      // Create a form with nested controls (similar to registration form)
      const nestedModel: { [key: string]: FormHandling } = {
        usemail: {
          Validators: [Validators.email, Validators.required],
          ErrorMessages: { 
            email: 'Please enter a valid email address.',
            required: 'Please enter your email address.'
          },
          value: '',
          formGroup: {
            name: 'matchEmails',
          }
        },
        verifyEmail: {
          Validators: [Validators.email, Validators.required],
          ErrorMessages: {
            email: 'Please enter a valid email address.',
            required: 'Please enter your email address.'
          },
          value: '',
          formGroup: {
            name: 'matchEmails',
          }
        },
        firstName: {
          Validators: [Validators.required],
          ErrorMessages: { required: 'First name is required' },
          value: ''
        }
      };

      const nestedFormGroup = service.createFormGroup(nestedModel);
      
      // Test setting error on a nested control
      const errors = [
        { field: 'usemail', errDesc: 'Email address is already in use' },
        { field: 'firstName', errDesc: 'First name already exists' }
      ];

      service.handleFormErrors(errors, nestedFormGroup);

      // Check that the nested email control has the error
      const matchEmailsGroup = nestedFormGroup.get('matchEmails') as FormGroup;
      const emailControl = matchEmailsGroup?.get('usemail');
      expect(emailControl?.hasError('customError')).toBe(true);
      expect(emailControl?.getError('customError')).toBe('Email address is already in use');

      // Check that the root level control also has the error
      const firstNameControl = nestedFormGroup.get('firstName');
      expect(firstNameControl?.hasError('customError')).toBe(true);
      expect(firstNameControl?.getError('customError')).toBe('First name already exists');
    });
  });

  describe('Integration Tests', () => {
    it('should work with complete form workflow', () => {
      // Create a complex form
      const model: { [key: string]: FormHandling } = {
        firstName: {
          Validators: [Validators.required],
          ErrorMessages: { required: 'First name is required' },
          value: '',
          formGroup: { name: 'personalInfo' }
        },
        lastName: {
          Validators: [Validators.required],
          ErrorMessages: { required: 'Last name is required' },
          value: '',
          formGroup: { name: 'personalInfo' }
        },
        email: {
          Validators: [Validators.required, Validators.email],
          ErrorMessages: { 
            required: 'Email is required',
            email: 'Invalid email format'
          },
          value: ''
        }
      };

      const formGroup = service.createFormGroup(model);

      // Test form structure
      expect(formGroup.get('personalInfo')).toBeTruthy();
      expect(formGroup.get('email')).toBeTruthy();

      // Test validation
      formGroup.markAllAsTouched();
      expect(formGroup.invalid).toBe(true);

      // Test error messages - first let's check if the control exists and has errors
      const personalInfoGroup = service.getNestedFormGroup(formGroup, 'personalInfo');
      const firstNameControl = personalInfoGroup?.get('firstName');
      expect(firstNameControl).toBeTruthy();
      expect(firstNameControl?.invalid).toBe(true);
      expect(firstNameControl?.errors?.['required']).toBe(true);

      const firstNameError = service.getErrorMessages(formGroup, 'firstName', model);
      expect(firstNameError).toBe('First name is required');

      // Test nested form group access
      expect(personalInfoGroup?.get('firstName')).toBeTruthy();

      // Test server error handling
      const serverErrors = [
        { field: 'email', errDesc: 'Email already exists' }
      ];
      service.handleFormErrors(serverErrors, formGroup);

      const emailError = service.getErrorMessages(formGroup, 'email', model);
      expect(emailError).toBe('Email already exists');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle null or undefined model gracefully', () => {
      expect(() => service.createFormGroup(null as any)).toThrow();
      expect(() => service.createFormGroup(undefined as any)).toThrow();
    });

    it('should handle malformed model entries', () => {
      const malformedModel = {
        field1: {
          Validators: null as any,
          ErrorMessages: null as any,
          value: 'test'
        }
      };

      expect(() => service.createFormGroup(malformedModel)).not.toThrow();
    });

    it('should handle circular form group references', () => {
      const model: { [key: string]: FormHandling } = {
        field1: {
          Validators: [Validators.required],
          ErrorMessages: { required: 'Required' },
          value: '',
          formGroup: { name: 'group1' }
        },
        field2: {
          Validators: [Validators.required],
          ErrorMessages: { required: 'Required' },
          value: '',
          formGroup: { name: 'group1' }
        }
      };

      expect(() => service.createFormGroup(model)).not.toThrow();
    });
  });

  describe('Performance Tests', () => {
    it('should handle large forms efficiently', () => {
      const largeModel: { [key: string]: FormHandling } = {};
      
      // Create a large model with 100 fields
      for (let i = 0; i < 100; i++) {
        largeModel[`field${i}`] = {
          Validators: [Validators.required],
          ErrorMessages: { required: `Field ${i} is required` },
          value: `value${i}`
        };
      }

      const startTime = performance.now();
      const formGroup = service.createFormGroup(largeModel);
      const endTime = performance.now();

      expect(formGroup).toBeTruthy();
      expect(Object.keys(formGroup.controls).length).toBe(100);
      expect(endTime - startTime).toBeLessThan(100); // Should complete quickly
    });

    it('should handle multiple error message lookups efficiently', () => {
      const model: { [key: string]: FormHandling } = {
        test: {
          Validators: [Validators.required],
          ErrorMessages: { required: 'Required field' },
          value: ''
        }
      };

      const formGroup = service.createFormGroup(model);
      formGroup.get('test')?.markAsTouched();

      const startTime = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        service.getErrorMessages(formGroup, 'test', model);
      }
      
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(50);
    });
  });
});
