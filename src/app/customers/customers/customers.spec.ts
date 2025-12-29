import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Customers } from './customers';
import { SampleApplicationService } from './customers.service';
import { MessagesService } from '../../messages/messages.service';
import { Router } from '@angular/router';
import { createRouterSpy, createMessagesServiceSpy, MOCK_CUSTOMERS, MOCK_UDC_OPTIONS } from '../../../testing/test-helpers';
import { ApiResponseError } from '../../shared/api-response-error';
import { provideNgxMask } from 'ngx-mask';

describe('Customers', () => {
  let component: Customers;
  let fixture: ComponentFixture<Customers>;
  let mockService: jasmine.SpyObj<SampleApplicationService>;
  let mockMessagesService: jasmine.SpyObj<MessagesService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockService = jasmine.createSpyObj('SampleApplicationService', [
      'loadAllSampleData',
      'loadUDCOptions'
    ]);
    mockMessagesService = createMessagesServiceSpy();
    mockRouter = createRouterSpy();

    // Default successful responses
    mockService.loadAllSampleData.and.returnValue(Promise.resolve(MOCK_CUSTOMERS));
    mockService.loadUDCOptions.and.returnValue(Promise.resolve(MOCK_UDC_OPTIONS));

    await TestBed.configureTestingModule({
      imports: [Customers],
      providers: [
        { provide: SampleApplicationService, useValue: mockService },
        { provide: MessagesService, useValue: mockMessagesService },
        { provide: Router, useValue: mockRouter },
        provideNgxMask()
      ],
      schemas: [NO_ERRORS_SCHEMA] // Ignore co-table component
    })
    .compileComponents();

    fixture = TestBed.createComponent(Customers);
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
    });

    it('should have table configuration', () => {
      expect(component.tableColumns).toBeDefined();
      expect(component.tableConfig).toBeDefined();
    });

    it('should initialize with empty sampleData signal', () => {
      const data = component.sampleData();
      expect(Array.isArray(data)).toBe(true);
    });

    it('should call loadSampleData on construction', async () => {
      fixture.detectChanges();
      await fixture.whenStable();
      
      expect(mockService.loadAllSampleData).toHaveBeenCalled();
    });

    it('should call loadUDCOptions on construction', async () => {
      fixture.detectChanges();
      await fixture.whenStable();
      
      expect(mockService.loadUDCOptions).toHaveBeenCalled();
    });
  });

  describe('loadSampleData', () => {
    it('should load and set sample data successfully', async () => {
      await component.loadSampleData();
      
      expect(mockService.loadAllSampleData).toHaveBeenCalled();
      expect(component.sampleData()).toEqual(MOCK_CUSTOMERS);
    });

    it('should show success message with customer count', async () => {
      await component.loadSampleData();
      
      expect(mockMessagesService.showMessage).toHaveBeenCalledWith(
        'Sample data loaded successfully.',
        'success',
        3000
      );
    });

    it('should update signal with all 8 customers', async () => {
      await component.loadSampleData();
      
      const data = component.sampleData();
      expect(data.length).toBe(8);
      expect(data[0].CustNumber).toBe(1001);
      expect(data[7].CustNumber).toBe(1008);
    });

    it('should handle edge case of empty data array', async () => {
      mockService.loadAllSampleData.and.returnValue(Promise.resolve([]));
      
      await component.loadSampleData();
      
      expect(component.sampleData()).toEqual([]);
      expect(component.sampleData().length).toBe(0);
    });

    it('should handle edge case of null response', async () => {
      mockService.loadAllSampleData.and.returnValue(Promise.resolve(null as any));
      
      await component.loadSampleData();
      
      expect(component.sampleData()).toBeNull();
    });

    it('should handle service error and show danger message', async () => {
      const error = new ApiResponseError('Load failed', [{ errDesc: 'Database connection error' }]);
      mockService.loadAllSampleData.and.returnValue(Promise.reject(error));
      spyOn(console, 'error');
      
      await component.loadSampleData();
      
      expect(mockMessagesService.showMessage).toHaveBeenCalledWith(
        'Failed to load sample data.',
        'danger'
      );
      expect(console.error).toHaveBeenCalledWith('Failed to load sample data:', error);
    });

    it('should handle 500 server error', async () => {
      const error = new ApiResponseError('Server error', [{ errDesc: 'Internal server error occurred' }]);
      mockService.loadAllSampleData.and.returnValue(Promise.reject(error));
      spyOn(console, 'error');
      
      await component.loadSampleData();
      
      expect(mockMessagesService.showMessage).toHaveBeenCalledWith(
        'Failed to load sample data.',
        'danger'
      );
    });

    it('should handle network timeout error', async () => {
      const error = new Error('Network timeout');
      mockService.loadAllSampleData.and.returnValue(Promise.reject(error));
      spyOn(console, 'error');
      
      await component.loadSampleData();
      
      expect(mockMessagesService.showMessage).toHaveBeenCalled();
    });
  });

  describe('loadUDCOptions', () => {
    it('should call service to load UDC options', async () => {
      await component.loadUDCOptions();
      
      expect(mockService.loadUDCOptions).toHaveBeenCalled();
    });

    it('should not show message on successful UDC load', async () => {
      mockMessagesService.showMessage.calls.reset();
      
      await component.loadUDCOptions();
      
      expect(mockMessagesService.showMessage).not.toHaveBeenCalled();
    });

    it('should handle edge case of empty UDC options', async () => {
      mockService.loadUDCOptions.and.returnValue(Promise.resolve([]));
      
      await expectAsync(component.loadUDCOptions()).toBeResolved();
    });

    it('should handle UDC service error and log to console', async () => {
      const error = new ApiResponseError('Load failed', [{ errDesc: 'UDC table not found' }]);
      mockService.loadUDCOptions.and.returnValue(Promise.reject(error));
      spyOn(console, 'error');
      
      await component.loadUDCOptions();
      
      expect(console.error).toHaveBeenCalledWith('Failed to load UDC options:', error);
    });

    it('should handle edge case of null UDC response', async () => {
      mockService.loadUDCOptions.and.returnValue(Promise.resolve(null as any));
      spyOn(console, 'error');
      
      await component.loadUDCOptions();
      
      expect(console.error).not.toHaveBeenCalled();
    });
  });

  describe('onRowClick', () => {
    it('should navigate to customer detail page', () => {
      const customer = MOCK_CUSTOMERS[0];
      
      component.onRowClick(customer);
      
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/sample/customer', 1001]);
    });

    it('should navigate with correct customer number for different customers', () => {
      component.onRowClick(MOCK_CUSTOMERS[3]);
      
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/sample/customer', 1004]);
    });

    it('should use customer number from row data', () => {
      const customer = MOCK_CUSTOMERS[7];
      
      component.onRowClick(customer);
      
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/sample/customer', 1008]);
    });

    it('should handle edge case of customer with null CustNumber', () => {
      const invalidCustomer = { ...MOCK_CUSTOMERS[0], CustNumber: null as any };
      
      component.onRowClick(invalidCustomer);
      
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/sample/customer', null]);
    });

    it('should handle edge case of customer with zero CustNumber', () => {
      const invalidCustomer = { ...MOCK_CUSTOMERS[0], CustNumber: 0 };
      
      component.onRowClick(invalidCustomer);
      
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/sample/customer', 0]);
    });
  });

  describe('Template Rendering', () => {
    it('should have mat-card element', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      const card = compiled.querySelector('mat-card');
      
      expect(card).toBeTruthy();
    });

    it('should pass table configuration to co-table', () => {
      fixture.detectChanges();
      
      expect(component.tableColumns).toBeDefined();
      expect(component.tableConfig).toBeDefined();
    });
  });

  describe('Integration Tests', () => {
    it('should load data and UDC options on initialization', async () => {
      fixture.detectChanges();
      await fixture.whenStable();
      
      expect(mockService.loadAllSampleData).toHaveBeenCalled();
      expect(mockService.loadUDCOptions).toHaveBeenCalled();
      expect(component.sampleData()).toEqual(MOCK_CUSTOMERS);
    });

    it('should handle both data and UDC errors gracefully', async () => {
      mockService.loadAllSampleData.and.returnValue(Promise.reject(new Error('Data error')));
      mockService.loadUDCOptions.and.returnValue(Promise.reject(new Error('UDC error')));
      spyOn(console, 'error');
      
      fixture.detectChanges();
      await fixture.whenStable();
      
      expect(console.error).toHaveBeenCalledTimes(2);
      expect(mockMessagesService.showMessage).toHaveBeenCalledTimes(1); // Only data error shows message
    });

    it('should navigate after successful data load', async () => {
      fixture.detectChanges();
      await fixture.whenStable();
      
      component.onRowClick(MOCK_CUSTOMERS[0]);
      
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/sample/customer', 1001]);
    });
  });
});
