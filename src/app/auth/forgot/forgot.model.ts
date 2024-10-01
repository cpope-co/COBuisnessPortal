import { FormHandling } from "../../models/form-handling.model";

export type Forgot = {
    email: FormHandling;
}

const errorMessages = {
    required: 'Email is required',
    invalid: 'Email is invalid'
}

export const forgot: Forgot = {
    email: {
        Validators: [],
        ErrorMessages: errorMessages,
        value: ''
    }
}