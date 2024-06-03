import { TitleCasePipe } from '@angular/common';
import { Component, forwardRef, input } from '@angular/core';
import { FormGroup, NG_VALUE_ACCESSOR, RadioControlValueAccessor } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';

@Component({
  selector: 'co-radio',
  standalone: true,
  providers: [
    { 
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RadioComponent),
      multi: true,
    }
  ],
  imports: [
    MatFormFieldModule,
    MatRadioModule,
    TitleCasePipe
  ],
  templateUrl: './radio.component.html',
  styleUrl: './radio.component.scss'
})
export class RadioComponent extends RadioControlValueAccessor {
  options = input.required<any>();
  label = input.required<string>();
  formGroup = input.required<FormGroup>();
  placeholder = input.required<string>();
}
