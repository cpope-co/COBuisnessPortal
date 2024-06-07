import { ValidatorFn, AbstractControl, ValidationErrors, FormGroup } from "@angular/forms";

export function matchEmailsValidator(formGroup: FormGroup): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const email = group.get('usemail')!.value;
    const confirmEmail = group.get('verifyEmail')!.value;
    return email === confirmEmail ? null : { emailMismatch: true };
  };
}