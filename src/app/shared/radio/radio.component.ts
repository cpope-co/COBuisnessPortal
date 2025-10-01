import { TitleCasePipe } from '@angular/common';
import { Component, forwardRef, HostBinding, inject, input } from '@angular/core';
import { ControlValueAccessor, FormGroup, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';
import { FormHandlingService } from '../../services/form-handling.service';

@Component({
  selector: 'co-radio',
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
export class RadioComponent implements ControlValueAccessor {
  @HostBinding('id')
  get hostId(): string {
    return `radio-${this.label()}`;
  }
  
  formHandlerService = inject(FormHandlingService);
  controlName = input.required<string>();
  options = input.required<any>();
  label = input.required<string>();
  formGroup = input.required<FormGroup>();
  placeholder = input.required<string>();
  model = input.required<{ [key: string]: any }>();

  // ControlValueAccessor implementation
  value: any;
  disabled = false;
  
  private onChange = (value: any) => {};
  private onTouched = () => {};

  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onValueChange(value: any): void {
    this.value = value;
    this.onChange(value);
    this.onTouched();
  }

  getErrorMessage(): string {
    return this.formHandlerService.getErrorMessages(
      this.formGroup(),
      this.controlName(),
      this.model()
    );
  }
}

