import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { UsersListComponent } from './users-list.component';
import { UserAccountService } from '../../services/user-accounts.service';
import { MessagesService } from '../../messages/messages.service';
import { UserAccount, USER_ACCOUNTS_TABLE_COLUMNS, USER_ACCOUNTS_TABLE_CONFIG } from '../../models/user-accounts.model';

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

  describe('Component Creation and Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should inject services correctly', () => {
      expect(component.userAccountsService).toBeTruthy();
      expect(component.messageService).toBeTruthy();
      expect(component.router).toBeTruthy();
    });

    it('should initialize with correct properties', () => {
      expect(component.userAccounts()).toBeTruthy();
      expect(component.tableColumns).toEqual(USER_ACCOUNTS_TABLE_COLUMNS);
      expect(component.tableConfig).toEqual(USER_ACCOUNTS_TABLE_CONFIG);
    });

    it('should have readonly userAccounts signal', () => {
      expect(component.userAccounts).toBeTruthy();
      expect(typeof component.userAccounts).toBe('function'); // Signal is a function
    });
  });

  describe('Data Loading', () => {
    it('should load user accounts on initialization', async () => {
      expect(mockUserAccountService.loadAllUserAccounts).toHaveBeenCalled();
      await fixture.whenStable();
      expect(component.userAccounts().length).toBe(2);
      expect(component.userAccounts()).toEqual(mockUserAccounts);
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

    it('should call loadUserAccounts in constructor', () => {
      // Spy on the prototype before creating the component
      spyOn(UsersListComponent.prototype, 'loadUserAccounts');
      
      // Create new component instance to test constructor
      const newFixture = TestBed.createComponent(UsersListComponent);
      expect(newFixture.componentInstance.loadUserAccounts).toHaveBeenCalled();
    });
  });

  describe('User Account Management', () => {
    beforeEach(() => {
      component.userAccountsSignal.set(mockUserAccounts);
    });

    describe('onDelete', () => {
      it('should delete user account successfully', async () => {
        expect(component.userAccounts().length).toBe(2);
        
        await component.onDelete(1);
        
        expect(mockUserAccountService.deleteUserAccount).toHaveBeenCalledWith(1);
        expect(component.userAccounts().length).toBe(1);
        expect(component.userAccounts().find(u => u.usunbr === 1)).toBeUndefined();
        expect(component.userAccounts()[0].usunbr).toBe(2);
      });

      it('should handle delete error gracefully', async () => {
        mockUserAccountService.deleteUserAccount.and.returnValue(Promise.reject(new Error('Delete failed')));
        
        await component.onDelete(1);
        
        expect(mockMessagesService.showMessage).toHaveBeenCalledWith(
          'Error deleting user account',
          'danger'
        );
        // Ensure the accounts list is unchanged on error
        expect(component.userAccounts().length).toBe(2);
      });

      it('should handle deleting non-existent user account', async () => {
        const initialLength = component.userAccounts().length;
        
        await component.onDelete(999); // Non-existent ID
        
        expect(mockUserAccountService.deleteUserAccount).toHaveBeenCalledWith(999);
        expect(component.userAccounts().length).toBe(initialLength); // Should remain unchanged
      });
    });

    describe('viewRow', () => {
      it('should navigate to user detail page with correct ID', () => {
        const testRow = { usunbr: 123 };
        
        component.viewRow(testRow);
        
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/user', 123]);
      });

      it('should handle row object with different structure', () => {
        const testRow = { 
          usunbr: 456, 
          usemail: 'test@example.com',
          usfname: 'Test'
        };
        
        component.viewRow(testRow);
        
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/user', 456]);
      });
    });
  });

  describe('Table Configuration', () => {
    it('should use correct table columns configuration', () => {
      expect(component.tableColumns).toBeDefined();
      expect(component.tableColumns).toEqual(USER_ACCOUNTS_TABLE_COLUMNS);
    });

    it('should use correct table configuration', () => {
      expect(component.tableConfig).toBeDefined();
      expect(component.tableConfig).toEqual(USER_ACCOUNTS_TABLE_CONFIG);
    });

    it('should have table columns as array', () => {
      expect(Array.isArray(component.tableColumns)).toBe(true);
      expect(component.tableColumns.length).toBeGreaterThan(0);
    });

    it('should have table config as object', () => {
      expect(typeof component.tableConfig).toBe('object');
      expect(component.tableConfig).not.toBeNull();
    });
  });

  describe('Signal Reactivity', () => {
    it('should update userAccounts signal when new data is set', () => {
      const newUserAccounts: UserAccount[] = [
        {
          usunbr: 3,
          usemail: 'new@example.com',
          usfname: 'New',
          uslname: 'User',
          usstat: 'A',
          usfpc: false,
          usnfla: 0,
          usibmi: false,
          usroleid: 1,
          usidle: 30,
          usabnum: 11111,
          usplcts: new Date(),
          uslflats: new Date(),
          usllts: new Date(),
          uscrts: new Date()
        }
      ];

      component.userAccountsSignal.set(newUserAccounts);
      
      expect(component.userAccounts()).toEqual(newUserAccounts);
      expect(component.userAccounts().length).toBe(1);
      expect(component.userAccounts()[0].usunbr).toBe(3);
    });

    it('should maintain signal reactivity after operations', async () => {
      component.userAccountsSignal.set(mockUserAccounts);
      expect(component.userAccounts().length).toBe(2);

      // Delete operation
      await component.onDelete(1);
      expect(component.userAccounts().length).toBe(1);

      // The signal should still be reactive
      const newAccount: UserAccount = {
        usunbr: 4,
        usemail: 'another@example.com',
        usfname: 'Another',
        uslname: 'User',
        usstat: 'A',
        usfpc: false,
        usnfla: 0,
        usibmi: false,
        usroleid: 2,
        usidle: 45,
        usabnum: 22222,
        usplcts: new Date(),
        uslflats: new Date(),
        usllts: new Date(),
        uscrts: new Date()
      };

      component.userAccountsSignal.update(accounts => [...accounts, newAccount]);
      expect(component.userAccounts().length).toBe(2);
      expect(component.userAccounts().find(u => u.usunbr === 4)).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors during load', async () => {
      mockUserAccountService.loadAllUserAccounts.and.returnValue(
        Promise.reject(new Error('Network error'))
      );

      const newComponent = TestBed.createComponent(UsersListComponent).componentInstance;
      await TestBed.createComponent(UsersListComponent).whenStable();

      expect(mockMessagesService.showMessage).toHaveBeenCalledWith(
        'Error loading user accounts, please try again.',
        'danger'
      );
    });

    it('should handle service unavailable errors during delete', async () => {
      component.userAccountsSignal.set(mockUserAccounts);
      mockUserAccountService.deleteUserAccount.and.returnValue(
        Promise.reject(new Error('Service unavailable'))
      );

      await component.onDelete(1);

      expect(mockMessagesService.showMessage).toHaveBeenCalledWith(
        'Error deleting user account',
        'danger'
      );
      expect(component.userAccounts().length).toBe(2); // Should remain unchanged
    });
  });
});
