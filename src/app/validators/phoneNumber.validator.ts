import { ValidatorFn, AbstractControl } from '@angular/forms';

export function phoneNumberValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const valid = /^\d{3}-\d{3}-\d{4}$/.test(control.value);
    return valid ? null : { invalidPhoneNumber: { value: control.value } };
  };
}
