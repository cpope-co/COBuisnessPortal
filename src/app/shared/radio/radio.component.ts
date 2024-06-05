import { TitleCasePipe } from '@angular/common';
import { Component, forwardRef, inject, input } from '@angular/core';
import { FormGroup, NG_VALUE_ACCESSOR, RadioControlValueAccessor, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';
import { FormHandlingService } from '../../services/form-handling.service';

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
    TitleCasePipe,
    ReactiveFormsModule
  ],
  templateUrl: './radio.component.html',
  styleUrl: './radio.component.scss'
})
export class RadioComponent extends RadioControlValueAccessor {
  formHandlerService = inject(FormHandlingService);
  options = input.required<any>();
  label = input.required<string>();
  formGroup = input.required<FormGroup>();
  placeholder = input.required<string>();
  model = input.required<{ [key: string]: any }>();

  getErrorMessage(key: string): string {
    return this.formHandlerService.getErrorMessages(this.formGroup(), this.formControlName, this.model());
  }
}
