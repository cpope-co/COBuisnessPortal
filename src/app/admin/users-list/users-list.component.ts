import { Component, ViewChild, effect, inject, signal } from '@angular/core';
import { UserAccountService } from '../../services/user-accounts.service';
import { UserAccount, statuses, roles } from '../../models/user-accounts.model';
import { JsonPipe, TitleCasePipe } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterModule } from '@angular/router';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MessagesService } from '../../messages/messages.service';
import { MatInputModule } from '@angular/material/input';
import { TableComponent } from '../../shared/table/table.component';
import { FiltersComponent } from '../../shared/filters/filters.component';
import { FilterConfig } from '../../shared/table/table.component';
@Component({
  selector: 'app-users-list',
  imports: [
    RouterModule,
    MatTableModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    FiltersComponent
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
  userAccountDataSource = new MatTableDataSource<UserAccount>(this.userAccounts());

  userAccountFilters: FilterConfig[] = [];
  statuses = statuses;
  roles = roles;

  displayedColumns: string[] = [
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
    effect(() => {
      this.userAccountFilters = [
        {
          key: 'usroleid',
          label: 'Role',
          type: 'select',
          options: this.roles.map((role) => role.name)
        },
        {
          key: 'usstat',
          label: 'Status', 
          type: 'select',
          options: this.statuses.map((status) => status.name)
        }
      ]
    });
    this.configureFilterPredicate();
  }

  configureFilterPredicate() {
    this.userAccountDataSource.filterPredicate = (data: UserAccount, filter: string) => {
      const filters = JSON.parse(filter);

      let matchesRole = true;
      let matchesStatus = true;
      let matchesSearch = true;

      if (filters.search !== undefined) {
        const searchTerm = filters.search.toLowerCase();
        matchesSearch = this.displayedColumns.some(column => {
          const value = data[column as keyof UserAccount]?.toString().toLowerCase() || '';
          return value.includes(searchTerm);
        });
      }

      if (filters.usroleid !== undefined) {
        matchesRole = data.usroleid === Number(filters.usroleid) || filters.usroleid === -1;
      }
      if (filters.usstat !== undefined) {
        matchesStatus = data.usstat === filters.usstat || filters.usstat === '';
      }

      return matchesRole && matchesSearch && matchesStatus;
    };
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

    }
    catch (error) {
      this.messageService.showMessage('Error deleting user account', 'danger');
    }
  }
  getNameFromId(id: string | number, array: Array<{ id: string | number, name: string }>): string {
    const item = array.find(i => i.id === id);
    return item ? item.name : '';
  }

  viewRow(row: any) {
    this.router.navigate(['/admin/user', row.usunbr]);
  }

  setSearch(search: String) {
    const currentFilter = JSON.parse(this.userAccountDataSource.filter || '{}');
    currentFilter.search = search;
    this.userAccountDataSource.filter = JSON.stringify(currentFilter);
  }
  setFilter($event: any) {
    const currentFilter = JSON.parse(this.userAccountDataSource.filter || '{}');
    const filterKey = $event.key;
    const filterValue = $event.value;
    
    // Convert role names back to IDs for filtering
    if (filterKey === 'usroleid' && filterValue) {
      const role = this.roles.find(r => r.name === filterValue);
      currentFilter[filterKey] = role ? role.id : null;
    } else if (filterKey === 'usstat' && filterValue) {
      const status = this.statuses.find(s => s.name === filterValue);
      currentFilter[filterKey] = status ? status.id : null;
    } else {
      currentFilter[filterKey] = filterValue || null;
    }
    
    // Remove null/empty filters
    if (!currentFilter[filterKey]) {
      delete currentFilter[filterKey];
    }
    
    this.userAccountDataSource.filter = JSON.stringify(currentFilter);
  }
}
