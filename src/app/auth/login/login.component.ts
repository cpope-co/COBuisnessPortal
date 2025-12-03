import { Component, inject, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { SessionService } from '../../services/session.service';
import { MessagesService } from '../../messages/messages.service';
import { SignalInputComponent } from '../../shared/signal-input/signal-input.component';
import { SignalFormHandlerService } from '../../services/signal-form-handler.service';
import { LoginData, loginSignal } from '../../models/login-signal.model';

@Component({
    selector: 'app-login',
    imports: [
        RouterLink,
        MatButtonModule,
        MatCardModule,
        SignalInputComponent
    ],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss'
})
export class LoginComponent {

  authService = inject(AuthService);
  sessionService = inject(SessionService);
  messageService = inject(MessagesService);
  router = inject(Router);
  signalFormHandler = inject(SignalFormHandlerService);

  // Signal form configuration
  loginConfig = loginSignal;
  
  // Create signal form with validation
  private _loginForm = this.signalFormHandler.createSignalForm<LoginData>(
    loginSignal,
    { email: '', password: '' }
  );
  
  // Expose form and model separately
  loginForm = this._loginForm.form;
  loginModel = this._loginForm.model;

  async onLogin(event?: Event) {
    if (event) {
      event.preventDefault();
    }
    try {
      // Use the service helper to check form validity
      if(!this.signalFormHandler.isFormValid(this.loginForm)) {
        this.messageService.showMessage('Please correct the errors on the form.', 'danger');
        return;
      }

      // Get values from the model signal
      const { email, password } = this.loginModel();

      await this.authService.login(email, password);
      this.sessionService.startSessionCheck();
      await this.router.navigate(["/home"]);
      
    }
    catch (error) {
      this.messageService.showMessage('Invalid email or password.', 'danger');
      this.sessionService.stopSessionCheck();
    }
  }

}
