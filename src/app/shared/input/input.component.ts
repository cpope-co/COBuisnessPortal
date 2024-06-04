import { JsonPipe } from '@angular/common';
import { Component, ErrorHandler, forwardRef, inject, input } from '@angular/core';
import { ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { MatFormField } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'co-input',
  standalone: true,
  imports: [
    MatFormField,
    MatInputModule,
    ReactiveFormsModule,
    JsonPipe
  ],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => InputComponent),
    multi: true
  }],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss'
})
export class InputComponent implements ControlValueAccessor {

  errors: any = {};
  errorHandler = inject(ErrorHandler)
  control = new FormControl();

  constructor() {
  }

  writeValue(obj: any): void {
    this.control.setValue(obj);
  }
  registerOnChange(fn: any): void {
    this.control.valueChanges.subscribe(fn);
  }
  registerOnTouched(fn: any): void {
    this.control.valueChanges.subscribe(fn);
  }
  setDisabledState?(isDisabled: boolean): void {
    isDisabled ? this.control.disable() : this.control.enable();
  }


  label = input.required<string>();
  type = input.required<string>();
  placeholder = input.required<string>();
  formControlName = input.required<string>();
  formGroup = input.required<FormGroup>();

}
