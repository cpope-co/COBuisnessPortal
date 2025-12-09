import { Component, inject, computed, OnInit } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
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
export class LoginComponent implements OnInit {

  authService = inject(AuthService);
  sessionService = inject(SessionService);
  messageService = inject(MessagesService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  signalFormHandler = inject(SignalFormHandlerService);

  ngOnInit() {
    // Check for logout message in query parameters
    const msg = this.route.snapshot.queryParams['msg'];
    const severity = this.route.snapshot.queryParams['severity'] || 'info';
    
    
    if (msg) {
      this.messageService.showMessage(msg, severity as 'success' | 'warning' | 'danger' | 'info');
      // Don't clear query params - let them stay in URL, they're harmless and informative
    }
  }

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
