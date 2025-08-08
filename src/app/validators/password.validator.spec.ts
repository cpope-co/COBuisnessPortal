import { FormControl } from '@angular/forms';
import { passwordValidator } from './password.validator';

describe('PasswordValidator', () => {
  let validator: any;

  beforeEach(() => {
    validator = passwordValidator();
  });

  describe('Required validation', () => {
    it('should return required error for null value', () => {
      const control = new FormControl(null);
      const result = validator(control);
      
      expect(result).toEqual({ required: true });
    });

    it('should return required error for undefined value', () => {
      const control = new FormControl(undefined);
      const result = validator(control);
      
      expect(result).toEqual({ required: true });
    });

    it('should return required error for empty string', () => {
      const control = new FormControl('');
      const result = validator(control);
      
      expect(result).toEqual({ required: true });
    });
  });

  describe('Length validation', () => {
    it('should return tooShort error for password with 9 characters', () => {
      const control = new FormControl('Password1');
      const result = validator(control);
      
      expect(result).toEqual(jasmine.objectContaining({ tooShort: true }));
    });

    it('should not return tooShort error for password with exactly 10 characters', () => {
      const control = new FormControl('Password1!');
      const result = validator(control);
      
      expect(result).not.toEqual(jasmine.objectContaining({ tooShort: true }));
    });

    it('should not return tooLong error for password with exactly 32 characters', () => {
      const control = new FormControl('Password1!abcdefghijklmnopqrst');
      const result = validator(control);
      
      expect(result).not.toEqual(jasmine.objectContaining({ tooLong: true }));
    });

    it('should return tooLong error for password with 33 characters', () => {
      const control = new FormControl('Password1!abcdefghijklmnopqrstuvw'); // 33 chars
      const result = validator(control);
      
      expect(result).toEqual(jasmine.objectContaining({ tooLong: true }));
    });

    it('should return tooLong error for password with 50 characters', () => {
      const control = new FormControl('Password1!abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMN');
      const result = validator(control);
      
      expect(result).toEqual(jasmine.objectContaining({ tooLong: true }));
    });
  });

  describe('Character requirements validation', () => {
    it('should return missingUppercase error when no uppercase letters', () => {
      const control = new FormControl('password1!');
      const result = validator(control);
      
      expect(result).toEqual(jasmine.objectContaining({ missingUppercase: true }));
    });

    it('should return missingLowercase error when no lowercase letters', () => {
      const control = new FormControl('PASSWORD1!');
      const result = validator(control);
      
      expect(result).toEqual(jasmine.objectContaining({ missingLowercase: true }));
    });

    it('should return missingNumber error when no numbers', () => {
      const control = new FormControl('Password!');
      const result = validator(control);
      
      expect(result).toEqual(jasmine.objectContaining({ missingNumber: true }));
    });

    it('should return missingSpecialCharacter error when no special characters', () => {
      const control = new FormControl('Password1');
      const result = validator(control);
      
      expect(result).toEqual(jasmine.objectContaining({ missingSpecialCharacter: true }));
    });

    it('should accept various special characters', () => {
      const specialChars = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '-', '+', '=', '{', '}', '[', ']', '|', '\\', ':', ';', '"', "'", '<', '>', ',', '.', '?', '/', '~', '`', ' '];
      
      specialChars.forEach(char => {
        const control = new FormControl(`Password1${char}`);
        const result = validator(control);
        
        expect(result).not.toEqual(jasmine.objectContaining({ missingSpecialCharacter: true }));
      });
    });
  });

  describe('Multiple validation errors', () => {
    it('should return multiple errors for password that fails multiple requirements', () => {
      const control = new FormControl('pass');
      const result = validator(control);
      
      expect(result).toEqual({
        tooShort: true,
        missingUppercase: true,
        missingNumber: true,
        missingSpecialCharacter: true
      });
    });

    it('should return all possible errors for empty string', () => {
      const control = new FormControl('');
      const result = validator(control);
      
      expect(result).toEqual({ required: true });
    });

    it('should return length and character errors for short password', () => {
      const control = new FormControl('abc');
      const result = validator(control);
      
      expect(result).toEqual({
        tooShort: true,
        missingUppercase: true,
        missingNumber: true,
        missingSpecialCharacter: true
      });
    });
  });

  describe('Valid passwords', () => {
    it('should return null for valid password with minimum requirements', () => {
      const control = new FormControl('Password1!');
      const result = validator(control);
      
      expect(result).toBeNull();
    });

    it('should return null for complex valid password', () => {
      const control = new FormControl('MySecureP@ssw0rd123');
      const result = validator(control);
      
      expect(result).toBeNull();
    });

    it('should return null for password with multiple special characters', () => {
      const control = new FormControl('P@ssw0rd!#$%');
      const result = validator(control);
      
      expect(result).toBeNull();
    });

    it('should return null for password with mixed case and numbers', () => {
      const control = new FormControl('MyPassword123!');
      const result = validator(control);
      
      expect(result).toBeNull();
    });

    it('should return null for maximum length valid password', () => {
      const control = new FormControl('P@ssw0rd123456789012345678901234');
      const result = validator(control);
      
      expect(result).toBeNull();
    });
  });

  describe('Edge cases', () => {
    it('should handle whitespace in password', () => {
      const control = new FormControl('Password 1!');
      const result = validator(control);
      
      expect(result).toBeNull();
    });

    it('should handle unicode characters', () => {
      const control = new FormControl('Pässwörd1!');
      const result = validator(control);
      
      expect(result).toBeNull();
    });

    it('should handle password with only whitespace', () => {
      const control = new FormControl('          ');
      const result = validator(control);
      
      expect(result).toEqual({
        missingUppercase: true,
        missingLowercase: true,
        missingNumber: true
      });
    });

    it('should handle password starting and ending with special characters', () => {
      const control = new FormControl('!Password1@');
      const result = validator(control);
      
      expect(result).toBeNull();
    });

    it('should handle password with consecutive special characters', () => {
      const control = new FormControl('Password1!@#$');
      const result = validator(control);
      
      expect(result).toBeNull();
    });
  });

  describe('Performance and stress tests', () => {
    it('should handle very long invalid password efficiently', () => {
      const longPassword = 'a'.repeat(1000);
      const control = new FormControl(longPassword);
      
      const startTime = performance.now();
      const result = validator(control);
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(10);
      expect(result).toEqual(jasmine.objectContaining({ tooLong: true }));
    });

    it('should handle rapid successive validations', () => {
      const passwords = [
        'Password1!',
        'invalid',
        'TooShort1!',
        'ValidPassword123@',
        'ALLMISSING',
        'lowercase123!'
      ];
      
      const startTime = performance.now();
      passwords.forEach(password => {
        const control = new FormControl(password);
        validator(control);
      });
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(50);
    });
  });

  describe('Integration with FormControl', () => {
    it('should work with FormControl setValue', () => {
      const control = new FormControl('');
      control.setValue('Password1!');
      
      const result = validator(control);
      expect(result).toBeNull();
    });

    it('should work with FormControl patchValue', () => {
      const control = new FormControl('invalid');
      control.patchValue('ValidPassword1!');
      
      const result = validator(control);
      expect(result).toBeNull();
    });

    it('should validate when control value changes', () => {
      const control = new FormControl('invalid');
      let result = validator(control);
      expect(result).not.toBeNull();
      
      control.setValue('ValidPassword1!');
      result = validator(control);
      expect(result).toBeNull();
    });
  });

  describe('Regular expression edge cases', () => {
    it('should correctly identify uppercase letters with accents', () => {
      const control = new FormControl('ÀÁÂÃÄÅÆÇÈÉ1!');
      const result = validator(control);
      
      // The [A-Z] regex only matches basic Latin uppercase letters
      expect(result).toEqual(jasmine.objectContaining({ missingUppercase: true }));
    });

    it('should correctly identify lowercase letters with accents', () => {
      const control = new FormControl('àáâãäåæçèé1!');
      const result = validator(control);
      
      // The [a-z] regex only matches basic Latin lowercase letters
      expect(result).toEqual(jasmine.objectContaining({ missingLowercase: true }));
    });

    it('should handle numbers in different positions', () => {
      const passwords = ['1Password!', 'Pass1word!', 'Password1!'];
      
      passwords.forEach(password => {
        const control = new FormControl(password);
        const result = validator(control);
        
        expect(result).not.toEqual(jasmine.objectContaining({ missingNumber: true }));
      });
    });

    it('should handle underscore as special character', () => {
      const control = new FormControl('Password1_');
      const result = validator(control);
      
      // \W does not match underscore (underscore is a word character)
      expect(result).toEqual(jasmine.objectContaining({ missingSpecialCharacter: true }));
    });
  });
});
