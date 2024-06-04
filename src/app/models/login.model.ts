import { Validators } from "@angular/forms";
import { FormHandling } from "./form-handling.model";

export type Login = {
    email: FormHandling;
    password: FormHandling;
}

export const login: Login = {
    email: {
        Validators: [Validators.email, Validators.required],
        ErrorMessages: ['Please enter a valid email address.'],
        value: ''
    },
    password: {
        Validators: [Validators.required],
        ErrorMessages: ['Please enter a password.'],
        value: ''
    }
}