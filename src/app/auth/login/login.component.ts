import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { SessionService } from '../../services/session.service';
import { MessagesService } from '../../messages/messages.service';
import { InputComponent } from '../../shared/input/input.component';
import { FormHandlingService } from '../../services/form-handling.service';
import { Login, login } from '../../models/login.model';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    InputComponent
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  onForgotPassword() {
    throw new Error('Method not implemented.');
  }

  authService = inject(AuthService);
  sessionService = inject(SessionService);
  messageService = inject(MessagesService);
  router = inject(Router);
  formHandlerService = inject(FormHandlingService);

  form!: FormGroup;

  login = login;
  
  constructor() {
    this.form = this.formHandlerService.createFormGroup(this.login);

  }

  async onLogin() {
    try {

      if(this.form.invalid) {
        this.form.markAllAsTouched();
        this.messageService.showMessage('Please correct the errors on the form.', 'danger');
        return
      }
      const { email, password } = this.form.value;

      await this.authService.login(email, password);
      this.sessionService.startSession(); 
      await this.router.navigate(["home"]);
    }
    catch (error) {
      this.sessionService.endSesssion();
      console.error(error);
    }
  }
  onRegister() {

  }

}
