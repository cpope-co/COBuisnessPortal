import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { UsersListComponent } from './users-list.component';
import { UserAccountService } from '../../services/user-accounts.service';
import { MessagesService } from '../../messages/messages.service';
import { UserAccount, statuses, roles } from '../../models/user-accounts.model';

describe('UsersListComponent', () => {
  let component: UsersListComponent;
  let fixture: ComponentFixture<UsersListComponent>;
  let mockUserAccountService: jasmine.SpyObj<UserAccountService>;
  let mockMessagesService: jasmine.SpyObj<MessagesService>;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockUserAccounts: UserAccount[] = [
    {
      usunbr: 1,
      usemail: 'test1@example.com',
      usfname: 'John',
      uslname: 'Doe',
      usstat: 'A',
      usfpc: false,
      usnfla: 0,
      usibmi: false,
      usroleid: 1,
      usidle: 30,
      usabnum: 12345,
      usplcts: new Date(),
      uslflats: new Date(),
      usllts: new Date(),
      uscrts: new Date()
    },
    {
      usunbr: 2,
      usemail: 'test2@example.com',
      usfname: 'Jane',
      uslname: 'Smith',
      usstat: 'I',
      usfpc: false,
      usnfla: 0,
      usibmi: false,
      usroleid: 2,
      usidle: 60,
      usabnum: 67890,
      usplcts: new Date(),
      uslflats: new Date(),
      usllts: new Date(),
      uscrts: new Date()
    }
  ];

  beforeEach(async () => {
    mockUserAccountService = jasmine.createSpyObj('UserAccountService', [
      'loadAllUserAccounts',
      'deleteUserAccount'
    ]);

    mockMessagesService = jasmine.createSpyObj('MessagesService', [
      'showMessage'
    ]);

    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    mockUserAccountService.loadAllUserAccounts.and.returnValue(Promise.resolve(mockUserAccounts));
    mockUserAccountService.deleteUserAccount.and.returnValue(Promise.resolve({ success: true }));

    await TestBed.configureTestingModule({
      imports: [UsersListComponent],
      providers: [
        { provide: UserAccountService, useValue: mockUserAccountService },
        { provide: MessagesService, useValue: mockMessagesService },
        { provide: Router, useValue: mockRouter }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UsersListComponent);
    component = fixture.componentInstance;
    
    // Wait for async operations to complete
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should inject services correctly', () => {
    expect(component.userAccountsService).toBeTruthy();
    expect(component.messageService).toBeTruthy();
    expect(component.router).toBeTruthy();
  });

  it('should initialize with correct properties', () => {
    expect(component.userAccountsSignal).toBeTruthy();
    expect(component.userAccounts).toBeTruthy();
    expect(component.userAccountDataSource).toBeTruthy();
    expect(component.statuses).toEqual(statuses);
    expect(component.roles).toEqual(roles);
    expect(component.displayedColumns).toEqual([
      'usunbr',
      'usemail',
      'usfname',
      'uslname',
      'usstat',
      'usroleid'
    ]);
    // userAccountFilters is populated by effect, so check it has the expected structure
    expect(component.userAccountFilters.length).toBe(2);
  });

  it('should load user accounts on initialization', async () => {
    expect(mockUserAccountService.loadAllUserAccounts).toHaveBeenCalled();
    await fixture.whenStable();
    expect(component.userAccounts().length).toBe(2);
    expect(component.userAccounts()).toEqual(mockUserAccounts);
  });

  it('should setup filter configuration with roles and statuses', async () => {
    await fixture.whenStable();
    fixture.detectChanges();
    
    expect(component.userAccountFilters.length).toBe(2);
    
    const roleFilter = component.userAccountFilters.find(f => f.name === 'usroleid');
    expect(roleFilter).toBeTruthy();
    expect(roleFilter.label).toBe('Role');
    expect(roleFilter.options.length).toBe(roles.length);
    
    const statusFilter = component.userAccountFilters.find(f => f.name === 'usstat');
    expect(statusFilter).toBeTruthy();
    expect(statusFilter.label).toBe('Status');
    expect(statusFilter.options.length).toBe(statuses.length);
  });

  it('should handle error when loading user accounts fails', async () => {
    // Reset the component with a failing service
    mockUserAccountService.loadAllUserAccounts.and.returnValue(Promise.reject(new Error('Load failed')));
    
    const newFixture = TestBed.createComponent(UsersListComponent);
    const newComponent = newFixture.componentInstance;
    
    await newFixture.whenStable();
    
    expect(mockMessagesService.showMessage).toHaveBeenCalledWith(
      'Error loading user accounts, please try again.',
      'danger'
    );
  });

  describe('onDelete', () => {
    it('should delete user account successfully', async () => {
      component.userAccountsSignal.set(mockUserAccounts);
      
      await component.onDelete(1);
      
      expect(mockUserAccountService.deleteUserAccount).toHaveBeenCalledWith(1);
      expect(component.userAccounts().length).toBe(1);
      expect(component.userAccounts().find(u => u.usunbr === 1)).toBeUndefined();
    });

    it('should handle delete error', async () => {
      mockUserAccountService.deleteUserAccount.and.returnValue(Promise.reject(new Error('Delete failed')));
      
      await component.onDelete(1);
      
      expect(mockMessagesService.showMessage).toHaveBeenCalledWith(
        'Error deleting user account',
        'danger'
      );
    });
  });

  describe('getNameFromId', () => {
    it('should return correct name for existing id', () => {
      const testArray = [
        { id: 1, name: 'Test Name 1' },
        { id: 2, name: 'Test Name 2' }
      ];
      
      const result = component.getNameFromId(1, testArray);
      expect(result).toBe('Test Name 1');
    });

    it('should return empty string for non-existing id', () => {
      const testArray = [
        { id: 1, name: 'Test Name 1' },
        { id: 2, name: 'Test Name 2' }
      ];
      
      const result = component.getNameFromId(999, testArray);
      expect(result).toBe('');
    });

    it('should handle string ids', () => {
      const testArray = [
        { id: 'A', name: 'Active' },
        { id: 'I', name: 'Inactive' }
      ];
      
      const result = component.getNameFromId('A', testArray);
      expect(result).toBe('Active');
    });
  });

  describe('viewRow', () => {
    it('should navigate to user detail page', () => {
      const testRow = { usunbr: 123 };
      
      component.viewRow(testRow);
      
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/user', 123]);
    });
  });

  describe('setSearch', () => {
    it('should set search filter', () => {
      const searchTerm = 'test search';
      
      component.setSearch(searchTerm);
      
      const filter = JSON.parse(component.userAccountDataSource.filter);
      expect(filter.search).toBe(searchTerm);
    });

    it('should preserve existing filters when setting search', () => {
      // Set initial filter
      component.userAccountDataSource.filter = JSON.stringify({ usstat: 'A' });
      
      component.setSearch('test');
      
      const filter = JSON.parse(component.userAccountDataSource.filter);
      expect(filter.search).toBe('test');
      expect(filter.usstat).toBe('A');
    });
  });

  describe('setFilter', () => {
    it('should set role filter with number conversion', () => {
      const mockEvent = {
        source: { ariaLabel: 'usroleid' },
        value: '2'
      };
      
      component.setFilter(mockEvent);
      
      const filter = JSON.parse(component.userAccountDataSource.filter);
      expect(filter.usroleid).toBe(2);
    });

    it('should set status filter as string', () => {
      const mockEvent = {
        source: { ariaLabel: 'usstat' },
        value: 'A'
      };
      
      component.setFilter(mockEvent);
      
      const filter = JSON.parse(component.userAccountDataSource.filter);
      expect(filter.usstat).toBe('A');
    });

    it('should preserve existing filters when setting new filter', () => {
      // Set initial filter
      component.userAccountDataSource.filter = JSON.stringify({ search: 'test' });
      
      const mockEvent = {
        source: { ariaLabel: 'usstat' },
        value: 'A'
      };
      
      component.setFilter(mockEvent);
      
      const filter = JSON.parse(component.userAccountDataSource.filter);
      expect(filter.search).toBe('test');
      expect(filter.usstat).toBe('A');
    });
  });

  describe('configureFilterPredicate', () => {
    beforeEach(() => {
      component.userAccountsSignal.set(mockUserAccounts);
      component.configureFilterPredicate();
    });

    it('should filter by search term', () => {
      const testData = mockUserAccounts[0];
      const filter = JSON.stringify({ search: 'john' });
      
      const result = component.userAccountDataSource.filterPredicate(testData, filter);
      expect(result).toBe(true);
    });

    it('should filter by role id', () => {
      const testData = mockUserAccounts[0]; // usroleid: 1
      const filter = JSON.stringify({ usroleid: 1 });
      
      const result = component.userAccountDataSource.filterPredicate(testData, filter);
      expect(result).toBe(true);
      
      const filterNoMatch = JSON.stringify({ usroleid: 2 });
      const resultNoMatch = component.userAccountDataSource.filterPredicate(testData, filterNoMatch);
      expect(resultNoMatch).toBe(false);
    });

    it('should filter by status', () => {
      const testData = mockUserAccounts[0]; // usstat: 'A'
      const filter = JSON.stringify({ usstat: 'A' });
      
      const result = component.userAccountDataSource.filterPredicate(testData, filter);
      expect(result).toBe(true);
      
      const filterNoMatch = JSON.stringify({ usstat: 'I' });
      const resultNoMatch = component.userAccountDataSource.filterPredicate(testData, filterNoMatch);
      expect(resultNoMatch).toBe(false);
    });

    it('should handle special role filter value -1 (show all)', () => {
      const testData = mockUserAccounts[0];
      const filter = JSON.stringify({ usroleid: -1 });
      
      const result = component.userAccountDataSource.filterPredicate(testData, filter);
      expect(result).toBe(true);
    });

    it('should handle empty status filter (show all)', () => {
      const testData = mockUserAccounts[0];
      const filter = JSON.stringify({ usstat: '' });
      
      const result = component.userAccountDataSource.filterPredicate(testData, filter);
      expect(result).toBe(true);
    });

    it('should combine multiple filters', () => {
      const testData = mockUserAccounts[0]; // usstat: 'A', usroleid: 1, usfname: 'John'
      const filter = JSON.stringify({ 
        search: 'john',
        usstat: 'A',
        usroleid: 1
      });
      
      const result = component.userAccountDataSource.filterPredicate(testData, filter);
      expect(result).toBe(true);
      
      const filterNoMatch = JSON.stringify({ 
        search: 'john',
        usstat: 'I', // Different status
        usroleid: 1
      });
      const resultNoMatch = component.userAccountDataSource.filterPredicate(testData, filterNoMatch);
      expect(resultNoMatch).toBe(false);
    });
  });
});
