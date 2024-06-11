import { Component, forwardRef, inject, input } from '@angular/core';
import { FormGroup, NG_VALUE_ACCESSOR, ReactiveFormsModule, SelectMultipleControlValueAccessor } from '@angular/forms';
import { FormHandlingService } from '../../services/form-handling.service';
import { TitleCasePipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
@Component({
  selector: 'co-multi-select',
  standalone: true, 
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MultiSelectComponent),
      multi: true,
    }
  ],
  imports: [
    MatFormFieldModule,
    MatSelectModule,
    TitleCasePipe,
    ReactiveFormsModule
  ],
  templateUrl: './multi-select.component.html',
  styleUrl: './multi-select.component.scss'
})
export class MultiSelectComponent extends SelectMultipleControlValueAccessor {

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
