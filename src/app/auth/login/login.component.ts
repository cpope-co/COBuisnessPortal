import { Component, inject, computed, OnInit } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../auth.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { SessionService } from '../../services/session.service';
import { MessagesService } from '../../messages/messages.service';
import { InputComponent } from '../../shared/input/input.component';
import { FormHandlingService } from '../../services/form-handling.service';
import { login, Login } from '../../models/login.model';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'app-login',
    imports: [
        RouterLink,
        MatButtonModule,
        MatCardModule,
        InputComponent,
        ReactiveFormsModule
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
  formHandlerService = inject(FormHandlingService);

  ngOnInit() {
    // Check for logout message in query parameters
    const msg = this.route.snapshot.queryParams['msg'];
    const severity = this.route.snapshot.queryParams['severity'] || 'info';
    
    
    if (msg) {
      this.messageService.showMessage(msg, severity as 'success' | 'warning' | 'danger' | 'info');
      // Don't clear query params - let them stay in URL, they're harmless and informative
    }
  }

  // Form configuration
  loginConfig = login;
  
  // Create form with validation
  loginForm: FormGroup = this.formHandlerService.createFormGroup(login);
  loginModel = { email: '', password: '' };

  async onLogin(event?: Event) {
    if (event) {
      event.preventDefault();
    }
    try {
      // Check form validity
      if(!this.loginForm.valid) {
        this.loginForm.markAllAsTouched();
        this.messageService.showMessage('Please correct the errors on the form.', 'danger');
        return;
      }

      // Get values from the form
      const { email, password } = this.loginForm.value;

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
