import { Injectable, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FormHandling } from '../models/form-handling.model';

@Injectable({
  providedIn: 'root'
})
export class FormHandlingService {

  fb = inject(FormBuilder);

  createFormGroup(model: { [key: string]: FormHandling }): FormGroup {
    let group: any = {};

    Object.keys(model).forEach(key => {
      const field = model[key];
      // Check if the field specifies a formGroup
      if (field.formGroup) {
        // If the specified formGroup does not exist, initialize it
        if (!group[field.formGroup.name]) {
          group[field.formGroup.name] = this.fb.group({});
        }
        // Add the control to the specified formGroup
        // Create the control first
        const control = this.fb.control(field.value || '');

        // Add the control to the group
        group[field.formGroup.name].addControl(key, control);

        // Set the validators
        control.addValidators(field.Validators || []);
        control.addValidators(field.formGroup.options?.validators || []);

      } else {
        // If no formGroup specified, add control to the root group
        group[key] = this.fb.control(field.value || '', field.Validators || []);
      }
    });

    return this.fb.group(group);
  }


  getErrorMessages(form: FormGroup, controlName: string, model: { [key: string]: FormHandling }): string {
    const control = form.get(controlName);
    if (control?.errors) {
      const errorKey = Object.keys(control.errors)[0];
      return model[controlName].ErrorMessages[errorKey];
    }
    return '';
  }

  getNestedFormGroup(form: FormGroup, formGroupName: string): FormGroup {
    return form.get(formGroupName) as FormGroup;
  }
}
