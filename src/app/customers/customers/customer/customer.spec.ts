import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Customer } from './customer';
import { SampleApplicationService } from '../customers.service';
import { MessagesService } from '../../../messages/messages.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import {
  createRouterSpy,
  createMessagesServiceSpy,
  createActivatedRouteMock,
  createMatDialogSpy,
  MOCK_CUSTOMERS
} from '../../../../testing/test-helpers';
import { ApiResponseError } from '../../../shared/api-response-error';

describe('Customer', () => {
  let component: Customer;
  let fixture: ComponentFixture<Customer>;
  let mockService: jasmine.SpyObj<SampleApplicationService>;
  let mockMessagesService: jasmine.SpyObj<MessagesService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;
  let mockDialog: jasmine.SpyObj<MatDialog>;

  beforeEach(async () => {
    mockService = jasmine.createSpyObj('SampleApplicationService', [
      'getSampleDataById',
      'deleteSampleData'
    ]);
    mockMessagesService = createMessagesServiceSpy();
    mockRouter = createRouterSpy();
    mockActivatedRoute = createActivatedRouteMock({ id: '1001' });
    mockDialog = createMatDialogSpy();

    // Default successful response
    mockService.getSampleDataById.and.returnValue(Promise.resolve(MOCK_CUSTOMERS[0]));
    mockService.deleteSampleData.and.returnValue(Promise.resolve());

    await TestBed.configureTestingModule({
      imports: [Customer],
      providers: [
        { provide: SampleApplicationService, useValue: mockService },
        { provide: MessagesService, useValue: mockMessagesService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: MatDialog, useValue: mockDialog }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Customer);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should inject all required services', () => {
      expect(component.sampleApplicationService).toBe(mockService);
      expect(component.messagesService).toBe(mockMessagesService);
      expect(component.router).toBe(mockRouter);
      expect(component.activatedRoute).toBe(mockActivatedRoute);
      expect(component.dialog).toBe(mockDialog);
    });

    it('should load customer data during initialization', async () => {
      // Component constructor calls loadCustomer which loads data immediately
      await fixture.whenStable();
      
      expect(component.customer()).toEqual(MOCK_CUSTOMERS[0]);
    });

    it('should call loadCustomer on construction', async () => {
      fixture.detectChanges();
      await fixture.whenStable();
      
      expect(mockService.getSampleDataById).toHaveBeenCalledWith(1001);
    });
  });

  describe('loadCustomer', () => {
    it('should load customer by ID from route params', async () => {
      await component.loadCustomer();
      
      expect(mockService.getSampleDataById).toHaveBeenCalledWith(1001);
      expect(component.customer()).toEqual(MOCK_CUSTOMERS[0]);
    });

    it('should extract ID from activatedRoute snapshot', async () => {
      mockActivatedRoute = createActivatedRouteMock({ id: '1005' });
      component.activatedRoute = mockActivatedRoute;
      mockService.getSampleDataById.and.returnValue(Promise.resolve(MOCK_CUSTOMERS[4]));
      
      await component.loadCustomer();
      
      expect(mockService.getSampleDataById).toHaveBeenCalledWith(1005);
      expect(component.customer()?.CustNumber).toBe(1005);
    });

    it('should convert string ID to number', async () => {
      mockActivatedRoute = createActivatedRouteMock({ id: '1008' });
      component.activatedRoute = mockActivatedRoute;
      mockService.getSampleDataById.and.returnValue(Promise.resolve(MOCK_CUSTOMERS[7]));
      
      await component.loadCustomer();
      
      expect(mockService.getSampleDataById).toHaveBeenCalledWith(1008);
    });

    it('should update customer signal with loaded data', async () => {
      await component.loadCustomer();
      
      const customer = component.customer();
      expect(customer?.CustNumber).toBe(1001);
      expect(customer?.CustName).toBe('Acme Corporation');
      expect(customer?.CustAddress).toBe('123 Main St, Springfield, IL 62701');
    });

    it('should handle edge case of invalid ID format', async () => {
      // ID "invalid" converts to NaN, service will reject
      mockService.getSampleDataById.and.returnValue(Promise.reject(new Error('Invalid ID')));
      spyOn(console, 'error');
      
      await component.loadCustomer();
      
      expect(mockMessagesService.showMessage).toHaveBeenCalledWith(
        'Failed to load customer.',
        'danger'
      );
    });

    it('should handle 404 error and navigate to list', async () => {
      const error = new ApiResponseError('Not found', [{ errDesc: 'Customer record not found' }]);
      mockService.getSampleDataById.and.returnValue(Promise.reject(error));
      spyOn(console, 'error');
      
      await component.loadCustomer();
      
      expect(mockMessagesService.showMessage).toHaveBeenCalledWith(
        'Failed to load customer.',
        'danger'
      );
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/sample/customers']);
      expect(console.error).toHaveBeenCalledWith('Failed to load customer:', error);
    });

    it('should handle edge case of null customer response', async () => {
      mockService.getSampleDataById.and.returnValue(Promise.resolve(null as any));
      
      await component.loadCustomer();
      
      expect(component.customer()).toBeNull();
    });

    it('should handle 500 server error', async () => {
      const error = new ApiResponseError('Server error', [{ errDesc: 'Internal server error occurred' }]);
      mockService.getSampleDataById.and.returnValue(Promise.reject(error));
      spyOn(console, 'error');
      
      await component.loadCustomer();
      
      expect(mockMessagesService.showMessage).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/sample/customers']);
    });
  });

  describe('formatYesNo', () => {
    it('should return "Yes" for boolean true', () => {
      const result = component.formatYesNo(true);
      expect(result).toBe('Yes');
    });

    it('should return "No" for boolean false', () => {
      const result = component.formatYesNo(false);
      expect(result).toBe('No');
    });

    it('should extract and format value from FormHandling object with true', () => {
      const formHandling = {
        value: true,
        Validators: [],
        ErrorMessages: {}
      };
      
      const result = component.formatYesNo(formHandling as any);
      expect(result).toBe('Yes');
    });

    it('should extract and format value from FormHandling object with false', () => {
      const formHandling = {
        value: false,
        Validators: [],
        ErrorMessages: {}
      };
      
      const result = component.formatYesNo(formHandling as any);
      expect(result).toBe('No');
    });

    it('should return "No" for undefined', () => {
      const result = component.formatYesNo(undefined);
      expect(result).toBe('No');
    });

    it('should return "No" for null', () => {
      const result = component.formatYesNo(null as any);
      expect(result).toBe('No');
    });

    it('should handle FormHandling with null value', () => {
      const formHandling = {
        value: null,
        Validators: [],
        ErrorMessages: {}
      };
      
      const result = component.formatYesNo(formHandling as any);
      expect(result).toBe('No');
    });
  });

  describe('onBack', () => {
    it('should navigate to customer list', () => {
      component.onBack();
      
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/sample/customers']);
    });
  });

  describe('onEdit', () => {
    it('should navigate to edit page with customer ID', async () => {
      await fixture.whenStable(); // Wait for constructor to load
      
      component.onEdit();
      
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/sample/customer', 1001, 'edit']);
    });

    it('should navigate with correct ID for different customer', async () => {
      mockActivatedRoute = createActivatedRouteMock({ id: '1005' });
      component.activatedRoute = mockActivatedRoute;
      mockService.getSampleDataById.and.returnValue(Promise.resolve(MOCK_CUSTOMERS[4]));
      await component.loadCustomer();
      
      component.onEdit();
      
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/sample/customer', 1005, 'edit']);
    });
  });

  describe('onDelete', () => {
    beforeEach(async () => {
      await component.loadCustomer();
      await fixture.whenStable();
    });

    it('should show confirmation dialog with customer details', async () => {
      await fixture.whenStable(); // Wait for constructor to load
      spyOn(window, 'confirm').and.returnValue(true);
      
      component.onDelete();
      
      expect(window.confirm).toHaveBeenCalledWith(
        'Are you sure you want to delete customer 1001 - Acme Corporation? This action cannot be undone.'
      );
    });

    it('should call deleteSampleData when user confirms', async () => {
      await fixture.whenStable(); // Wait for constructor to load
      spyOn(window, 'confirm').and.returnValue(true);
      
      await component.onDelete();
      
      expect(mockService.deleteSampleData).toHaveBeenCalledWith(1001);
    });

    it('should show success message after deletion', async () => {
      await fixture.whenStable(); // Wait for constructor to load
      spyOn(window, 'confirm').and.returnValue(true);
      
      await component.onDelete();
      
      expect(mockMessagesService.showMessage).toHaveBeenCalledWith(
        'Customer deleted successfully.',
        'success'
      );
    });

    it('should navigate to list after successful deletion', async () => {
      await fixture.whenStable(); // Wait for constructor to load
      spyOn(window, 'confirm').and.returnValue(true);
      
      await component.onDelete();
      
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/sample/customers']);
    });

    it('should not delete if user cancels confirmation', async () => {
      await fixture.whenStable(); // Wait for constructor to load
      spyOn(window, 'confirm').and.returnValue(false);
      
      await component.onDelete();
      
      expect(mockService.deleteSampleData).not.toHaveBeenCalled();
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should handle 400 error (dependencies exist)', async () => {
      await fixture.whenStable(); // Wait for constructor to load
      spyOn(window, 'confirm').and.returnValue(true);
      const error = new ApiResponseError('Cannot delete', [
        { field: 'CustTypeCode', errDesc: 'Invalid customer type code' }
      ]);
      mockService.deleteSampleData.and.returnValue(Promise.reject(error));
      spyOn(console, 'error');
      
      await component.onDelete();
      
      expect(mockMessagesService.showMessage).toHaveBeenCalledWith(
        'Failed to delete customer.',
        'danger'
      );
      expect(console.error).toHaveBeenCalledWith('Failed to delete customer:', error);
    });

    it('should handle 404 error (customer not found)', async () => {
      await fixture.whenStable(); // Wait for constructor to load
      spyOn(window, 'confirm').and.returnValue(true);
      const error = new ApiResponseError('Not found', [{ errDesc: 'Customer record not found' }]);
      mockService.deleteSampleData.and.returnValue(Promise.reject(error));
      spyOn(console, 'error');
      
      await component.onDelete();
      
      expect(mockMessagesService.showMessage).toHaveBeenCalledWith(
        'Failed to delete customer.',
        'danger'
      );
    });

    it('should handle 500 server error', async () => {
      await fixture.whenStable(); // Wait for constructor to load
      spyOn(window, 'confirm').and.returnValue(true);
      const error = new ApiResponseError('Server error', [{ errDesc: 'Internal server error occurred' }]);
      mockService.deleteSampleData.and.returnValue(Promise.reject(error));
      spyOn(console, 'error');
      
      await component.onDelete();
      
      expect(mockMessagesService.showMessage).toHaveBeenCalledWith(
        'Failed to delete customer.',
        'danger'
      );
    });
  });

  describe('Template Rendering', () => {
    beforeEach(async () => {
      await component.loadCustomer();
      fixture.detectChanges();
    });

    it('should display customer information', () => {
      const compiled = fixture.nativeElement;
      const card = compiled.querySelector('mat-card');
      
      expect(card).toBeTruthy();
    });

    it('should have Edit button', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      const buttons = compiled.querySelectorAll('button');
      
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Integration Tests', () => {
    it('should load customer and enable edit navigation', async () => {
      fixture.detectChanges();
      await fixture.whenStable();
      
      expect(component.customer()).toEqual(MOCK_CUSTOMERS[0]);
      
      component.onEdit();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/sample/customer', 1001, 'edit']);
    });

    it('should handle full delete flow', async () => {
      fixture.detectChanges();
      await fixture.whenStable();
      spyOn(window, 'confirm').and.returnValue(true);
      
      await component.onDelete();
      
      expect(mockService.deleteSampleData).toHaveBeenCalled();
      expect(mockMessagesService.showMessage).toHaveBeenCalledWith(
        'Customer deleted successfully.',
        'success'
      );
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/sample/customers']);
    });
  });
});
