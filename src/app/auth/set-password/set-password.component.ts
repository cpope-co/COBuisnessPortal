import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { PasswordService } from '../../services/password.service';
import { MessagesService } from '../../messages/messages.service';
import { FormHandlingService } from '../../services/form-handling.service';
import { setPassword } from '../../models/password.model';
import { InputComponent } from '../../shared/input/input.component';
import { matchControlsValidator } from '../../validators/verifypassword.validator';
import { ApiResponseError } from '../../shared/api-response-error';

@Component({
    selector: 'app-set-password',
    imports: [
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatButtonModule,
        InputComponent
    ],
    templateUrl: './set-password.component.html',
    styleUrl: './set-password.component.scss'
})
export class SetPasswordComponent {

  passwordService = inject(PasswordService);
  formHandlerService = inject(FormHandlingService);
  messageService = inject(MessagesService);
  router = inject(Router);

  form!: FormGroup;

  setPassword = setPassword;


  constructor() {
    this.form = this.formHandlerService.createFormGroup(this.setPassword);
    this.form.addValidators(matchControlsValidator('password', 'confirmPassword'));
    this.form.updateValueAndValidity();
  }

  async onChangePassword() {
    if (this.form.valid) {
      try {
        const passwordData = {
          password: this.form.get('password')?.value,
          confirmPassword: this.form.get('confirmPassword')?.value
        };
        
        await this.passwordService.setPassword(passwordData);
        this.messageService.showMessage('Password has been set successfully!', 'success');
        this.form.reset();
        
        // Redirect to login page after successful password set
        this.router.navigate(['/auth/login']);
      } catch (error: unknown) {
        console.error('Error changing password', error);
        
        if (error instanceof ApiResponseError) {
          this.formHandlerService.handleFormErrors(error.validationErrors, this.form);
        } else {
          this.messageService.showMessage('Failed to set password. Please try again.', 'danger');
        }
      }
    } else {
      this.form.markAllAsTouched();
      this.messageService.showMessage('Please correct the errors in the form.', 'danger');
    }
  }
}
