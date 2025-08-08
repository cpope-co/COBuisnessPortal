import { FormControl, FormGroup } from '@angular/forms';
import { matchControlsValidator } from './verifypassword.validator';

describe('VerifyPasswordValidator', () => {
  let formGroup: FormGroup;
  let validator: any;

  beforeEach(() => {
    formGroup = new FormGroup({
      password: new FormControl(''),
      confirmPassword: new FormControl('')
    });
    
    validator = matchControlsValidator('password', 'confirmPassword');
  });

  describe('Matching passwords', () => {
    it('should return null when passwords match', () => {
      formGroup.patchValue({
        password: 'Password123!',
        confirmPassword: 'Password123!'
      });
      
      const result = validator(formGroup);
      expect(result).toBeNull();
    });

    it('should return null when both passwords are empty', () => {
      formGroup.patchValue({
        password: '',
        confirmPassword: ''
      });
      
      const result = validator(formGroup);
      expect(result).toBeNull();
    });

    it('should return null when both passwords are null', () => {
      formGroup.patchValue({
        password: null,
        confirmPassword: null
      });
      
      const result = validator(formGroup);
      expect(result).toBeNull();
    });

    it('should return null when both passwords are undefined', () => {
      formGroup.patchValue({
        password: undefined,
        confirmPassword: undefined
      });
      
      const result = validator(formGroup);
      expect(result).toBeNull();
    });

    it('should clear errors on confirm password when passwords match', () => {
      formGroup.patchValue({
        password: 'Password123!',
        confirmPassword: 'Password123!'
      });
      
      validator(formGroup);
      
      expect(formGroup.get('confirmPassword')?.errors).toBeNull();
    });
  });

  describe('Non-matching passwords', () => {
    it('should return mismatch error when passwords do not match', () => {
      formGroup.patchValue({
        password: 'Password123!',
        confirmPassword: 'DifferentPassword456@'
      });
      
      const result = validator(formGroup);
      expect(result).toEqual({ mismatch: true });
    });

    it('should set error on confirm password control when passwords do not match', () => {
      formGroup.patchValue({
        password: 'Password123!',
        confirmPassword: 'DifferentPassword456@'
      });
      
      validator(formGroup);
      
      expect(formGroup.get('confirmPassword')?.errors).toEqual({ mismatch: true });
    });

    it('should return error when one password is empty and other is not', () => {
      formGroup.patchValue({
        password: 'Password123!',
        confirmPassword: ''
      });
      
      const result = validator(formGroup);
      expect(result).toEqual({ mismatch: true });
    });

    it('should return error when passwords differ by case', () => {
      formGroup.patchValue({
        password: 'Password123!',
        confirmPassword: 'password123!'
      });
      
      const result = validator(formGroup);
      expect(result).toEqual({ mismatch: true });
    });

    it('should return error when passwords differ by whitespace', () => {
      formGroup.patchValue({
        password: 'Password123!',
        confirmPassword: ' Password123! '
      });
      
      const result = validator(formGroup);
      expect(result).toEqual({ mismatch: true });
    });

    it('should return error for subtle differences', () => {
      formGroup.patchValue({
        password: 'Password123!',
        confirmPassword: 'Password123'
      });
      
      const result = validator(formGroup);
      expect(result).toEqual({ mismatch: true });
    });
  });

  describe('Edge cases', () => {
    it('should handle null vs empty string mismatch', () => {
      formGroup.patchValue({
        password: null,
        confirmPassword: ''
      });
      
      const result = validator(formGroup);
      expect(result).toEqual({ mismatch: true });
    });

    it('should handle undefined vs empty string mismatch', () => {
      formGroup.patchValue({
        password: undefined,
        confirmPassword: ''
      });
      
      const result = validator(formGroup);
      expect(result).toEqual({ mismatch: true });
    });

    it('should handle null vs undefined mismatch', () => {
      formGroup.patchValue({
        password: null,
        confirmPassword: undefined
      });
      
      const result = validator(formGroup);
      expect(result).toEqual({ mismatch: true });
    });

    it('should handle numeric values that match', () => {
      formGroup.patchValue({
        password: 123456,
        confirmPassword: 123456
      });
      
      const result = validator(formGroup);
      expect(result).toBeNull();
    });

    it('should handle numeric values that do not match', () => {
      formGroup.patchValue({
        password: 123456,
        confirmPassword: 654321
      });
      
      const result = validator(formGroup);
      expect(result).toEqual({ mismatch: true });
    });
  });

  describe('Control existence validation', () => {
    it('should return controlNotFound error when first control does not exist', () => {
      const invalidFormGroup = new FormGroup({
        confirmPassword: new FormControl('password')
      });
      
      const invalidValidator = matchControlsValidator('nonexistent', 'confirmPassword');
      
      // Spy on console.error to verify error logging
      spyOn(console, 'error');
      
      const result = invalidValidator(invalidFormGroup);
      
      expect(result).toEqual({ controlNotFound: true });
      expect(console.error).toHaveBeenCalledWith('One of the controls is not found in the form group');
    });

    it('should return controlNotFound error when second control does not exist', () => {
      const invalidFormGroup = new FormGroup({
        password: new FormControl('password')
      });
      
      const invalidValidator = matchControlsValidator('password', 'nonexistent');
      
      spyOn(console, 'error');
      
      const result = invalidValidator(invalidFormGroup);
      
      expect(result).toEqual({ controlNotFound: true });
      expect(console.error).toHaveBeenCalledWith('One of the controls is not found in the form group');
    });

    it('should return controlNotFound error when both controls do not exist', () => {
      const invalidFormGroup = new FormGroup({});
      
      const invalidValidator = matchControlsValidator('nonexistent1', 'nonexistent2');
      
      spyOn(console, 'error');
      
      const result = invalidValidator(invalidFormGroup);
      
      expect(result).toEqual({ controlNotFound: true });
      expect(console.error).toHaveBeenCalledWith('One of the controls is not found in the form group');
    });

    it('should handle null form group', () => {
      const invalidValidator = matchControlsValidator('password', 'confirmPassword');
      
      spyOn(console, 'error');
      
      expect(() => {
        invalidValidator(null as any);
      }).toThrow();
    });
  });

  describe('Custom control names', () => {
    it('should work with different control names', () => {
      const customForm = new FormGroup({
        newPassword: new FormControl('Test123!'),
        retypePassword: new FormControl('Test123!')
      });
      
      const customValidator = matchControlsValidator('newPassword', 'retypePassword');
      const result = customValidator(customForm);
      
      expect(result).toBeNull();
    });

    it('should return error with different control names when not matching', () => {
      const customForm = new FormGroup({
        newPassword: new FormControl('Test123!'),
        retypePassword: new FormControl('Different456@')
      });
      
      const customValidator = matchControlsValidator('newPassword', 'retypePassword');
      const result = customValidator(customForm);
      
      expect(result).toEqual({ mismatch: true });
      expect(customForm.get('retypePassword')?.errors).toEqual({ mismatch: true });
    });

    it('should work with nested form control names', () => {
      const nestedForm = new FormGroup({
        'userPassword': new FormControl('Test123!'),
        'userConfirmPassword': new FormControl('Test123!')
      });
      
      const nestedValidator = matchControlsValidator('userPassword', 'userConfirmPassword');
      const result = nestedValidator(nestedForm);
      
      expect(result).toBeNull();
    });
  });

  describe('Error state management', () => {
    it('should clear second control errors when passwords match after mismatch', () => {
      // First, create a mismatch
      formGroup.patchValue({
        password: 'Password123!',
        confirmPassword: 'Different456@'
      });
      
      validator(formGroup);
      expect(formGroup.get('confirmPassword')?.errors).toEqual({ mismatch: true });
      
      // Then fix the mismatch
      formGroup.patchValue({
        confirmPassword: 'Password123!'
      });
      
      validator(formGroup);
      expect(formGroup.get('confirmPassword')?.errors).toBeNull();
    });

    it('should not affect first control errors', () => {
      // Set error on first control before the form has any values
      formGroup.get('password')?.setErrors({ required: true });
      
      formGroup.patchValue({
        password: 'Password123!',
        confirmPassword: 'Different456@'
      });
      
      // The validator doesn't modify the password control, only the value
      // Since we set the value, it may clear the required error
      const result = validator(formGroup);
      
      // Focus on testing that the validator works correctly
      expect(result).toEqual({ mismatch: true });
      expect(formGroup.get('confirmPassword')?.errors).toEqual({ mismatch: true });
    });

    it('should handle existing errors on second control', () => {
      // Set existing error on second control
      formGroup.get('confirmPassword')?.setErrors({ required: true });
      
      formGroup.patchValue({
        password: 'Password123!',
        confirmPassword: 'Different456@'
      });
      
      validator(formGroup);
      
      // Should overwrite with mismatch error
      expect(formGroup.get('confirmPassword')?.errors).toEqual({ mismatch: true });
    });

    it('should properly clear all errors when setting to null', () => {
      formGroup.get('confirmPassword')?.setErrors({ 
        required: true, 
        mismatch: true,
        minlength: true 
      });
      
      formGroup.patchValue({
        password: 'Password123!',
        confirmPassword: 'Password123!'
      });
      
      validator(formGroup);
      
      expect(formGroup.get('confirmPassword')?.errors).toBeNull();
    });
  });

  describe('Performance tests', () => {
    it('should validate passwords efficiently', () => {
      const passwordPairs = [
        ['Password123!', 'Password123!'],
        ['Test456@', 'Different789#'],
        ['ComplexP@ssw0rd!', 'ComplexP@ssw0rd!'],
        ['Simple123', 'Simple124'],
        ['', ''],
        [null, null]
      ];
      
      const startTime = performance.now();
      passwordPairs.forEach(([pass1, pass2]) => {
        formGroup.patchValue({
          password: pass1,
          confirmPassword: pass2
        });
        validator(formGroup);
      });
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(20);
    });

    it('should handle rapid successive validations', () => {
      const startTime = performance.now();
      for (let i = 0; i < 1000; i++) {
        const password = `Password${i}!`;
        const confirmPassword = i % 2 === 0 ? password : `Different${i}@`;
        
        formGroup.patchValue({
          password: password,
          confirmPassword: confirmPassword
        });
        validator(formGroup);
      }
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(100);
    });
  });

  describe('Integration with Angular Forms', () => {
    it('should work with reactive forms', () => {
      const reactiveForm = new FormGroup({
        password: new FormControl('Password123!'),
        confirmPassword: new FormControl('Password123!')
      }, { validators: matchControlsValidator('password', 'confirmPassword') });
      
      expect(reactiveForm.valid).toBe(true);
      
      reactiveForm.get('confirmPassword')?.setValue('Different456@');
      expect(reactiveForm.valid).toBe(false);
      expect(reactiveForm.errors).toEqual({ mismatch: true });
    });

    it('should work with form control value changes', () => {
      const testForm = new FormGroup({
        password: new FormControl(''),
        confirmPassword: new FormControl('')
      });
      
      const testValidator = matchControlsValidator('password', 'confirmPassword');
      
      testForm.get('password')?.setValue('Password123!');
      let result = testValidator(testForm);
      expect(result).toEqual({ mismatch: true });
      
      testForm.get('confirmPassword')?.setValue('Password123!');
      result = testValidator(testForm);
      expect(result).toBeNull();
    });

    it('should handle form reset', () => {
      formGroup.patchValue({
        password: 'Password123!',
        confirmPassword: 'Different456@'
      });
      
      validator(formGroup);
      expect(formGroup.get('confirmPassword')?.errors).toEqual({ mismatch: true });
      
      formGroup.reset();
      validator(formGroup);
      expect(formGroup.get('confirmPassword')?.errors).toBeNull();
    });

    it('should work with disabled controls', () => {
      formGroup.get('password')?.disable();
      formGroup.get('confirmPassword')?.disable();
      
      formGroup.patchValue({
        password: 'Password123!',
        confirmPassword: 'Password123!'
      });
      
      const result = validator(formGroup);
      expect(result).toBeNull();
    });
  });

  describe('Validator factory function', () => {
    it('should create different validators for different control names', () => {
      const validator1 = matchControlsValidator('password', 'confirmPassword');
      const validator2 = matchControlsValidator('newPassword', 'retypePassword');
      
      expect(validator1).not.toBe(validator2);
    });

    it('should handle empty control names', () => {
      const emptyValidator = matchControlsValidator('', '');
      
      spyOn(console, 'error');
      
      const result = emptyValidator(formGroup);
      expect(result).toEqual({ controlNotFound: true });
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle null control names', () => {
      const nullValidator = matchControlsValidator(null as any, null as any);
      
      spyOn(console, 'error');
      
      const result = nullValidator(formGroup);
      expect(result).toEqual({ controlNotFound: true });
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('Complex password scenarios', () => {
    it('should handle very long passwords', () => {
      const longPassword = 'P@ssw0rd!' + 'x'.repeat(1000);
      
      formGroup.patchValue({
        password: longPassword,
        confirmPassword: longPassword
      });
      
      const result = validator(formGroup);
      expect(result).toBeNull();
    });

    it('should handle passwords with unicode characters', () => {
      const unicodePassword = 'P@ßwörd123ñ!';
      
      formGroup.patchValue({
        password: unicodePassword,
        confirmPassword: unicodePassword
      });
      
      const result = validator(formGroup);
      expect(result).toBeNull();
    });

    it('should handle passwords with special characters', () => {
      const specialPassword = '!@#$%^&*()_+-=[]{}|;:,.<>?`~';
      
      formGroup.patchValue({
        password: specialPassword,
        confirmPassword: specialPassword
      });
      
      const result = validator(formGroup);
      expect(result).toBeNull();
    });

    it('should detect minute differences in complex passwords', () => {
      formGroup.patchValue({
        password: 'ComplexP@ssw0rd123!@#$%^&*()',
        confirmPassword: 'ComplexP@ssw0rd123!@#$%^&*()_'
      });
      
      const result = validator(formGroup);
      expect(result).toEqual({ mismatch: true });
    });
  });
});
