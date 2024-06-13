import { Component, inject, signal } from '@angular/core';
import { UserAccountService } from '../../services/user-accounts.service';
import { UserAccount } from '../../models/user-accounts.model';
import { JsonPipe, TitleCasePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { DataSource } from '@angular/cdk/collections';
@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [
    JsonPipe,
    TitleCasePipe,
    MatTableModule,
    MatCardModule
  ],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.scss'
})
export class UsersListComponent {
  userAccountsService = inject(UserAccountService);

  userAccountsSignal = signal<UserAccount[]>([]);
  userAccounts = this.userAccountsSignal.asReadonly();
  displayedColumns: string[] = [
    'usunbr',
    'usemail', 
    'usfname', 
    'uslname', 
    'usstat', 
  ];
  constructor() {
    this.loadUserAccounts();

  }

  async loadUserAccounts() {
    try {
      const userAccounts = await this.userAccountsService.loadAllUserAccounts();
      this.userAccountsSignal.set(userAccounts);

    } catch (error) {
    }
  }
}
