import { JsonPipe } from '@angular/common';
import { Component, forwardRef, inject, input } from '@angular/core';
import { ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { MatFormField } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormHandlingService } from '../../services/form-handling.service';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';

@Component({
    selector: 'co-input',
    imports: [
        MatFormField,
        MatInputModule,
        ReactiveFormsModule,
        JsonPipe,
        NgxMaskDirective,
        NgxMaskPipe,
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

  control = new FormControl();
  formHandlerService = inject(FormHandlingService);

  label = input.required<string>();
  type = input.required<string>();
  placeholder = input.required<string>();
  formControlName = input.required<string>();
  formGroup = input.required<FormGroup>();
  model = input.required<{ [key: string]: any }>();
  mask = input<string>();

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

  getErrorMessage(key: string): string {
    return this.formHandlerService.getErrorMessages(this.formGroup(), this.formControlName(), this.model());

  }

}
