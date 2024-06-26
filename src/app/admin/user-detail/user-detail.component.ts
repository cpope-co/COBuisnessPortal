import { Component, inject, signal } from '@angular/core';
import { UserAccount, userAccount } from '../../models/user-accounts.model';
import { UserAccountService } from '../../services/user-accounts.service';
import { MatCardModule } from '@angular/material/card';
import { FormHandlingService } from '../../services/form-handling.service';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import { InputComponent } from '../../shared/input/input.component';
import { RadioComponent } from '../../shared/radio/radio.component';
import { SelectComponent } from '../../shared/select/select.component';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MessagesService } from '../../messages/messages.service';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [
    RouterLink,
    MatCardModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    NgxMaskDirective,
    NgxMaskPipe,
    InputComponent,
    SelectComponent,
    RadioComponent,
    MatIconModule,
    MatMenuModule,
  ],
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.scss'
})
export class UserDetailComponent {

  userAccountService = inject(UserAccountService);
  formHandlerService = inject(FormHandlingService);
  activatedRoute = inject(ActivatedRoute);
  messagesService = inject(MessagesService);

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
    const id = +this.activatedRoute.snapshot.paramMap.get('id')!;
    this.userAccountService.loadUserAccountById(id).then(userAccount => {
      if (userAccount) {
        this.#userAccountSignal.set(userAccount as UserAccount);
        this.form = this.formHandlerService.createFormGroup(userAccount);

        this.form.patchValue(userAccount);
      }
    });
  }

  onDeleteUserAccount() {

  }
  async onSaveUserAccount() {
    try {
      const userAccount = await this.userAccountService.saveUserAccount(this.form.value);
      this.messagesService.showMessage('User account saved successfully', 'success');
    } catch (error) {
      console.error(error);
    }
  }
  async onApproveUser() {
    try {
      this.userAccountService.approveUserAccount(this.userAccount()!.usunbr);
    } catch (error) {
      console.error(error);
    }
  }
}
