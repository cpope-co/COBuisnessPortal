import { ValidatorFn, AbstractControl, ValidationErrors, FormGroup } from "@angular/forms";

export function matchEmailsValidator(control: AbstractControl): ValidatorFn {

  return (control: AbstractControl): ValidationErrors | null => {
    const email = control.get('usemail')?.value;
    const verifyEmail = control.get('verifyEmail')?.value;

    if (email !== verifyEmail) {
      control.get('verifyEmail')?.setErrors({ emailMismatch: true });
      return { emailMismatch: true };
    }

    return null;
  };
}