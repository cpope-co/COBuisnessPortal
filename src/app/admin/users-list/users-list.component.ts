import { Component, ViewChild, effect, inject, signal } from '@angular/core';
import { UserAccountService } from '../../services/user-accounts.service';
import { UserAccount, statuses, roles } from '../../models/user-accounts.model';
import { JsonPipe, TitleCasePipe } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { DataSource } from '@angular/cdk/collections';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MessagesService } from '../../messages/messages.service';
import { MatInputModule } from '@angular/material/input';
@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [
    RouterModule,
    JsonPipe,
    TitleCasePipe,
    MatTableModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule
  ],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.scss'
})
export class UsersListComponent {


  userAccountsService = inject(UserAccountService);
  messageService = inject(MessagesService);
  userAccountsSignal = signal<UserAccount[]>([]);
  userAccounts = this.userAccountsSignal.asReadonly();
  userAccountDataSource = new MatTableDataSource<UserAccount>(this.userAccounts());
  statuses = statuses;
  roles = roles;

  displayedColumns: string[] = [
    'actions',
    'usunbr',
    'usemail',
    'usfname',
    'uslname',
    'usstat',
    'usroleid'
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  constructor() {
    this.loadUserAccounts();
    effect(() => {
      this.userAccountDataSource.data = this.userAccounts();
      this.userAccountDataSource.sort = this.sort;
      this.userAccountDataSource.paginator = this.paginator;
    });
  }
  
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.userAccountDataSource.filter = filterValue.trim().toLowerCase();
  }
  
  async loadUserAccounts() {
    try {
      const userAccounts = await this.userAccountsService.loadAllUserAccounts();
      this.userAccountsSignal.set(userAccounts);

    } catch (error) {
    }
  }

  onEdit(userAccount: UserAccount) {

  }
  async onDelete(userAccountId: number) {
    try {
      await this.userAccountsService.deleteUserAccount(userAccountId);
      const userAccounts = this.userAccounts();
      const updatedAccounts = userAccounts.filter((account) => account.usunbr !== userAccountId);
      this.userAccountsSignal.set(updatedAccounts);

    }
    catch (error) {
      this.messageService.showMessage('Error deleting user account', 'danger');
    }
  }
  getNameFromId(id: string | number, array: Array<{ id: string | number, name: string }>): string {
    const item = array.find(i => i.id === id);
    return item ? item.name : '';
  }
}
