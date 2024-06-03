import { TitleCasePipe } from '@angular/common';
import { Component, forwardRef, input } from '@angular/core';
import { FormControlName, FormGroup, NG_VALUE_ACCESSOR, SelectControlValueAccessor } from '@angular/forms';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatSelect, MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'co-select',
  standalone: true,
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
    TitleCasePipe
  ],
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss'
})
export class SelectComponent extends SelectControlValueAccessor {
  options = input.required<any>();
  label = input.required<string>();
  formGroup = input.required<FormGroup>();
  formControlName = input.required<string>();
  placeholder = input.required<string>();
}
