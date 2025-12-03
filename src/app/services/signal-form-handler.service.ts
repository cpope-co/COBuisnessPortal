import { Injectable, signal } from '@angular/core';
import { form, required, email, minLength, maxLength, pattern } from '@angular/forms/signals';
import { SignalFormConfig } from '../models/signal-form-handling.model';
import { Validators, ValidatorFn } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class SignalFormHandlerService {

  /**
   * Creates a signal-based form from a configuration object
   * @param modelConfig Configuration object mapping field names to validators and error messages
   * @param initialData Initial values for the form fields
   * @returns A signal form instance with type-safe field access
   */
  createSignalForm<T extends Record<string, any>>(
    modelConfig: SignalFormConfig<T>,
    initialData: T
  ) {
    // Create the model signal
    const model = signal<T>(initialData);
    
    // Create the form from the model signal
    const formInstance = form(model, (schemaPath: any) => {
      Object.keys(modelConfig).forEach((fieldName) => {
        const fieldConfig = modelConfig[fieldName as keyof T];
        const fieldPath = schemaPath[fieldName as keyof T];
        
        // Apply each validator with its corresponding error message
        fieldConfig.Validators.forEach((validator: ValidatorFn) => {
          const validatorName = this.getValidatorName(validator);
          const errorMessage = fieldConfig.ErrorMessages[validatorName] || `${fieldName} is invalid`;
          
          // Map common validators to their signal form equivalents
          this.applyValidator(fieldPath, validator, errorMessage);
        });
      });
    });
    
    // Return an object with both the form and model for easy access
    return {
      form: formInstance,
      model: model
    };
  }

  /**
   * Extract validator name from ValidatorFn for error message mapping
   */
  private getValidatorName(validator: ValidatorFn): string {
    // Check for common Angular validators by comparing function references
    if (validator === Validators.required) return 'required';
    if (validator === Validators.email) return 'email';
    
    // For bound validators (e.g., minLength(5)), check the validator function name
    const validatorStr = validator.toString();
    if (validatorStr.includes('minLength')) return 'minLength';
    if (validatorStr.includes('maxLength')) return 'maxLength';
    if (validatorStr.includes('pattern')) return 'pattern';
    if (validatorStr.includes('min') && !validatorStr.includes('minLength')) return 'min';
    if (validatorStr.includes('max') && !validatorStr.includes('maxLength')) return 'max';
    
    return 'invalid';
  }

  /**
   * Apply validator to field path using signal forms validation functions
   */
  private applyValidator(fieldPath: any, validator: ValidatorFn, errorMessage: string): void {
    const validatorName = this.getValidatorName(validator);
    
    switch (validatorName) {
      case 'required':
        required(fieldPath, { message: errorMessage });
        break;
      case 'email':
        email(fieldPath, { message: errorMessage });
        break;
      case 'minLength':
        // Extract length from validator
        const minLengthMatch = validator.toString().match(/minLength[^\d]*(\d+)/);
        if (minLengthMatch) {
          minLength(fieldPath, parseInt(minLengthMatch[1]), { message: errorMessage });
        }
        break;
      case 'maxLength':
        const maxLengthMatch = validator.toString().match(/maxLength[^\d]*(\d+)/);
        if (maxLengthMatch) {
          maxLength(fieldPath, parseInt(maxLengthMatch[1]), { message: errorMessage });
        }
        break;
      case 'pattern':
        const patternMatch = validator.toString().match(/pattern[^\w]*([\/\w\^\$\.\*\+\?\[\]\{\}\(\)\|\\-]+)/);
        if (patternMatch) {
          pattern(fieldPath, new RegExp(patternMatch[1]), { message: errorMessage });
        }
        break;
      default:
        // For custom validators, we'd need a different approach
        console.warn(`Validator ${validatorName} not yet supported in signal forms`);
    }
  }

  /**
   * Get error message for a field from its state
   * @param field Field from signal form (call it to get state)
   * @returns Error message string or empty string if no errors
   */
  getErrorMessage(field: any): string {
    const fieldState = field();
    const errors = fieldState.errors();
    if (errors && errors.length > 0) {
      return errors[0].message || 'Field is invalid';
    }
    return '';
  }

  /**
   * Check if a field should display as invalid (touched and has errors)
   * @param field Field state from signal form (call the field to get its state)
   * @returns True if field should show error state
   */
  isFieldInvalid(field: any): boolean {
    const fieldState = field();
    return fieldState.touched() && fieldState.invalid();
  }

  /**
   * Check if entire form is valid by checking all field states
   * @param formFields The form field tree (e.g., loginForm)
   * @returns True if all fields are valid
   */
  isFormValid(formFields: any): boolean {
    // Get all keys from the form field tree
    const fieldKeys = Object.keys(formFields);
    
    // Check each field's validity
    return fieldKeys.every(key => {
      const field = formFields[key];
      // Skip non-field properties (like model, etc)
      if (typeof field !== 'function') return true;
      
      // Call the field to get its state, then check validity
      const fieldState = field();
      return fieldState.valid();
    });
  }

  /**
   * Mark all fields as touched (useful for form submission validation)
   * @param formFields Object containing all field states
   */
  markAllAsTouched(formFields: Record<string, any>): void {
    Object.values(formFields).forEach(field => {
      if (field.touched) {
        // Signal forms don't have a direct markAsTouched, 
        // but touching happens automatically on blur
        // This is a placeholder for potential future API
      }
    });
  }
}
