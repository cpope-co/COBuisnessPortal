import { Injectable, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FormHandling } from '../models/form-handling.model';


interface ValidationError {
  field: string;
  errDesc: string;
}
@Injectable({
  providedIn: 'root'
})
export class FormHandlingService {

  fb = inject(FormBuilder);

  createFormGroup(model: { [key: string]: FormHandling }): FormGroup {
    let group: any = {};
    let formGroupConfigs: { [key: string]: any } = {};

    Object.keys(model).forEach(key => {
      const field = model[key];
      // Check if the field specifies a formGroup
      if (field.formGroup) {
        // If the specified formGroup does not exist, initialize it
        if (!group[field.formGroup.name]) {
          group[field.formGroup.name] = this.fb.group({});
          // Store the options for later application
          if (field.formGroup.options) {
            formGroupConfigs[field.formGroup.name] = field.formGroup.options;
          }
        }
        // Add the control to the specified formGroup
        // Create the control first with validators
        const control = this.fb.control(field.value || '', field.Validators || []);

        // Add the control to the group
        group[field.formGroup.name].addControl(key, control);

      } else {
        // If no formGroup specified, add control to the root group
        group[key] = this.fb.control(field.value || '', field.Validators || []);
      }
    });

    // Create the main form group
    const formGroup = this.fb.group(group);

    // Apply group validators after the form group is created
    Object.keys(formGroupConfigs).forEach(groupName => {
      const groupConfig = formGroupConfigs[groupName];
      const nestedGroup = formGroup.get(groupName) as FormGroup;
      if (nestedGroup && groupConfig.validators) {
        nestedGroup.addValidators(groupConfig.validators);
        nestedGroup.updateValueAndValidity(); // Trigger validation
      }
    });

    return formGroup;
  }


  getErrorMessages(form: FormGroup, controlName: string, model: { [key: string]: FormHandling }): string {
    // First try to get the control directly
    let control = form.get(controlName);
    
    // If not found, search in nested form groups
    if (!control) {
      const modelField = model[controlName];
      if (modelField?.formGroup) {
        const nestedGroup = form.get(modelField.formGroup.name) as FormGroup;
        if (nestedGroup) {
          control = nestedGroup.get(controlName);
        }
      }
    }
    
    if (control?.errors) {
      // Check for customError first
      if (control.errors['customError']) {
        return control.errors['customError'];
      }
      // Fallback to existing error handling logic
      const errorKey = Object.keys(control.errors)[0];
      return model[controlName].ErrorMessages[errorKey];
    }
    return '';
  }

  getNestedFormGroup(form: FormGroup, formGroupName: string): FormGroup {
    return form.get(formGroupName) as FormGroup;
  }
  handleFormErrors(errors: ValidationError[], form: FormGroup): void {
    errors.forEach(error => {
      const formControl = form.get(error.field);
      if (formControl) {
        formControl.setErrors({ customError: error.errDesc });
      }
    });
  }
}
