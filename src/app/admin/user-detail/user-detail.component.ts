import { Component, inject, signal } from '@angular/core';
import { UserAccount, userAccount } from '../../models/user-accounts.model';
import { UserAccountService } from '../../services/user-accounts.service';
import { MatCardModule } from '@angular/material/card';
import { FormHandlingService } from '../../services/form-handling.service';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import { InputComponent } from '../../shared/input/input.component';
import { RadioComponent } from '../../shared/radio/radio.component';
import { SelectComponent } from '../../shared/select/select.component';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [
    MatCardModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    NgxMaskDirective,
    NgxMaskPipe,
    InputComponent,
    SelectComponent,
    RadioComponent
  ],
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.scss'
})
export class UserDetailComponent {
  userAccountService = inject(UserAccountService);
  formHandling = inject(FormHandlingService);

  form!: FormGroup;
  userAccountForm = userAccount

  #userAccountSignal = signal<UserAccount | null>(null);
  userAccount = this.#userAccountSignal.asReadonly();
  statuses = [
    { id: 'A', name: 'Active' },
    { id: 'I', name: 'Inactive' },
    { id: 'P', name: 'Pending' },
    { id: 'L', name: 'Locked out' }
  ]
  roles = [
    { id: 1, name: 'Admin' },
    { id: 2, name: 'User' },
    { id: 3, name: 'Vendor' },
    { id: 4, name: 'Customer' }
  ];

  constructor() {
    this.userAccountService.loadUserAccountById(57).then(userAccount => {
      if (userAccount) {
        this.#userAccountSignal.set(userAccount as UserAccount);
        const controls = Object.keys(this.userAccountForm).reduce((acc, key) => {
          acc[key] = new FormControl(this.userAccountForm[key]);
          return acc;
        }, {} as { [key: string]: AbstractControl });

        this.form = new FormGroup(controls);
        this.form.patchValue(userAccount);
      }
    });


  }
}
