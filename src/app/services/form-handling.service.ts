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
        if (!group[field.formGroup]) {
          group[field.formGroup] = this.fb.group({});
        }
        // Add the control to the specified formGroup
        group[field.formGroup].addControl(key, this.fb.control(field.value || '', field.Validators || []));
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
