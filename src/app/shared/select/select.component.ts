import { TitleCasePipe } from '@angular/common';
import { Component, forwardRef, inject, input } from '@angular/core';
import { FormGroup, NG_VALUE_ACCESSOR, ReactiveFormsModule, SelectControlValueAccessor } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormHandlingService } from '../../services/form-handling.service';

@Component({
    selector: 'co-select',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => SelectComponent),
            multi: true,
        }
    ],
    imports: [
        MatFormFieldModule,
        MatSelectModule,
        TitleCasePipe,
        ReactiveFormsModule
    ],
    templateUrl: './select.component.html',
    styleUrl: './select.component.scss'
})

export class SelectComponent extends SelectControlValueAccessor {
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
  compareWithFn(item1: { id: any; }, item2: { id: any; }) {
    return item1 && item2 ? item1.id === item2.id : item1 === item2;
  }
}
