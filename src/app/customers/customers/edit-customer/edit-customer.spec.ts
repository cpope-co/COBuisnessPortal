import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { EditCustomer } from './edit-customer';
import { SampleApplicationService } from '../customers.service';
import { MessagesService } from '../../../messages/messages.service';
import { FormHandlingService } from '../../../services/form-handling.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import {
  createRouterSpy,
  createMessagesServiceSpy,
  createActivatedRouteMock,
  createFormHandlingSpy,
  createMatDialogSpy,
  createDialogRefMock,
  MOCK_CUSTOMERS,
  MOCK_UDC_OPTIONS
} from '../../../../testing/test-helpers';
import { ApiResponseError } from '../../../shared/api-response-error';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideNgxMask } from 'ngx-mask';

describe('EditCustomer', () => {
  let component: EditCustomer;
  let fixture: ComponentFixture<EditCustomer>;
  let mockService: jasmine.SpyObj<SampleApplicationService>;
  let mockMessagesService: jasmine.SpyObj<MessagesService>;
  let mockFormHandlingService: jasmine.SpyObj<FormHandlingService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;
  let mockDialog: jasmine.SpyObj<MatDialog>;
  let mockForm: FormGroup;

  beforeEach(async () => {
    mockService = jasmine.createSpyObj('SampleApplicationService', [
      'getSampleDataById',
      'loadUDCOptions',
      'updateSampleData'
    ]);
    mockMessagesService = createMessagesServiceSpy();
    mockFormHandlingService = createFormHandlingSpy();
    mockRouter = createRouterSpy();
    mockActivatedRoute = createActivatedRouteMock({ id: '1001' });
    mockDialog = createMatDialogSpy();

    // Create mock form
    mockForm = new FormGroup({
      CustTypeCode: new FormControl('A'),
      CandyLiker: new FormControl(true)
    });

    // Default successful responses
    mockService.getSampleDataById.and.returnValue(Promise.resolve(MOCK_CUSTOMERS[0]));
    mockService.loadUDCOptions.and.returnValue(Promise.resolve(MOCK_UDC_OPTIONS));
    mockService.updateSampleData.and.returnValue(Promise.resolve(MOCK_CUSTOMERS[0]));
    mockFormHandlingService.createFormGroup.and.returnValue(mockForm);

    await TestBed.configureTestingModule({
      imports: [EditCustomer, ReactiveFormsModule],
      providers: [
        { provide: SampleApplicationService, useValue: mockService },
        { provide: MessagesService, useValue: mockMessagesService },
        { provide: FormHandlingService, useValue: mockFormHandlingService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: MatDialog, useValue: mockDialog },
        provideNgxMask()
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditCustomer);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should inject all required services', () => {
      expect(component.sampleApplicationService).toBe(mockService);
      expect(component.messagesService).toBe(mockMessagesService);
      expect(component.formHandlerService).toBe(mockFormHandlingService);
      expect(component.router).toBe(mockRouter);
      expect(component.activatedRoute).toBe(mockActivatedRoute);
      expect(component.dialog).toBe(mockDialog);
    });

    it('should load customer data during initialization', async () => {
      // Component constructor calls loadCustomer which loads data immediately
      await fixture.whenStable();
      
      expect(component.customer()).toEqual(MOCK_CUSTOMERS[0]);
    });

    it('should have customerForm from model', () => {
      expect(component.customerForm).toBeDefined();
    });

    it('should load UDC options during initialization', async () => {
      // Component constructor calls loadUDCOptions which loads options immediately
      await fixture.whenStable();
      
      expect(component.custTypeOptions.length).toBeGreaterThan(0);
    });

    it('should call loadCustomer on construction', async () => {
      fixture.detectChanges();
      await fixture.whenStable();
      
      expect(mockService.getSampleDataById).toHaveBeenCalledWith(1001);
    });

    it('should call loadUDCOptions on construction', async () => {
      fixture.detectChanges();
      await fixture.whenStable();
      
      expect(mockService.loadUDCOptions).toHaveBeenCalled();
    });
  });

  describe('loadCustomer', () => {
    it('should load customer by ID from route params', async () => {
      await component.loadCustomer();
      
      expect(mockService.getSampleDataById).toHaveBeenCalledWith(1001);
      expect(component.customer()).toEqual(MOCK_CUSTOMERS[0]);
    });

    it('should build form after loading data', async () => {
      await component.loadCustomer();
      
      expect(mockFormHandlingService.createFormGroup).toHaveBeenCalledWith(component.customerForm);
      expect(component.form).toBeDefined();
    });

    it('should patch form with customer values', async () => {
      await component.loadCustomer();
      
      expect(component.form.value.CustTypeCode).toBe('A');
      expect(component.form.value.CandyLiker).toBe(true);
    });

    it('should mark form as pristine after patching', async () => {
      await component.loadCustomer();
      
      expect(component.form.pristine).toBe(true);
      expect(component.form.untouched).toBe(true);
    });

    it('should load different customer based on route params', async () => {
      mockActivatedRoute = createActivatedRouteMock({ id: '1005' });
      component.activatedRoute = mockActivatedRoute;
      mockService.getSampleDataById.and.returnValue(Promise.resolve(MOCK_CUSTOMERS[4]));
      
      await component.loadCustomer();
      
      expect(mockService.getSampleDataById).toHaveBeenCalledWith(1005);
      expect(component.customer()?.CustNumber).toBe(1005);
    });

    it('should handle edge case when customer load fails', async () => {
      const error = new ApiResponseError('Not found', [{ errDesc: 'Customer record not found' }]);
      mockService.getSampleDataById.and.returnValue(Promise.reject(error));
      spyOn(console, 'error');
      
      await component.loadCustomer();
      
      expect(mockMessagesService.showMessage).toHaveBeenCalledWith(
        'Failed to load customer.',
        'danger'
      );
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/sample/customers']);
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

  describe('loadUDCOptions', () => {
    it('should load UDC options from service', async () => {
      await component.loadUDCOptions();
      
      expect(mockService.loadUDCOptions).toHaveBeenCalled();
    });

    it('should map UDC options to dropdown format', async () => {
      await component.loadUDCOptions();
      
      expect(component.custTypeOptions.length).toBe(4);
      expect(component.custTypeOptions[0]).toEqual({ id: 'A', name: 'Premium Customer' });
      expect(component.custTypeOptions[1]).toEqual({ id: 'B', name: 'Standard Customer' });
    });

    it('should have all 4 type options', async () => {
      await component.loadUDCOptions();
      
      const ids = component.custTypeOptions.map(opt => opt.id);
      expect(ids).toEqual(['A', 'B', 'C', 'D']);
    });

    it('should handle edge case of empty UDC options', async () => {
      mockService.loadUDCOptions.and.returnValue(Promise.resolve([]));
      
      await component.loadUDCOptions();
      
      expect(component.custTypeOptions).toEqual([]);
    });

    it('should handle UDC load failure silently', async () => {
      const error = new Error('UDC load failed');
      mockService.loadUDCOptions.and.returnValue(Promise.reject(error));
      spyOn(console, 'error');
      
      await component.loadUDCOptions();
      
      expect(console.error).toHaveBeenCalledWith('Failed to load UDC options:', error);
      expect(mockMessagesService.showMessage).not.toHaveBeenCalled();
    });

    it('should handle edge case of null UDC response', async () => {
      mockService.loadUDCOptions.and.returnValue(Promise.resolve(null as any));
      spyOn(console, 'error');
      
      await component.loadUDCOptions();
      
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('Form Initialization', () => {
    it('should have only 2 editable controls', async () => {
      await component.loadCustomer();
      
      const controls = Object.keys(component.form.controls);
      expect(controls.length).toBe(2);
      expect(controls).toContain('CustTypeCode');
      expect(controls).toContain('CandyLiker');
    });

    it('should initialize CustTypeCode with customer value', async () => {
      await component.loadCustomer();
      
      expect(component.form.get('CustTypeCode')?.value).toBe('A');
    });

    it('should initialize CandyLiker with customer value', async () => {
      await component.loadCustomer();
      
      expect(component.form.get('CandyLiker')?.value).toBe(true);
    });

    it('should handle edge case when form validation fails', async () => {
      await component.loadCustomer();
      component.form.get('CustTypeCode')?.setValue(null);
      component.form.get('CustTypeCode')?.setErrors({ required: true });
      
      await component.onSave();
      
      expect(mockService.updateSampleData).not.toHaveBeenCalled();
    });
  });

  describe('onSave', () => {
    beforeEach(async () => {
      await component.loadCustomer();
      await fixture.whenStable();
    });

    it('should create payload with CustNum, CustTypeCode, and CandyLiker', async () => {
      component.form.patchValue({
        CustTypeCode: 'B',
        CandyLiker: false
      });
      
      await component.onSave();
      
      expect(mockService.updateSampleData).toHaveBeenCalledWith({
        CustNum: 1001,
        CustTypeCode: 'B',
        CandyLiker: false
      });
    });

    it('should show success message after save', async () => {
      await component.onSave();
      
      expect(mockMessagesService.showMessage).toHaveBeenCalledWith(
        'Customer updated successfully.',
        'success'
      );
    });

    it('should navigate to detail view after successful save', async () => {
      await component.onSave();
      
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/sample/customer', 1001]);
    });

    it('should not save if form is invalid', async () => {
      component.form.setErrors({ invalid: true });
      
      await component.onSave();
      
      expect(mockService.updateSampleData).not.toHaveBeenCalled();
      expect(mockMessagesService.showMessage).toHaveBeenCalledWith(
        'Please correct the errors on the form.',
        'danger'
      );
    });

    it('should mark all fields as touched when form is invalid', async () => {
      component.form.setErrors({ invalid: true });
      spyOn(component.form, 'markAllAsTouched');
      
      await component.onSave();
      
      expect(component.form.markAllAsTouched).toHaveBeenCalled();
    });

    it('should handle 404 error (customer not found)', async () => {
      const error = new ApiResponseError('Not found', [{ errDesc: 'Customer record not found' }]);
      mockService.updateSampleData.and.returnValue(Promise.reject(error));
      spyOn(console, 'error');
      
      await component.onSave();
      
      expect(mockMessagesService.showMessage).toHaveBeenCalledWith(
        'Failed to save customer.',
        'danger'
      );
      expect(console.error).toHaveBeenCalledWith('Failed to save customer:', error);
    });

    it('should handle 400 Bad Request error', async () => {
      const error = new ApiResponseError('Bad request', [
        { field: 'CustTypeCode', errDesc: 'Invalid customer type code' }
      ]);
      mockService.updateSampleData.and.returnValue(Promise.reject(error));
      spyOn(console, 'error');
      
      await component.onSave();
      
      expect(mockMessagesService.showMessage).toHaveBeenCalledWith(
        'Failed to save customer.',
        'danger'
      );
    });

    it('should handle 500 server error', async () => {
      const error = new ApiResponseError('Server error', [{ errDesc: 'Internal server error occurred' }]);
      mockService.updateSampleData.and.returnValue(Promise.reject(error));
      spyOn(console, 'error');
      
      await component.onSave();
      
      expect(mockMessagesService.showMessage).toHaveBeenCalledWith(
        'Failed to save customer.',
        'danger'
      );
    });

    it('should update with changed values', async () => {
      await fixture.whenStable(); // Wait for constructor to load
      component.form.patchValue({
        CustTypeCode: 'D',
        CandyLiker: true
      });
      
      await component.onSave();
      
      expect(mockService.updateSampleData).toHaveBeenCalledWith({
        CustNum: 1001,
        CustTypeCode: 'D',
        CandyLiker: true
      });
    });
  });

  describe('onCancel', () => {
    beforeEach(async () => {
      await component.loadCustomer();
      await fixture.whenStable();
    });

    it('should navigate to detail view if form is pristine', () => {
      const event = new MouseEvent('click');
      spyOn(event, 'stopPropagation');
      
      component.onCancel(event);
      
      expect(event.stopPropagation).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/sample/customer', 1001]);
    });

    it('should open dialog if form is dirty', () => {
      component.form.markAsDirty();
      const event = new MouseEvent('click');
      const dialogRefMock = createDialogRefMock<boolean>();
      mockDialog.open.and.returnValue(dialogRefMock.ref);
      
      component.onCancel(event);
      
      expect(mockDialog.open).toHaveBeenCalled();
    });

    it('should open dialog if form is touched', () => {
      component.form.markAsTouched();
      const event = new MouseEvent('click');
      const dialogRefMock = createDialogRefMock<boolean>();
      mockDialog.open.and.returnValue(dialogRefMock.ref);
      
      component.onCancel(event);
      
      expect(mockDialog.open).toHaveBeenCalled();
    });

    it('should navigate when dialog returns true', (done) => {
      component.form.markAsDirty();
      const event = new MouseEvent('click');
      const dialogRefMock = createDialogRefMock<boolean>();
      mockDialog.open.and.returnValue(dialogRefMock.ref);
      
      component.onCancel(event);
      
      // Emit true and complete
      dialogRefMock.subject.next(true);
      dialogRefMock.subject.complete();
      
      setTimeout(() => {
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/sample/customer', 1001]);
        done();
      }, 10);
    });

    it('should not navigate when dialog returns false', (done) => {
      component.form.markAsDirty();
      const event = new MouseEvent('click');
      const dialogRefMock = createDialogRefMock<boolean>();
      mockDialog.open.and.returnValue(dialogRefMock.ref);
      
      component.onCancel(event);
      
      // Emit false and complete
      dialogRefMock.subject.next(false);
      dialogRefMock.subject.complete();
      
      setTimeout(() => {
        expect(mockRouter.navigate).not.toHaveBeenCalled();
        done();
      }, 10);
    });

    it('should mark all fields as touched when opening dialog', async () => {
      await fixture.whenStable(); // Wait for constructor to load
      component.form.markAsDirty();
      const event = new MouseEvent('click');
      const dialogRefMock = createDialogRefMock<boolean>();
      mockDialog.open.and.returnValue(dialogRefMock.ref);
      spyOn(component.form, 'markAllAsTouched');
      
      component.onCancel(event);
      
      expect(component.form.markAllAsTouched).toHaveBeenCalled();
    });

    it('should allow cancel even with form errors', async () => {
      await fixture.whenStable(); // Wait for constructor to load
      component.form.setErrors({ invalid: true });
      const event = new MouseEvent('click');
      
      component.onCancel(event);
      
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/sample/customer', 1001]);
    });
  });

  describe('Template Rendering', () => {
    beforeEach(async () => {
      await component.loadCustomer();
      fixture.detectChanges();
    });

    it('should have mat-card element', () => {
      const compiled = fixture.nativeElement;
      const card = compiled.querySelector('mat-card');
      
      expect(card).toBeTruthy();
    });

    it('should have Save and Cancel buttons', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      const buttons = compiled.querySelectorAll('button');
      
      expect(buttons.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Integration Tests', () => {
    it('should load customer and UDC options on initialization', async () => {
      fixture.detectChanges();
      await fixture.whenStable();
      
      expect(component.customer()).toEqual(MOCK_CUSTOMERS[0]);
      expect(component.custTypeOptions.length).toBe(4);
      expect(component.form).toBeDefined();
    });

    it('should handle full save flow', async () => {
      fixture.detectChanges();
      await fixture.whenStable();
      
      component.form.patchValue({
        CustTypeCode: 'C',
        CandyLiker: false
      });
      
      await component.onSave();
      
      expect(mockService.updateSampleData).toHaveBeenCalled();
      expect(mockMessagesService.showMessage).toHaveBeenCalledWith(
        'Customer updated successfully.',
        'success'
      );
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/sample/customer', 1001]);
    });

    it('should handle full cancel flow with unsaved changes', (done) => {
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        component.form.markAsDirty();
        const event = new MouseEvent('click');
        const dialogRefMock = createDialogRefMock<boolean>();
        mockDialog.open.and.returnValue(dialogRefMock.ref);
        
        component.onCancel(event);
        
        dialogRefMock.subject.next(true);
        dialogRefMock.subject.complete();
        
        setTimeout(() => {
          expect(mockRouter.navigate).toHaveBeenCalledWith(['/sample/customer', 1001]);
          done();
        }, 10);
      });
    });
  });
});
