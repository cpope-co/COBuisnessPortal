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
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MessagesService } from '../../messages/messages.service';
import { openLoseChangesDialog } from '../../shared/lose-changes-dialog/lose-changes-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'app-user-detail',
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
  router = inject(Router);
  dialog = inject(MatDialog);
  
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
    { id: 4, name: 'Customer' },
    { id: 5, name: 'Api User'}
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
  onCancel(event: MouseEvent) {
    event.stopPropagation();
    if (this.form.touched || this.form.dirty) {
      openLoseChangesDialog(this.dialog, {
        mode: 'save',
        title: 'Unsaved changes',
        message: 'Leaving this page will discard your changes. Do you want to continue?',
        destination: '/admin/users'
      });
      this.form.markAllAsTouched();
    } else {
      this.router.navigate(['/admin/users']);
    }
  }
}
