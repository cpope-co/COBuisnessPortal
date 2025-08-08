import { FormControl } from '@angular/forms';
import { phoneNumberValidator } from './phoneNumber.validator';

describe('PhoneNumberValidator', () => {
  let validator: any;

  beforeEach(() => {
    validator = phoneNumberValidator();
  });

  describe('Valid phone number formats', () => {
    it('should return null for valid phone number format', () => {
      const control = new FormControl('123-456-7890');
      const result = validator(control);
      
      expect(result).toBeNull();
    });

    it('should return null for phone number with all zeros', () => {
      const control = new FormControl('000-000-0000');
      const result = validator(control);
      
      expect(result).toBeNull();
    });

    it('should return null for phone number with all nines', () => {
      const control = new FormControl('999-999-9999');
      const result = validator(control);
      
      expect(result).toBeNull();
    });

    it('should return null for mixed digit phone number', () => {
      const control = new FormControl('555-123-9876');
      const result = validator(control);
      
      expect(result).toBeNull();
    });

    it('should return null for phone number starting with 1', () => {
      const control = new FormControl('111-222-3333');
      const result = validator(control);
      
      expect(result).toBeNull();
    });
  });

  describe('Invalid phone number formats', () => {
    it('should return error for phone number without dashes', () => {
      const control = new FormControl('1234567890');
      const result = validator(control);
      
      expect(result).toEqual({ invalidPhoneNumber: { value: '1234567890' } });
    });

    it('should return error for phone number with spaces instead of dashes', () => {
      const control = new FormControl('123 456 7890');
      const result = validator(control);
      
      expect(result).toEqual({ invalidPhoneNumber: { value: '123 456 7890' } });
    });

    it('should return error for phone number with dots', () => {
      const control = new FormControl('123.456.7890');
      const result = validator(control);
      
      expect(result).toEqual({ invalidPhoneNumber: { value: '123.456.7890' } });
    });

    it('should return error for phone number with parentheses', () => {
      const control = new FormControl('(123) 456-7890');
      const result = validator(control);
      
      expect(result).toEqual({ invalidPhoneNumber: { value: '(123) 456-7890' } });
    });

    it('should return error for phone number with country code', () => {
      const control = new FormControl('+1-123-456-7890');
      const result = validator(control);
      
      expect(result).toEqual({ invalidPhoneNumber: { value: '+1-123-456-7890' } });
    });

    it('should return error for phone number with extension', () => {
      const control = new FormControl('123-456-7890 ext 123');
      const result = validator(control);
      
      expect(result).toEqual({ invalidPhoneNumber: { value: '123-456-7890 ext 123' } });
    });
  });

  describe('Invalid length', () => {
    it('should return error for phone number too short', () => {
      const control = new FormControl('123-456-789');
      const result = validator(control);
      
      expect(result).toEqual({ invalidPhoneNumber: { value: '123-456-789' } });
    });

    it('should return error for phone number too long', () => {
      const control = new FormControl('123-456-78901');
      const result = validator(control);
      
      expect(result).toEqual({ invalidPhoneNumber: { value: '123-456-78901' } });
    });

    it('should return error for missing area code', () => {
      const control = new FormControl('-456-7890');
      const result = validator(control);
      
      expect(result).toEqual({ invalidPhoneNumber: { value: '-456-7890' } });
    });

    it('should return error for missing exchange', () => {
      const control = new FormControl('123--7890');
      const result = validator(control);
      
      expect(result).toEqual({ invalidPhoneNumber: { value: '123--7890' } });
    });

    it('should return error for missing number', () => {
      const control = new FormControl('123-456-');
      const result = validator(control);
      
      expect(result).toEqual({ invalidPhoneNumber: { value: '123-456-' } });
    });
  });

  describe('Non-numeric characters', () => {
    it('should return error for phone number with letters', () => {
      const control = new FormControl('abc-def-ghij');
      const result = validator(control);
      
      expect(result).toEqual({ invalidPhoneNumber: { value: 'abc-def-ghij' } });
    });

    it('should return error for phone number with mixed letters and numbers', () => {
      const control = new FormControl('123-abc-7890');
      const result = validator(control);
      
      expect(result).toEqual({ invalidPhoneNumber: { value: '123-abc-7890' } });
    });

    it('should return error for phone number with special characters', () => {
      const control = new FormControl('123-45@-7890');
      const result = validator(control);
      
      expect(result).toEqual({ invalidPhoneNumber: { value: '123-45@-7890' } });
    });

    it('should return error for phone number with unicode characters', () => {
      const control = new FormControl('123-456-789ñ');
      const result = validator(control);
      
      expect(result).toEqual({ invalidPhoneNumber: { value: '123-456-789ñ' } });
    });
  });

  describe('Empty and null values', () => {
    it('should return error for null value', () => {
      const control = new FormControl(null);
      const result = validator(control);
      
      expect(result).toEqual({ invalidPhoneNumber: { value: null } });
    });

    it('should return error for undefined value', () => {
      const control = new FormControl(undefined);
      const result = validator(control);
      
      expect(result).toEqual({ invalidPhoneNumber: { value: null } });
    });

    it('should return error for empty string', () => {
      const control = new FormControl('');
      const result = validator(control);
      
      expect(result).toEqual({ invalidPhoneNumber: { value: '' } });
    });

    it('should return error for whitespace only', () => {
      const control = new FormControl('   ');
      const result = validator(control);
      
      expect(result).toEqual({ invalidPhoneNumber: { value: '   ' } });
    });
  });

  describe('Edge cases with dashes', () => {
    it('should return error for phone number with wrong dash positions', () => {
      const control = new FormControl('12-3456-7890');
      const result = validator(control);
      
      expect(result).toEqual({ invalidPhoneNumber: { value: '12-3456-7890' } });
    });

    it('should return error for phone number with multiple consecutive dashes', () => {
      const control = new FormControl('123--456-7890');
      const result = validator(control);
      
      expect(result).toEqual({ invalidPhoneNumber: { value: '123--456-7890' } });
    });

    it('should return error for phone number starting with dash', () => {
      const control = new FormControl('-123-456-7890');
      const result = validator(control);
      
      expect(result).toEqual({ invalidPhoneNumber: { value: '-123-456-7890' } });
    });

    it('should return error for phone number ending with dash', () => {
      const control = new FormControl('123-456-7890-');
      const result = validator(control);
      
      expect(result).toEqual({ invalidPhoneNumber: { value: '123-456-7890-' } });
    });

    it('should return error for phone number with only dashes', () => {
      const control = new FormControl('---');
      const result = validator(control);
      
      expect(result).toEqual({ invalidPhoneNumber: { value: '---' } });
    });
  });

  describe('Boundary testing', () => {
    it('should validate each digit position in area code', () => {
      for (let i = 0; i <= 9; i++) {
        const phoneNumber = `${i}23-456-7890`;
        const control = new FormControl(phoneNumber);
        const result = validator(control);
        
        expect(result).toBeNull();
      }
    });

    it('should validate each digit position in exchange', () => {
      for (let i = 0; i <= 9; i++) {
        const phoneNumber = `123-${i}56-7890`;
        const control = new FormControl(phoneNumber);
        const result = validator(control);
        
        expect(result).toBeNull();
      }
    });

    it('should validate each digit position in number', () => {
      for (let i = 0; i <= 9; i++) {
        const phoneNumber = `123-456-${i}890`;
        const control = new FormControl(phoneNumber);
        const result = validator(control);
        
        expect(result).toBeNull();
      }
    });
  });

  describe('Performance tests', () => {
    it('should validate phone numbers efficiently', () => {
      const phoneNumbers = [
        '123-456-7890',
        '555-123-4567',
        '999-888-7777',
        'invalid-phone',
        '123-456-789',
        '(123) 456-7890'
      ];
      
      const startTime = performance.now();
      phoneNumbers.forEach(phone => {
        const control = new FormControl(phone);
        validator(control);
      });
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(10);
    });

    it('should handle rapid successive validations', () => {
      const control = new FormControl('');
      
      const startTime = performance.now();
      for (let i = 0; i < 1000; i++) {
        control.setValue(`${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`);
        validator(control);
      }
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(100);
    });
  });

  describe('Integration with FormControl', () => {
    it('should work with FormControl setValue', () => {
      const control = new FormControl('');
      control.setValue('123-456-7890');
      
      const result = validator(control);
      expect(result).toBeNull();
    });

    it('should work with FormControl patchValue', () => {
      const control = new FormControl('invalid');
      control.patchValue('555-123-4567');
      
      const result = validator(control);
      expect(result).toBeNull();
    });

    it('should validate when control value changes', () => {
      const control = new FormControl('invalid');
      let result = validator(control);
      expect(result).not.toBeNull();
      
      control.setValue('123-456-7890');
      result = validator(control);
      expect(result).toBeNull();
    });

    it('should preserve original value in error object', () => {
      const invalidValue = 'not-a-phone';
      const control = new FormControl(invalidValue);
      const result = validator(control);
      
      expect(result).toEqual({ invalidPhoneNumber: { value: invalidValue } });
    });
  });

  describe('Regular expression validation', () => {
    it('should strictly enforce 3-3-4 digit pattern', () => {
      const invalidPatterns = [
        '1-456-7890',     // 1 digit area code
        '12-456-7890',    // 2 digit area code
        '1234-456-7890',  // 4 digit area code
        '123-1-7890',     // 1 digit exchange
        '123-12-7890',    // 2 digit exchange
        '123-1234-7890',  // 4 digit exchange
        '123-456-1',      // 1 digit number
        '123-456-12',     // 2 digit number
        '123-456-123',    // 3 digit number
        '123-456-12345'   // 5 digit number
      ];
      
      invalidPatterns.forEach(pattern => {
        const control = new FormControl(pattern);
        const result = validator(control);
        
        expect(result).toEqual({ invalidPhoneNumber: { value: pattern } });
      });
    });

    it('should not accept patterns with leading/trailing whitespace', () => {
      const control = new FormControl(' 123-456-7890 ');
      const result = validator(control);
      
      expect(result).toEqual({ invalidPhoneNumber: { value: ' 123-456-7890 ' } });
    });
  });
});
