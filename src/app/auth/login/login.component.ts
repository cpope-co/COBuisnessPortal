import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { SessionService } from '../../services/session.service';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule
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
  router = inject(Router);
  fb = inject(FormBuilder);

  form = this.fb.group({
    email: [''],
    password: ['']
  });

  async onLogin() {
    try {

      const { email, password } = this.form.value;

      if (!email || !password) {
        return;
      }

      await this.authService.login(email, password);
      this.sessionService.startSession();
      await this.router.navigate(["home"]);
    }
    catch (error) {
      console.error(error);
    }
  }
  onRegister() {

  }

}
