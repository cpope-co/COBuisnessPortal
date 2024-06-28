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
import { MessagesService } from '../messages/messages.service';
import { Router } from '@angular/router';
import { openLoseChangesDialog } from '../shared/lose-changes-dialog/lose-changes-dialog.component';
import { MatDialog } from '@angular/material/dialog';

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
  messageService = inject(MessagesService);
  router = inject(Router);
  dialog = inject(MatDialog)

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
        this.messageService.showMessage('Please correct the errors on the form.', 'danger');
        return
      }
      await this.userAccountService.saveUserAccount(this.form.value, this.user()?.sub);
      this.messageService.showMessage('Profile saved!', 'success');
    }
    catch (error) {
      // Handle the error
    }
  }


  onCancel() {
    if(this.form.dirty) {
      openLoseChangesDialog(this.dialog, {
        mode: 'save',
        title: 'Unsaved changes',
        message: 'Leaving this page will discard your changes. Do you want to continue?'
    });
    }
  }
}
