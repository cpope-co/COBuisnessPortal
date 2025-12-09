import { Component, inject, input } from '@angular/core';
import { MatFormField } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Field } from '@angular/forms/signals';
import { SignalFormHandlerService } from '../../services/signal-form-handler.service';
import { SignalFormHandling } from '../../models/signal-form-handling.model';

@Component({
  selector: 'co-signal-input',
  imports: [
    MatFormField,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    Field
  ],
  templateUrl: './signal-input.component.html',
  styleUrl: './signal-input.component.scss'
})
export class SignalInputComponent {
  signalFormHandler = inject(SignalFormHandlerService);

  /** Label for the input field */
  label = input.required<string>();
  
  /** Input type (text, email, password, etc.) */
  type = input.required<string>();
  
  /** Placeholder text */
  placeholder = input.required<string>();
  
  /** Signal form field state */
  field = input.required<any>();
  
  /** Field configuration with validators and error messages */
  fieldConfig = input.required<SignalFormHandling>();

  /**
   * Get error message for the current field state
   */
  getErrorMessage(): string {
    return this.signalFormHandler.getErrorMessage(this.field());
  }

  /**
   * Check if field should display error state
   */
  isInvalid(): boolean {
    return this.signalFormHandler.isFieldInvalid(this.field());
  }

  /**
   * Clear the input value
   */
  clearInput(): void {
    const fieldState = this.field();
    fieldState.value.set('');
  }

  /**
   * Check if the input has a value
   */
  hasValue(): boolean {
    const fieldState = this.field();
    const value = fieldState.value();
    return value && value.length > 0;
  }
}
