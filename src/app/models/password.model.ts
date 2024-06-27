import { FormHandling } from "./form-handling.model";
import { passwordValidator } from "../validators/password.validator";

export type SetPassword = {
    password: FormHandling;
    confirmPassword: FormHandling;
}

export type ChangePassword = {
    oldPassword: FormHandling;
    newPassword: FormHandling;
    confirmPassword: FormHandling;
}

const errorMessages = {
    required: 'Current password is required',
      tooShort: 'Current password is too short',
      tooLong: 'Current password is too long',
      missingUppercase: 'Current password must contain at least one uppercase letter',
      missingLowercase: 'Current password must contain at least one lowercase letter',
      missingNumber: 'Current password must contain at least one number',
      missingSpecialCharacter: 'Current password must contain at least one special character',
      mismatch: 'Passwords do not match'
}

export const setPassword: SetPassword = {
    password: {
        Validators: [passwordValidator()],
        ErrorMessages: errorMessages,
        value: ''
    },
    confirmPassword: {
        Validators: [passwordValidator()],
        ErrorMessages: errorMessages,
        value: ''
    }
}

export const changePassword: ChangePassword = {
    oldPassword: {
        Validators: [passwordValidator()],
        ErrorMessages: errorMessages,
        value: ''
    },
    newPassword: {
        Validators: [passwordValidator()],
        ErrorMessages: errorMessages,
        value: '',
        formGroup: {
            name: 'matchPasswords'
        }
    },
    confirmPassword: {
        Validators: [passwordValidator()],
        ErrorMessages: errorMessages,
        value: '',
        formGroup: {
            name: 'matchPasswords'
        }
    }
}