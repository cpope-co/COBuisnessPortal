import { Component, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { FormHandlingService } from '../services/form-handling.service';
import { profileAccount } from '../models/user-accounts.model';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { InputComponent } from '../shared/input/input.component';
import { MatButtonModule } from '@angular/material/button';
import { UserAccountService } from '../services/user-accounts.service';
import { AuthService } from '../services/auth.service';
import { User } from '../models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    MatCardModule,
    InputComponent,
    MatButtonModule,
    ReactiveFormsModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {

  formHandlerService = inject(FormHandlingService);
  userAccountService = inject(UserAccountService);
  authService = inject(AuthService);

  profileAccount = profileAccount;
  form!: FormGroup;

  #userSignal = signal<User | null>(null);
  user = this.#userSignal.asReadonly();

  constructor() {
    this.form = this.formHandlerService.createFormGroup(this.profileAccount);
    this.#userSignal.set(this.authService.user());
    this.onLoadProfile();
  }
  async onLoadProfile() {
    try {
      const userId = this.user()?.sub;
      if (typeof userId === 'number') {
        const user = await this.userAccountService.loadUserAccountById(userId);
        console.log(user);
        this.form.patchValue(user);
      } else {
        // Handle the case where userId is undefined
        console.error('User ID is undefined');
      }
    } catch (error) {
      // Handle the error
    }
  }
  async onSaveProfile() {
    try {
      if (this.form.invalid) {
        this.form.markAllAsTouched();
        return
      }
      // Save the profile
    }
    catch (error) {
      // Handle the error
    }
  }
}
