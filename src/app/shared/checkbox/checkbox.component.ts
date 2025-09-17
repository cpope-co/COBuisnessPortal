import { Component, forwardRef, inject, input } from '@angular/core';
import { CheckboxControlValueAccessor, FormGroup, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { FormHandlingService } from '../../services/form-handling.service';
import {MatCheckboxModule} from '@angular/material/checkbox';

@Component({
    selector: 'app-checkbox',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => CheckboxComponent),
            multi: true,
        }
    ],
    imports: [
        ReactiveFormsModule,
        MatCheckboxModule
    ],
    templateUrl: './checkbox.component.html',
    styleUrl: './checkbox.component.scss'
})
export class CheckboxComponent extends CheckboxControlValueAccessor {

  formHandlerService = inject(FormHandlingService);
  options = input.required<any>();
  label = input.required<string>();
  formGroup = input.required<FormGroup>();
  formControlName = input.required<string>();
  placeholder = input.required<string>();
  model = input.required<{ [key: string]: any }>();

  getErrorMessage(key: string): string {
    return this.formHandlerService.getErrorMessages(this.formGroup(), this.formControlName(), this.model());
  }
}
