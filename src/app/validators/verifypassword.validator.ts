import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from "@angular/forms";

export function matchControlsValidator(firstControlName: string, secondControlName: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    // Explicitly cast the AbstractControl to a FormGroup
    const formGroup = control as FormGroup;
    const firstControl = formGroup.get(firstControlName);
    const secondControl = formGroup.get(secondControlName);

    if (!firstControl || !secondControl) {
      console.error('One of the controls is not found in the form group');
      return { controlNotFound: true };
    }

    if (firstControl.value !== secondControl.value) {
      secondControl.setErrors({ mismatch: true });
      return { mismatch: true };
    } else {
      secondControl.setErrors(null);
    }

    return null;
  };
} 