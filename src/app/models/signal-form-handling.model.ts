import { ValidatorFn } from "@angular/forms";

/**
 * Simplified form field configuration for signal forms.
 * Removes 'value' field as signal forms manage state via signals.
 */
export type SignalFormHandling = {
    /** Array of validator functions to apply to this field */
    Validators: ValidatorFn[];
    
    /** Map of validator error keys to user-friendly error messages */
    ErrorMessages: { [key: string]: string };
    
    /** Optional nested form group configuration */
    formGroup?: {
        name: string;
        validators?: ValidatorFn[];
    }
}

/**
 * Configuration object for a signal form, mapping field names to their configurations
 */
export type SignalFormConfig<T> = {
    [K in keyof T]: SignalFormHandling;
}
