import { Validators } from "@angular/forms";
import { SignalFormConfig } from "./signal-form-handling.model";

/**
 * Data interface for login form using signal forms
 */
export interface LoginData {
    email: string;
    password: string;
}

/**
 * Signal form configuration for login form
 * Defines validators and error messages for each field
 */
export const loginSignal: SignalFormConfig<LoginData> = {
    email: {
        Validators: [Validators.email, Validators.required],
        ErrorMessages: { 
            'email': 'Please enter a valid email address.', 
            'required': 'Please enter your email address.'
        }
    },
    password: {
        Validators: [Validators.required],
        ErrorMessages: { 
            'required': 'Please enter your password.'
        }
    }
}
