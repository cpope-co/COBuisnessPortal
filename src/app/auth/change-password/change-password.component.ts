import { Component, inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ChangePasswordService } from './change-password.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.scss'
})
export class ChangePasswordComponent {

  changePasswordService = inject(ChangePasswordService);


  fb = inject(FormBuilder);

  changePasswordForm = this.fb.group({
    oldPassword: [''],
    newPassword: [''],
    confirmPassword: ['']
  });

  constructor() {
  }

  onChangePassword() {
    try {
      const { oldPassword, newPassword, confirmPassword } = this.changePasswordForm.value;

      if(!oldPassword || !newPassword || !confirmPassword) {
        return;
      }
      this.changePasswordService.changePassword(oldPassword, newPassword, confirmPassword);
    }
    catch (error) {
      console.error('Error changing password', error);
    }
  }
}
