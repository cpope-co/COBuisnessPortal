import { Validators } from "@angular/forms";
import { FormHandling } from "./form-handling.model";

export type Login = {
    email: FormHandling;
    password: FormHandling;
}

export const login: Login = {
    email: {
        Validators: [Validators.email, Validators.required],
        ErrorMessages: { 'email': 'Please enter a valid email address.', 'required': 'Please enter your email address.'},
        value: ''
    },
    password: {
        Validators: [Validators.required],
        ErrorMessages: { 'required': 'Please enter your password.'},
        value: ''
    }
}