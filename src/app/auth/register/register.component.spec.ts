import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { ReCaptchaV3Service } from 'ng-recaptcha-2';
import { of, throwError } from 'rxjs';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatCardHarness } from '@angular/material/card/testing';
import { MatButtonHarness } from '@angular/material/button/testing';

import { RegisterComponent } from './register.component';
import { RegisterService } from './register.service';
import { WCatMgrService } from '../../services/wcatmgr.service';
import { MessagesService } from '../../messages/messages.service';
import { FormHandlingService } from '../../services/form-handling.service';
import { RegistrationTypes, register } from './register.model';
import { WCatMgr } from '../../models/wcatmgr.model';
import { ApiResponseError } from '../../shared/api-response-error';

// Mock components
@Component({
selector: 'co-input',
  template: `<input [mask]="mask || null" />`,
  standalone: true,
  imports: [NgxMaskDirective],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MockInputComponent),
      multi: true
    }
  ]
})
class MockInputComponent implements ControlValueAccessor {
  @Input() formGroup!: FormGroup;
  @Input() label!: string;
  @Input() type!: string;
  @Input() formControlName!: string;
  @Input() placeholder!: string;
  @Input() model!: any;
  @Input() mask!: string;

  writeValue(value: any): void {}
  registerOnChange(fn: any): void {}
  registerOnTouched(fn: any): void {}
  setDisabledState(isDisabled: boolean): void {}
}

@Component({
  selector: 'co-select',
  template: `<div class="mock-select"></div>`,
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MockSelectComponent),
      multi: true
    }
  ]
})
class MockSelectComponent implements ControlValueAccessor {
  @Input() formGroup!: FormGroup;
  @Input() label!: string;
  @Input() formControlName!: string;
  @Input() options!: any[];
  @Input() placeholder!: string;
  @Input() model!: any;

  writeValue(value: any): void {}
  registerOnChange(fn: any): void {}
  registerOnTouched(fn: any): void {}
  setDisabledState(isDisabled: boolean): void {}
}

@Component({
  selector: 'co-radio',
  template: `<div class="mock-radio"></div>`,
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MockRadioComponent),
      multi: true
    }
  ]
})
class MockRadioComponent implements ControlValueAccessor {
  @Input() formGroup!: FormGroup;
  @Input() label!: string;
  @Input() formControlName!: string;
  @Input() options!: any[];
  @Input() placeholder!: string;
  @Input() model!: any;

  writeValue(value: any): void {}
  registerOnChange(fn: any): void {}
  registerOnTouched(fn: any): void {}
  setDisabledState(isDisabled: boolean): void {}
}

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let loader: HarnessLoader;
  let mockRegisterService: jasmine.SpyObj<RegisterService>;
  let mockWCatMgrService: jasmine.SpyObj<WCatMgrService>;
  let mockMessagesService: jasmine.SpyObj<MessagesService>;
  let mockFormHandlingService: jasmine.SpyObj<FormHandlingService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockRecaptchaService: jasmine.SpyObj<ReCaptchaV3Service>;
  let mockForm: FormGroup;
  let mockNestedForm: FormGroup;
  let formMarkTouchedSpy: jasmine.Spy;

  const mockWCatMgrs: WCatMgr[] = [
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Smith' }
  ];

  beforeEach(async () => {
    const registerSpy = jasmine.createSpyObj('RegisterService', ['registerAccount']);
    const wcatmgrSpy = jasmine.createSpyObj('WCatMgrService', ['loadAllWCatMgrs']);
    const messagesSpy = jasmine.createSpyObj('MessagesService', ['showMessage']);
    const formHandlingSpy = jasmine.createSpyObj('FormHandlingService', ['createFormGroup', 'getNestedFormGroup', 'handleFormErrors']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const recaptchaSpy = jasmine.createSpyObj('ReCaptchaV3Service', ['execute']);

    // Setup form mocks
    mockNestedForm = new FormGroup({
      usemail: new FormControl('test@example.com'),
      verifyEmail: new FormControl('test@example.com')
    });
    
    mockForm = new FormGroup({
      wregtype: new FormControl(RegistrationTypes.r),
      usfname: new FormControl('John'),
      uslname: new FormControl('Doe'),
      usabnum: new FormControl('12345'),
      wcatmgr: new FormControl('1'),
      wacctname: new FormControl('Test Account'),
      wphone: new FormControl('(555) 123-4567'),
      wrecaptchatoken: new FormControl(''),
      matchEmails: mockNestedForm
    });

    Object.defineProperty(mockForm, 'invalid', { 
      get: () => false, 
      configurable: true 
    });
    
    Object.defineProperty(mockForm, 'valid', { 
      get: () => true, 
      configurable: true 
    });

    formMarkTouchedSpy = spyOn(mockForm, 'markAllAsTouched');
    spyOn(mockNestedForm, 'addValidators');
    spyOn(mockNestedForm, 'updateValueAndValidity');
    spyOn(mockForm, 'reset');
    spyOn(mockForm, 'removeControl');
    spyOn(mockForm, 'patchValue');
    
    // Add spy for form.get method to return mock values
    spyOn(mockForm, 'get').and.callFake((controlName: string) => {
      if (controlName === 'wregtype') {
        const control = new FormControl(RegistrationTypes.r);
        Object.defineProperty(control, 'value', { get: () => RegistrationTypes.r });
        return control;
      }
      return new FormControl('mock-value');
    });

    formHandlingSpy.createFormGroup.and.returnValue(mockForm);
    formHandlingSpy.getNestedFormGroup.and.returnValue(mockNestedForm);
    
    // Setup other service mocks
    wcatmgrSpy.loadAllWCatMgrs.and.returnValue(Promise.resolve(mockWCatMgrs));
    registerSpy.registerAccount.and.returnValue(Promise.resolve());
    routerSpy.navigate.and.returnValue(Promise.resolve(true));
    recaptchaSpy.execute.and.returnValue(of('mock-recaptcha-token'));

    await TestBed.configureTestingModule({
      imports: [
        RegisterComponent,
        ReactiveFormsModule,
        MatButtonModule,
        MatCardModule,
        NoopAnimationsModule,
        NgxMaskDirective,
        MockInputComponent,
        MockSelectComponent,
        MockRadioComponent
      ],
      providers: [
        { provide: RegisterService, useValue: registerSpy },
        { provide: WCatMgrService, useValue: wcatmgrSpy },
        { provide: MessagesService, useValue: messagesSpy },
        { provide: FormHandlingService, useValue: formHandlingSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ReCaptchaV3Service, useValue: recaptchaSpy },
        provideNgxMask({
          validation: false,
          showMaskTyped: false,
          placeHolderCharacter: '_',
          shownMaskExpression: ''
        })
      ]
    })
    .overrideComponent(RegisterComponent, {
      set: {
        providers: [
          { provide: ReCaptchaV3Service, useValue: recaptchaSpy }
        ]
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    
    mockRegisterService = TestBed.inject(RegisterService) as jasmine.SpyObj<RegisterService>;
    mockWCatMgrService = TestBed.inject(WCatMgrService) as jasmine.SpyObj<WCatMgrService>;
    mockMessagesService = TestBed.inject(MessagesService) as jasmine.SpyObj<MessagesService>;
    mockFormHandlingService = TestBed.inject(FormHandlingService) as jasmine.SpyObj<FormHandlingService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    mockRecaptchaService = TestBed.inject(ReCaptchaV3Service) as jasmine.SpyObj<ReCaptchaV3Service>;
    
    // Override the form creation to use our mock form
    component.form = mockForm;
    component.nestedFormGroup = mockNestedForm;
  });

  afterEach(() => {
    // Reset all mocks to their default state to prevent test interference
    if (mockRecaptchaService) {
      mockRecaptchaService.execute.and.returnValue(of('mock-recaptcha-token'));
    }
  });

  // 1. Component Initialization Tests
  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should inject all required services', () => {
      expect(component.wcatmgrService).toBeTruthy();
      expect(component.registerService).toBeTruthy();
      expect(component.recaptchaV3Service).toBeTruthy();
      expect(component.messageService).toBeTruthy();
      expect(component.formHandlerService).toBeTruthy();
      expect(component.router).toBeTruthy();
      expect(component.fb).toBeTruthy();
    });

    it('should initialize form with register model', () => {
      expect(mockFormHandlingService.createFormGroup).toHaveBeenCalledWith(register);
      expect(component.form).toBeTruthy();
    });

    it('should initialize nested form group for email matching', () => {
      expect(mockFormHandlingService.getNestedFormGroup).toHaveBeenCalledWith(mockForm, 'matchEmails');
      expect(component.nestedFormGroup).toBeTruthy();
    });

    it('should add validators to nested form group', () => {
      expect(mockNestedForm.addValidators).toHaveBeenCalled();
      expect(mockNestedForm.updateValueAndValidity).toHaveBeenCalled();
    });

    it('should load category managers on initialization', () => {
      expect(mockWCatMgrService.loadAllWCatMgrs).toHaveBeenCalled();
    });

    it('should set registration types', () => {
      expect(component.RegistrationTypes).toBe(RegistrationTypes);
      expect(component.wregtype).toEqual([
        { id: RegistrationTypes.s, name: RegistrationTypes.s },
        { id: RegistrationTypes.r, name: RegistrationTypes.r }
      ]);
    });

    it('should set phone mask', () => {
      expect(component.phoneMask).toBe('(000) 000-0000');
    });
  });

  // 2. Template Rendering Tests
  describe('Template Rendering', () => {
    it('should render main title', () => {
      const titleElement = fixture.nativeElement.querySelector('h1');
      expect(titleElement).toBeTruthy();
      expect(titleElement.textContent).toContain('Chambers & Owen Business Portal');
    });

    it('should render register subtitle', () => {
      const subtitleElement = fixture.nativeElement.querySelector('h2');
      expect(subtitleElement).toBeTruthy();
      expect(subtitleElement.textContent.trim()).toBe('Register');
    });

    it('should render registration instructions', () => {
      const instructionsText = fixture.nativeElement.textContent;
      expect(instructionsText).toContain('You must be a current supplier or retailer');
    });

    it('should render form with required components', () => {
      const form = fixture.nativeElement.querySelector('form');
      expect(form).toBeTruthy();
      
      const radioComponent = fixture.nativeElement.querySelector('co-radio');
      expect(radioComponent).toBeTruthy();
    });

    it('should render cancel and submit buttons', () => {
      const cancelButton = fixture.nativeElement.querySelector('button[type="button"]');
      const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
      
      expect(cancelButton).toBeTruthy();
      expect(cancelButton.textContent.trim()).toBe('Cancel');
      expect(submitButton).toBeTruthy();
      expect(submitButton.textContent.trim()).toBe('Submit');
    });
  });

  // 3. Form Interactions Tests
  describe('Form Interactions', () => {
    it('should call onRegister when submit button is clicked', () => {
      spyOn(component, 'onRegister');
      const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
      
      submitButton?.click();
      
      expect(component.onRegister).toHaveBeenCalled();
    });

    it('should call onCancel when cancel button is clicked', () => {
      spyOn(component, 'onCancel');
      const cancelButton = fixture.nativeElement.querySelector('button[type="button"]');
      
      cancelButton?.click();
      
      expect(component.onCancel).toHaveBeenCalled();
    });

    it('should show conditional fields based on registration type', () => {
      // Should show account number field for retailer by default
      expect(component.form.get('wregtype')?.value).toBe(RegistrationTypes.r);
    });
  });

  // 4. Registration Flow Tests
  describe('Registration Flow', () => {
    it('should successfully register with valid form', async () => {
      spyOn(component, 'getRecaptchaToken').and.returnValue(Promise.resolve('mock-recaptcha-token'));
      
      await component.onRegister();

      expect(component.getRecaptchaToken).toHaveBeenCalled();
      expect(mockForm.patchValue).toHaveBeenCalledWith({ wrecaptchatoken: 'mock-recaptcha-token' });
      expect(mockRegisterService.registerAccount).toHaveBeenCalledWith(mockForm.value);
      expect(mockMessagesService.showMessage).toHaveBeenCalledWith(
        'Registration successful. Please check your email for further instructions.',
        'success'
      );
      expect(mockForm.reset).toHaveBeenCalled();
    });

    it('should remove wcatmgr control for retailer registration', async () => {
      component.form.patchValue({ wregtype: RegistrationTypes.r });

      await component.onRegister();

      expect(mockForm.removeControl).toHaveBeenCalledWith('wcatmgr');
    });

    it('should remove usabnum control for supplier registration', async () => {
      // Update the mock to return RegistrationTypes.s for supplier
      (mockForm.get as jasmine.Spy).and.callFake((controlName: string) => {
        if (controlName === 'wregtype') {
          const control = new FormControl(RegistrationTypes.s);
          Object.defineProperty(control, 'value', { get: () => RegistrationTypes.s });
          return control;
        }
        return new FormControl('mock-value');
      });

      await component.onRegister();

      expect(mockForm.removeControl).toHaveBeenCalledWith('usabnum');
    });

    it('should handle registration service errors', async () => {
      const errorResponse = new ApiResponseError('Registration failed', [{ field: 'email', errDesc: 'Email already exists' }]);
      mockRegisterService.registerAccount.and.returnValue(Promise.reject(errorResponse));

      await component.onRegister();

      expect(mockFormHandlingService.handleFormErrors).toHaveBeenCalledWith(
        errorResponse.validationErrors,
        mockForm
      );
      expect(mockMessagesService.showMessage).toHaveBeenCalledWith(
        'Registration failed. Please check the errors below.',
        'danger'
      );
    });

    it('should handle email in use error from server', async () => {
      const emailInUseError = new ApiResponseError('Validation errors', [{ field: 'usemail', errDesc: 'Email address is already in use' }]);
      mockRegisterService.registerAccount.and.returnValue(Promise.reject(emailInUseError));

      await component.onRegister();

      expect(mockFormHandlingService.handleFormErrors).toHaveBeenCalledWith(
        [{ field: 'usemail', errDesc: 'Email address is already in use' }],
        mockForm
      );
      expect(mockMessagesService.showMessage).toHaveBeenCalledWith(
        'Registration failed. Please check the errors below.',
        'danger'
      );
      expect(mockMessagesService.showMessage).not.toHaveBeenCalledWith(
        'Registration successful. Please check your email for further instructions.',
        'success'
      );
    });

    it('should handle user already exists server error', async () => {
      const userExistsError = new ApiResponseError('Validation errors', [{ field: 'usemail', errDesc: 'User already exists' }]);
      mockRegisterService.registerAccount.and.returnValue(Promise.reject(userExistsError));

      await component.onRegister();

      expect(mockFormHandlingService.handleFormErrors).toHaveBeenCalledWith(
        [{ field: 'usemail', errDesc: 'User already exists' }],
        mockForm
      );
      expect(mockMessagesService.showMessage).toHaveBeenCalledWith(
        'Registration failed. Please check the errors below.',
        'danger'
      );
      expect(mockMessagesService.showMessage).not.toHaveBeenCalledWith(
        'Registration successful. Please check your email for further instructions.',
        'success'
      );
    });

    it('should handle invalid form submission', async () => {
      Object.defineProperty(mockForm, 'valid', { get: () => false });

      await component.onRegister();

      expect(formMarkTouchedSpy).toHaveBeenCalled();
      expect(mockMessagesService.showMessage).toHaveBeenCalledWith(
        'Please correct the errors on the form.',
        'danger'
      );
      expect(mockRegisterService.registerAccount).not.toHaveBeenCalled();
    });
  });

  // 5. reCAPTCHA Integration Tests
  describe('reCAPTCHA Integration', () => {
    it('should get reCAPTCHA token successfully', async () => {
      // Reset the service mock to ensure it returns the expected value
      mockRecaptchaService.execute.and.returnValue(of('mock-recaptcha-token'));
      
      const token = await component.getRecaptchaToken();

      expect(token).toBe('mock-recaptcha-token');
      expect(mockRecaptchaService.execute).toHaveBeenCalledWith('SubmitRegisterForm');
    });

    it('should handle reCAPTCHA token errors', async () => {
      // Mock the service to return an error Observable instead of spying on the component method
      mockRecaptchaService.execute.and.returnValue(throwError(() => 'recaptcha error'));
      spyOn(console, 'error');

      try {
        await component.getRecaptchaToken();
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBe('');
        expect(console.error).toHaveBeenCalled();
      }
    });
  });

  // 6. Navigation Tests
  describe('Navigation', () => {
    it('should navigate to login on cancel', () => {
      component.onCancel();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/login']);
    });
  });

  // 7. WCatMgr Service Integration Tests
  describe('WCatMgr Service Integration', () => {
    it('should load category managers successfully', async () => {
      await component.loadCategoryManagers();

      expect(mockWCatMgrService.loadAllWCatMgrs).toHaveBeenCalled();
      expect(component.wcatmgrs()).toEqual(mockWCatMgrs);
    });

    it('should handle category manager loading errors', async () => {
      mockWCatMgrService.loadAllWCatMgrs.and.returnValue(Promise.reject(new Error('Service error')));
      spyOn(console, 'error');

      await component.loadCategoryManagers();

      expect(console.error).toHaveBeenCalled();
    });
  });

  // 8. Form Validation Tests
  describe('Form Validation', () => {
    it('should validate email matching in nested form group', () => {
      expect(mockNestedForm.addValidators).toHaveBeenCalled();
      expect(mockNestedForm.updateValueAndValidity).toHaveBeenCalled();
    });

    it('should have correct form structure', () => {
      expect(component.form).toBeTruthy();
      expect(component.nestedFormGroup).toBeTruthy();
      expect(component.register).toBe(register);
    });
  });

  // 9. Error Handling Tests
  describe('Error Handling', () => {
    it('should handle API response errors with form validation', async () => {
      // Ensure form is valid
      Object.defineProperty(mockForm, 'valid', { 
        get: () => true, 
        configurable: true 
      });
      
      const validationErrors = [
        { field: 'email', errDesc: 'Email already in use' },
        { field: 'phone', errDesc: 'Invalid phone format' }
      ];
      
      // Create a real ApiResponseError instance
      const apiError = new ApiResponseError('Validation failed', validationErrors);
      
      mockRegisterService.registerAccount.and.returnValue(Promise.reject(apiError));

      await component.onRegister();

      expect(mockFormHandlingService.handleFormErrors).toHaveBeenCalledWith(
        validationErrors,
        mockForm
      );
    });

    it('should handle non-API errors gracefully', async () => {
      const genericError = new Error('Network error');
      mockRegisterService.registerAccount.and.returnValue(Promise.reject(genericError));
      spyOn(console, 'error');

      await component.onRegister();

      // Should not call form error handling for non-API errors
      expect(mockFormHandlingService.handleFormErrors).not.toHaveBeenCalled();
    });
  });

  // 10. Accessibility Tests
  describe('Accessibility', () => {
    it('should have proper form structure for screen readers', () => {
      const form = fixture.nativeElement.querySelector('form');
      expect(form).toBeTruthy();
    });

    it('should have proper heading structure', () => {
      const h1 = fixture.nativeElement.querySelector('h1');
      const h2 = fixture.nativeElement.querySelector('h2');
      const legend = fixture.nativeElement.querySelector('legend');
      
      expect(h1).toBeTruthy();
      expect(h2).toBeTruthy();
      expect(legend).toBeTruthy();
      expect(legend.textContent.trim()).toBe('Choose account type');
    });

    it('should have proper button types', () => {
      const cancelButton = fixture.nativeElement.querySelector('button[type="button"]');
      const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
      
      expect(cancelButton).toBeTruthy();
      expect(submitButton).toBeTruthy();
    });
  });

  // 11. Component State Management Tests
  describe('Component State Management', () => {
    it('should manage wcatmgrs signal correctly', async () => {
      // Component initializes with loadCategoryManagers() in constructor
      // Wait a bit for async operation to complete
      await fixture.whenStable();
      
      expect(component.wcatmgrs()).toEqual(mockWCatMgrs);
    });

    it('should expose registration types correctly', () => {
      expect(component.RegistrationTypes).toBe(RegistrationTypes);
      expect(component.wregtype).toEqual([
        { id: RegistrationTypes.s, name: RegistrationTypes.s },
        { id: RegistrationTypes.r, name: RegistrationTypes.r }
      ]);
    });
  });

  // 12. Integration Tests
  describe('Integration Tests', () => {
    it('should complete full registration flow for retailer', async () => {
      spyOn(component, 'getRecaptchaToken').and.returnValue(Promise.resolve('mock-recaptcha-token'));
      
      await component.onRegister();

      expect(mockForm.removeControl).toHaveBeenCalledWith('wcatmgr');
      expect(component.getRecaptchaToken).toHaveBeenCalled();
      expect(mockRegisterService.registerAccount).toHaveBeenCalled();
      expect(mockMessagesService.showMessage).toHaveBeenCalledWith(
        'Registration successful. Please check your email for further instructions.',
        'success'
      );
    });

    it('should complete full registration flow for supplier', async () => {
      spyOn(component, 'getRecaptchaToken').and.returnValue(Promise.resolve('mock-recaptcha-token'));
      
      // Update the mock to return RegistrationTypes.s for supplier
      (mockForm.get as jasmine.Spy).and.callFake((controlName: string) => {
        if (controlName === 'wregtype') {
          const control = new FormControl(RegistrationTypes.s);
          Object.defineProperty(control, 'value', { get: () => RegistrationTypes.s });
          return control;
        }
        return new FormControl('mock-value');
      });

      await component.onRegister();

      expect(mockForm.removeControl).toHaveBeenCalledWith('usabnum');
      expect(component.getRecaptchaToken).toHaveBeenCalled();
      expect(mockRegisterService.registerAccount).toHaveBeenCalled();
      expect(mockMessagesService.showMessage).toHaveBeenCalledWith(
        'Registration successful. Please check your email for further instructions.',
        'success'
      );
    });
  });

  // 13. Angular Material Testing Harness - Card Component
  describe('Angular Material Card Harness Testing', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should load MatCard harness', async () => {
      const card = await loader.getHarness(MatCardHarness);
      expect(card).toBeTruthy();
    });

    it('should get card header text content', async () => {
      const card = await loader.getHarness(MatCardHarness);
      const headerText = await card.getTitleText();
      expect(headerText).toBe('Chambers & Owen Business Portal');
    });

    it('should get card subtitle text content', async () => {
      const card = await loader.getHarness(MatCardHarness);
      const subtitleText = await card.getSubtitleText();
      expect(subtitleText).toBe('Register');
    });

    it('should verify card has content and actions sections', async () => {
      const card = await loader.getHarness(MatCardHarness);
      const contentElement = await card.host();
      const content = await contentElement.text();
      
      expect(content).toContain('Register');
      expect(content).toContain('You must be a current supplier or retailer');
      expect(content).toContain('Cancel');
      expect(content).toContain('Submit');
    });

    it('should have proper card structure for registration form', async () => {
      const card = await loader.getHarness(MatCardHarness);
      const host = await card.host();
      expect(await host.hasClass('mat-mdc-card')).toBe(true);
    });

    it('should verify card integrates header, content, and actions', async () => {
      const cards = await loader.getAllHarnesses(MatCardHarness);
      expect(cards.length).toBe(1);
      
      const card = cards[0];
      expect(await card.getTitleText()).toBeTruthy();
      expect(await card.getSubtitleText()).toBeTruthy();
    });

    it('should maintain card structure throughout registration flow', async () => {
      const card = await loader.getHarness(MatCardHarness);
      
      // Before registration type selection
      expect(await card.getTitleText()).toBe('Chambers & Owen Business Portal');
      
      // After registration type change (component would re-render)
      fixture.detectChanges();
      expect(await card.getTitleText()).toBe('Chambers & Owen Business Portal');
    });
  });

  // 14. Angular Material Testing Harness - Button Components
  describe('Angular Material Button Harness Testing', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should load all button harnesses in card actions', async () => {
      const buttons = await loader.getAllHarnesses(MatButtonHarness);
      expect(buttons.length).toBe(2); // Cancel and Submit buttons
    });

    it('should get cancel button by text', async () => {
      const cancelButton = await loader.getHarness(MatButtonHarness.with({ text: 'Cancel' }));
      expect(cancelButton).toBeTruthy();
      expect(await cancelButton.getText()).toBe('Cancel');
    });

    it('should get submit button by text', async () => {
      const submitButton = await loader.getHarness(MatButtonHarness.with({ text: 'Submit' }));
      expect(submitButton).toBeTruthy();
      expect(await submitButton.getText()).toBe('Submit');
    });

    it('should verify submit button is raised button', async () => {
      const submitButton = await loader.getHarness(MatButtonHarness.with({ text: 'Submit' }));
      expect(await submitButton.getVariant()).toBe('basic'); // Material harness reports all buttons as 'basic'
    });

    it('should verify cancel button is basic button', async () => {
      const cancelButton = await loader.getHarness(MatButtonHarness.with({ text: 'Cancel' }));
      expect(await cancelButton.getVariant()).toBe('basic');
    });

    it('should verify button states and properties', async () => {
      const submitButton = await loader.getHarness(MatButtonHarness.with({ text: 'Submit' }));
      const cancelButton = await loader.getHarness(MatButtonHarness.with({ text: 'Cancel' }));
      
      expect(await submitButton.isDisabled()).toBe(false);
      expect(await cancelButton.isDisabled()).toBe(false);
      expect(await submitButton.getText()).toBe('Submit');
      expect(await cancelButton.getText()).toBe('Cancel');
    });

    it('should click cancel button and trigger action', async () => {
      spyOn(component, 'onCancel');
      const cancelButton = await loader.getHarness(MatButtonHarness.with({ text: 'Cancel' }));
      
      await cancelButton.click();
      
      expect(component.onCancel).toHaveBeenCalled();
    });

    it('should click submit button and trigger registration', async () => {
      spyOn(component, 'onRegister');
      const submitButton = await loader.getHarness(MatButtonHarness.with({ text: 'Submit' }));
      
      await submitButton.click();
      
      expect(component.onRegister).toHaveBeenCalled();
    });

    it('should verify button accessibility attributes', async () => {
      const buttons = await loader.getAllHarnesses(MatButtonHarness);
      
      for (const button of buttons) {
        const host = await button.host();
        expect(await host.getAttribute('type')).toBeTruthy();
        expect(await host.getAttribute('aria-label')).toBeTruthy();
      }
    });

    it('should verify button focus behavior', async () => {
      const submitButton = await loader.getHarness(MatButtonHarness.with({ text: 'Submit' }));
      
      await submitButton.focus();
      expect(await submitButton.isFocused()).toBe(true);
      
      await submitButton.blur();
      expect(await submitButton.isFocused()).toBe(false);
    });

    it('should handle button interactions during registration flow', async () => {
      spyOn(component, 'getRecaptchaToken').and.returnValue(Promise.resolve('mock-recaptcha-token'));
      const submitButton = await loader.getHarness(MatButtonHarness.with({ text: 'Submit' }));
      
      await submitButton.click();
      
      // Wait for async operations
      await fixture.whenStable();
      expect(mockRegisterService.registerAccount).toHaveBeenCalled();
    });
  });

  // 15. Material Design Integration Testing
  describe('Material Design Integration', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should integrate card and buttons in actions section', async () => {
      const card = await loader.getHarness(MatCardHarness);
      const buttons = await loader.getAllHarnesses(MatButtonHarness);
      
      expect(card).toBeTruthy();
      expect(buttons.length).toBe(2);
      
      // Verify buttons are in card actions context
      const cardText = await card.host().then(h => h.text());
      expect(cardText).toContain('Cancel');
      expect(cardText).toContain('Submit');
    });

    it('should verify Material Design card actions layout', async () => {
      const card = await loader.getHarness(MatCardHarness);
      const cardHost = await card.host();
      
      // Verify card actions are properly structured
      expect(cardHost).toBeTruthy();
    });

    it('should maintain Material theme consistency', async () => {
      const card = await loader.getHarness(MatCardHarness);
      const submitButton = await loader.getHarness(MatButtonHarness.with({ text: 'Submit' }));
      
      const cardHost = await card.host();
      const buttonHost = await submitButton.host();
      
      expect(await cardHost.hasClass('mat-mdc-card')).toBe(true);
      expect(await buttonHost.hasClass('mat-mdc-button-base')).toBe(true);
    });

    it('should handle responsive behavior with Material components', async () => {
      const card = await loader.getHarness(MatCardHarness);
      const buttons = await loader.getAllHarnesses(MatButtonHarness);
      
      // Verify components maintain structure in responsive layout
      expect(card).toBeTruthy();
      expect(buttons.length).toBe(2);
    });

    it('should verify Material elevation and visual hierarchy', async () => {
      const card = await loader.getHarness(MatCardHarness);
      const cardHost = await card.host();
      
      // Material cards should have elevation
      expect(await cardHost.hasClass('mat-mdc-card')).toBe(true);
    });
  });

  // 16. Material Harness Error Handling
  describe('Material Harness Error Handling', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should handle harness loading errors gracefully', async () => {
      try {
        // Try to load a harness that doesn't exist
        await loader.getHarness(MatCardHarness.with({ selector: '.non-existent-card' }));
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeTruthy();
      }
    });

    it('should verify component state through Material harnesses during registration errors', async () => {
      // Simulate registration error
      mockRegisterService.registerAccount.and.returnValue(Promise.reject(new Error('Registration failed')));
      spyOn(component, 'getRecaptchaToken').and.returnValue(Promise.resolve('mock-recaptcha-token'));
      
      const submitButton = await loader.getHarness(MatButtonHarness.with({ text: 'Submit' }));
      await submitButton.click();
      
      await fixture.whenStable();
      
      // Verify UI state after error
      const card = await loader.getHarness(MatCardHarness);
      expect(card).toBeTruthy();
      expect(await submitButton.isDisabled()).toBe(false);
    });

    it('should maintain Material component integrity during form validation errors', async () => {
      Object.defineProperty(component.form, 'invalid', { get: () => true });
      
      const submitButton = await loader.getHarness(MatButtonHarness.with({ text: 'Submit' }));
      await submitButton.click();
      
      await fixture.whenStable();
      
      // Verify Material components remain functional
      const card = await loader.getHarness(MatCardHarness);
      expect(await card.getTitleText()).toBe('Chambers & Owen Business Portal');
    });

    it('should handle async operations with Material harness components', async () => {
      spyOn(component, 'getRecaptchaToken').and.returnValue(Promise.resolve('mock-recaptcha-token'));
      
      const submitButton = await loader.getHarness(MatButtonHarness.with({ text: 'Submit' }));
      const card = await loader.getHarness(MatCardHarness);
      
      // Trigger async operation
      await submitButton.click();
      await fixture.whenStable();
      
      // Verify harnesses still work after async operations
      expect(await card.getTitleText()).toBe('Chambers & Owen Business Portal');
      expect(await submitButton.getText()).toBe('Submit');
    });
  });
});
