import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  authService = inject(AuthService);
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

      await this.router.navigate(["home"]);
    }
    catch (error) {
      console.error(error);
    }
  }

}
