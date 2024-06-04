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
      group[key] = [model[key].value || '', model[key].Validators || []];
    });

    return this.fb.group(group);
  }
}
