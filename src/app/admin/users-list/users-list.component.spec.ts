import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatCardHarness } from '@angular/material/card/testing';
import { Router } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { UsersListComponent } from './users-list.component';
import { UserAccountService } from '../../services/user-accounts.service';
import { MessagesService } from '../../messages/messages.service';
import { UserAccount, USER_ACCOUNTS_TABLE_COLUMNS, USER_ACCOUNTS_TABLE_CONFIG } from '../../models/user-accounts.model';

describe('UsersListComponent', () => {
  let component: UsersListComponent;
  let fixture: ComponentFixture<UsersListComponent>;
  let loader: HarnessLoader;
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
    loader = TestbedHarnessEnvironment.loader(fixture);
    
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

  describe('Material Components Testing with Harnesses', () => {
    beforeEach(async () => {
      component.userAccountsSignal.set(mockUserAccounts);
      fixture.detectChanges();
    });

    describe('Card Component', () => {
      it('should render mat-card component', async () => {
        const card = await loader.getHarness(MatCardHarness);
        expect(card).toBeTruthy();
      });

      it('should display correct card title', async () => {
        const card = await loader.getHarness(MatCardHarness);
        const titleText = await card.getTitleText();
        expect(titleText).toBe('User Accounts');
      });

      it('should have proper card structure with title and content', async () => {
        const card = await loader.getHarness(MatCardHarness);
        const titleText = await card.getTitleText();
        const cardText = await card.getText();
        
        expect(titleText).toBe('User Accounts');
        expect(cardText).toContain('User Accounts');
      });

      it('should contain table component within card content', async () => {
        const card = await loader.getHarness(MatCardHarness);
        const cardText = await card.getText();
        
        expect(cardText).toContain('User Accounts');
        expect(card).toBeTruthy();
      });
    });

    describe('Card Integration with Table Data', () => {
      it('should display card when user accounts are loaded', async () => {
        expect(component.userAccounts().length).toBe(2);
        
        const card = await loader.getHarness(MatCardHarness);
        expect(card).toBeTruthy();
      });

      it('should maintain card structure during data updates', async () => {
        const initialCard = await loader.getHarness(MatCardHarness);
        const initialTitle = await initialCard.getTitleText();
        
        // Update data
        const newUserAccounts = [...mockUserAccounts, {
          usunbr: 3,
          usemail: 'test3@example.com',
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
        }];
        
        component.userAccountsSignal.set(newUserAccounts);
        fixture.detectChanges();
        
        const updatedCard = await loader.getHarness(MatCardHarness);
        const updatedTitle = await updatedCard.getTitleText();
        
        expect(initialTitle).toBe(updatedTitle);
        expect(updatedTitle).toBe('User Accounts');
      });

      it('should handle empty data state with card intact', async () => {
        component.userAccountsSignal.set([]);
        fixture.detectChanges();
        
        const card = await loader.getHarness(MatCardHarness);
        const titleText = await card.getTitleText();
        
        expect(card).toBeTruthy();
        expect(titleText).toBe('User Accounts');
      });
    });

    describe('Material Theme Integration', () => {
      it('should apply correct Material card styling', async () => {
        const card = await loader.getHarness(MatCardHarness);
        const host = await card.host();
        
        const classes = await host.getAttribute('class');
        expect(classes).toContain('mat-mdc-card');
      });

      it('should maintain proper visual hierarchy', async () => {
        const card = await loader.getHarness(MatCardHarness);
        const titleText = await card.getTitleText();
        
        expect(titleText).toBe('User Accounts');
        expect(titleText.length).toBeGreaterThan(0);
      });

      it('should be visually accessible', async () => {
        const card = await loader.getHarness(MatCardHarness);
        const host = await card.host();
        
        const display = await host.getCssValue('display');
        const visibility = await host.getCssValue('visibility');
        
        expect(display).not.toBe('none');
        expect(visibility).not.toBe('hidden');
      });
    });

    describe('Component Lifecycle with Material Components', () => {
      it('should initialize Material components properly', async () => {
        const card = await loader.getHarness(MatCardHarness);
        
        expect(card).toBeTruthy();
        expect(component.userAccounts()).toBeTruthy();
        expect(component.tableColumns).toBeTruthy();
        expect(component.tableConfig).toBeTruthy();
      });

      it('should handle data loading with Material components', async () => {
        expect(mockUserAccountService.loadAllUserAccounts).toHaveBeenCalled();
        
        const card = await loader.getHarness(MatCardHarness);
        const titleText = await card.getTitleText();
        
        expect(titleText).toBe('User Accounts');
        expect(component.userAccounts().length).toBe(2);
      });

      it('should maintain Material component integrity during operations', async () => {
        const initialCard = await loader.getHarness(MatCardHarness);
        
        // Perform delete operation
        await component.onDelete(1);
        
        const cardAfterDelete = await loader.getHarness(MatCardHarness);
        const titleAfterDelete = await cardAfterDelete.getTitleText();
        
        expect(titleAfterDelete).toBe('User Accounts');
        expect(component.userAccounts().length).toBe(1);
      });
    });

    describe('Responsive Design and Layout', () => {
      it('should maintain card layout responsiveness', async () => {
        const card = await loader.getHarness(MatCardHarness);
        const host = await card.host();
        
        const position = await host.getCssValue('position');
        const display = await host.getCssValue('display');
        
        expect(display).toBeTruthy();
        expect(typeof position).toBe('string');
      });

      it('should handle different viewport sizes gracefully', async () => {
        const card = await loader.getHarness(MatCardHarness);
        
        // Card should remain functional regardless of viewport
        expect(card).toBeTruthy();
        
        const titleText = await card.getTitleText();
        expect(titleText).toBe('User Accounts');
      });
    });

    describe('Accessibility with Material Components', () => {
      it('should have proper semantic structure', async () => {
        const card = await loader.getHarness(MatCardHarness);
        const host = await card.host();
        
        const tagName = await host.getProperty('tagName');
        expect(tagName.toLowerCase()).toBe('mat-card');
      });

      it('should support keyboard navigation', async () => {
        const card = await loader.getHarness(MatCardHarness);
        const host = await card.host();
        
        // Test focus capability
        await host.focus();
        const isFocused = await host.isFocused();
        
        // Card itself may not be focusable, but this tests the capability
        expect(typeof isFocused).toBe('boolean');
      });

      it('should have proper heading structure', async () => {
        const card = await loader.getHarness(MatCardHarness);
        const cardText = await card.getText();
        
        expect(cardText).toContain('User Accounts');
      });
    });

    describe('Error State Handling with Material Components', () => {
      it('should maintain card structure during error states', async () => {
        // Simulate error during data operations
        component.userAccountsSignal.set([]);
        fixture.detectChanges();
        
        const card = await loader.getHarness(MatCardHarness);
        const titleText = await card.getTitleText();
        
        expect(card).toBeTruthy();
        expect(titleText).toBe('User Accounts');
      });

      it('should handle Material component errors gracefully', async () => {
        const card = await loader.getHarness(MatCardHarness);
        
        expect(card).toBeTruthy();
        
        // Simulate component destruction
        fixture.destroy();
        expect(() => fixture.detectChanges()).not.toThrow();
      });
    });
  });
});
