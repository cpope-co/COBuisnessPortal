import { AbstractControl, ValidatorFn } from '@angular/forms';

export function passwordValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const value = control.value;
    const errors: { [key: string]: any } = {};

    if (!value) {
      errors['required'] = true;
    }

    if (value.length < 10) {
      errors['tooShort'] = true;
    }

    if (value.length > 32) {
      errors['tooLong'] = true;
    }

    if (!/[A-Z]/.test(value)) {
      errors['missingUppercase'] = true;
    }

    if (!/[a-z]/.test(value)) {
      errors['missingLowercase'] = true;
    }

    if (!/[0-9]/.test(value)) {
      errors['missingNumber'] = true;
    }

    if (!/\W/.test(value)) {
      errors['missingSpecialCharacter'] = true;
    }

    return Object.keys(errors).length > 0 ? errors : null;
  };
}