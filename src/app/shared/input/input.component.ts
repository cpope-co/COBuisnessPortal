import { Component, forwardRef, HostBinding, inject, input } from '@angular/core';
import { ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { MatFormField } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormHandlingService } from '../../services/form-handling.service';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';

@Component({
  selector: 'co-input',
  imports: [
    MatFormField,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    ReactiveFormsModule,
    NgxMaskDirective,
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
  @HostBinding('id')
  get hostId(): string {
    const controlName = this.formControlName();
    const typeValue = this.type();
    return controlName && typeValue ? `${typeValue}-${controlName}` : '';
  }  
  
  control = new FormControl();
  formHandlerService = inject(FormHandlingService);

  label = input.required<string>();
  type = input.required<string>();
  placeholder = input.required<string>();
  formControlName = input.required<string>();
  formGroup = input.required<FormGroup>();
  model = input.required<{ [key: string]: any }>();
  mask = input<string>();

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

  /**
   * Clear the input value when the clear icon is clicked
   */
  clearInput(): void {
    const control = this.formGroup().get(this.formControlName());
    if (control) {
      control.setValue('');
      control.markAsTouched();
    }
  }

  /**
   * Check if the input has a value to show/hide the clear icon
   */
  hasValue(): boolean {
    const control = this.formGroup().get(this.formControlName());
    return control?.value && control.value.length > 0;
  }

}
