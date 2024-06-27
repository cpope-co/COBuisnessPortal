import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { PasswordService } from '../../services/password.service';
import { MessagesService } from '../../messages/messages.service';
import { FormHandlingService } from '../../services/form-handling.service';
import { setPassword } from '../../models/password.model';
import { InputComponent } from '../../shared/input/input.component';
import { matchControlsValidator } from '../../validators/verifypassword.validator';

@Component({
  selector: 'app-set-password',
  standalone: true,
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

  form!: FormGroup;

  setPassword = setPassword;


  constructor() {
    this.form = this.formHandlerService.createFormGroup(this.setPassword);
    this.form.addValidators(matchControlsValidator('password', 'confirmPassword'));
    this.form.updateValueAndValidity();
  }

  onChangePassword() {
    try {
     
     
    }
    catch (error) {
      console.error('Error changing password', error);
    }
  }
}
