import { Component, effect, inject, signal } from '@angular/core';
import { UserAccountService } from '../../services/user-accounts.service';
import { UserAccount, USER_ACCOUNTS_TABLE_COLUMNS, USER_ACCOUNTS_TABLE_CONFIG } from '../../models/user-accounts.model';
import { JsonPipe, TitleCasePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { Router, RouterModule } from '@angular/router';
import { MessagesService } from '../../messages/messages.service';
import { TableComponent } from '../../shared/table/table.component';
@Component({
  selector: 'app-users-list',
  imports: [
    RouterModule,
    MatCardModule,
    TableComponent
  ],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.scss'
})
export class UsersListComponent {

  userAccountsService = inject(UserAccountService);
  messageService = inject(MessagesService);
  router = inject(Router);

  userAccountsSignal = signal<UserAccount[]>([]);
  userAccounts = this.userAccountsSignal.asReadonly();

  // Use table configuration from model
  tableColumns = USER_ACCOUNTS_TABLE_COLUMNS;
  tableConfig = USER_ACCOUNTS_TABLE_CONFIG;
  constructor() {
    this.loadUserAccounts();
  }

  async loadUserAccounts() {
    try {
      const userAccounts = await this.userAccountsService.loadAllUserAccounts();
      this.userAccountsSignal.set(userAccounts);
    } catch (error) {
      this.messageService.showMessage('Error loading user accounts, please try again.', 'danger');
    }
  }

  async onDelete(userAccountId: number) {
    try {
      await this.userAccountsService.deleteUserAccount(userAccountId);
      const userAccounts = this.userAccounts();
      const updatedAccounts = userAccounts.filter((account) => account.usunbr !== userAccountId);
      this.userAccountsSignal.set(updatedAccounts);
    } catch (error) {
      this.messageService.showMessage('Error deleting user account', 'danger');
    }
  }

  viewRow(row: any) {
    this.router.navigate(['/admin/user', row.usunbr]);
  }
}
