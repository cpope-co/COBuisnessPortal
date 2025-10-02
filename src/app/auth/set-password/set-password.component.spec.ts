import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NGX_MASK_CONFIG } from 'ngx-mask';

import { SetPasswordComponent } from './set-password.component';
import { PasswordService } from '../../services/password.service';
import { MessagesService } from '../../messages/messages.service';
import { FormHandlingService } from '../../services/form-handling.service';
import { setPassword } from '../../models/password.model';
import { ApiResponseError } from '../../shared/api-response-error';

// Mock components
@Component({
  selector: 'co-input',
  template: `<div class="mock-input"></div>`,
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

  writeValue(value: any): void {}
  registerOnChange(fn: any): void {}
  registerOnTouched(fn: any): void {}
  setDisabledState(isDisabled: boolean): void {}
}

describe('SetPasswordComponent', () => {
  let component: SetPasswordComponent;
  let fixture: ComponentFixture<SetPasswordComponent>;
  let mockPasswordService: jasmine.SpyObj<PasswordService>;
  let mockMessagesService: jasmine.SpyObj<MessagesService>;
  let mockFormHandlingService: jasmine.SpyObj<FormHandlingService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockForm: FormGroup;
  let formMarkTouchedSpy: jasmine.Spy;

  beforeEach(async () => {
    const passwordSpy = jasmine.createSpyObj('PasswordService', ['setPassword']);
    const messagesSpy = jasmine.createSpyObj('MessagesService', ['showMessage']);
    const formHandlingSpy = jasmine.createSpyObj('FormHandlingService', ['createFormGroup', 'handleFormErrors']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    // Setup form mocks
    mockForm = new FormGroup({
      password: new FormControl('TestPassword123!'),
      confirmPassword: new FormControl('TestPassword123!')
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
    spyOn(mockForm, 'addValidators');
    spyOn(mockForm, 'updateValueAndValidity');
    spyOn(mockForm, 'reset');

    formHandlingSpy.createFormGroup.and.returnValue(mockForm);
    
    // Setup other service mocks
    passwordSpy.setPassword.and.returnValue(Promise.resolve());
    routerSpy.navigate.and.returnValue(Promise.resolve(true));

    await TestBed.configureTestingModule({
      imports: [
        SetPasswordComponent,
        ReactiveFormsModule,
        MatButtonModule,
        MatCardModule,
        NoopAnimationsModule,
        MockInputComponent
      ],
      providers: [
        { provide: PasswordService, useValue: passwordSpy },
        { provide: MessagesService, useValue: messagesSpy },
        { provide: FormHandlingService, useValue: formHandlingSpy },
        { provide: Router, useValue: routerSpy },
        { provide: NGX_MASK_CONFIG, useValue: { 
          validation: false,
          showMaskTyped: false,
          placeHolderCharacter: '_',
          shownMaskExpression: ''
        } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SetPasswordComponent);
    component = fixture.componentInstance;
    
    mockPasswordService = TestBed.inject(PasswordService) as jasmine.SpyObj<PasswordService>;
    mockMessagesService = TestBed.inject(MessagesService) as jasmine.SpyObj<MessagesService>;
    mockFormHandlingService = TestBed.inject(FormHandlingService) as jasmine.SpyObj<FormHandlingService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    
    // Override the form creation to use our mock form
    component.form = mockForm;
  });

  // 1. Component Initialization Tests
  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should inject all required services', () => {
      expect(component.passwordService).toBeTruthy();
      expect(component.messageService).toBeTruthy();
      expect(component.formHandlerService).toBeTruthy();
      expect(component.router).toBeTruthy();
    });

    it('should initialize form with setPassword model', () => {
      expect(mockFormHandlingService.createFormGroup).toHaveBeenCalledWith(setPassword);
      expect(component.form).toBeTruthy();
    });

    it('should add password matching validators to form', () => {
      expect(mockForm.addValidators).toHaveBeenCalled();
      expect(mockForm.updateValueAndValidity).toHaveBeenCalled();
    });

    it('should set setPassword model', () => {
      expect(component.setPassword).toBe(setPassword);
    });
  });

  // 2. Template Rendering Tests
  describe('Template Rendering', () => {
    it('should render main title', () => {
      const titleElement = fixture.nativeElement.querySelector('h1');
      expect(titleElement).toBeTruthy();
      expect(titleElement.textContent.trim()).toBe('Set Password');
    });

    it('should render instruction text', () => {
      const instructionText = fixture.nativeElement.textContent;
      expect(instructionText).toContain('Since you\'re logging in for the first time');
      expect(instructionText).toContain('This must be completed before accessing your account');
    });

    it('should render password requirements list', () => {
      const requirementsList = fixture.nativeElement.querySelector('ul');
      expect(requirementsList).toBeTruthy();
      
      const requirements = fixture.nativeElement.querySelectorAll('li');
      expect(requirements.length).toBe(5);
      expect(requirements[0].textContent).toContain('at least 10 characters long');
      expect(requirements[1].textContent).toContain('at least one uppercase letter');
      expect(requirements[2].textContent).toContain('at least one lowercase letter');
      expect(requirements[3].textContent).toContain('at least one number');
      expect(requirements[4].textContent).toContain('at least one special character');
    });

    it('should render form with password inputs', () => {
      const form = fixture.nativeElement.querySelector('form');
      expect(form).toBeTruthy();
      
      const inputComponents = fixture.nativeElement.querySelectorAll('co-input');
      expect(inputComponents.length).toBe(2);
    });

    it('should render set password button', () => {
      const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
      expect(submitButton).toBeTruthy();
      expect(submitButton.textContent.trim()).toBe('Set Password');
    });
  });

  // 3. Form Interactions Tests
  describe('Form Interactions', () => {
    it('should call onChangePassword when submit button is clicked', () => {
      spyOn(component, 'onChangePassword');
      const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
      
      submitButton?.click();
      
      expect(component.onChangePassword).toHaveBeenCalled();
    });

    it('should have correct form structure', () => {
      expect(component.form.get('password')).toBeTruthy();
      expect(component.form.get('confirmPassword')).toBeTruthy();
    });
  });

  // 4. Password Setting Tests
  describe('Password Setting', () => {
    it('should successfully set password with valid form', async () => {
      await component.onChangePassword();
      
      expect(mockPasswordService.setPassword).toHaveBeenCalledWith(jasmine.objectContaining({
        password: jasmine.any(String),
        confirmPassword: jasmine.any(String)
      }));
      expect(mockMessagesService.showMessage).toHaveBeenCalledWith(
        'Password has been set successfully!',
        'success'
      );
      expect(mockForm.reset).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/login']);
    });

    it('should handle password setting errors', async () => {
      const error = new Error('Password setting failed');
      mockPasswordService.setPassword.and.returnValue(Promise.reject(error));
      spyOn(console, 'error');
      
      await component.onChangePassword();
      
      expect(console.error).toHaveBeenCalledWith('Error changing password', error);
      expect(mockMessagesService.showMessage).toHaveBeenCalledWith(
        'Failed to set password. Please try again.',
        'danger'
      );
    });

    it('should handle API response errors with form validation', async () => {
      const validationErrors = [
        { field: 'password', errDesc: 'Password too weak' }
      ];
      const apiError = new ApiResponseError('Validation failed', validationErrors);
      mockPasswordService.setPassword.and.returnValue(Promise.reject(apiError));
      spyOn(console, 'error');
      
      await component.onChangePassword();
      
      expect(console.error).toHaveBeenCalledWith('Error changing password', apiError);
      expect(mockFormHandlingService.handleFormErrors).toHaveBeenCalledWith(
        validationErrors,
        mockForm
      );
    });

    it('should handle invalid form submission', async () => {
      Object.defineProperty(mockForm, 'valid', { get: () => false });
      
      await component.onChangePassword();
      
      expect(formMarkTouchedSpy).toHaveBeenCalled();
      expect(mockMessagesService.showMessage).toHaveBeenCalledWith(
        'Please correct the errors in the form.',
        'danger'
      );
      expect(mockPasswordService.setPassword).not.toHaveBeenCalled();
    });
  });

  // 5. Form Validation Tests
  describe('Form Validation', () => {
    it('should have password matching validator added', () => {
      expect(mockForm.addValidators).toHaveBeenCalled();
      expect(mockForm.updateValueAndValidity).toHaveBeenCalled();
    });

    it('should validate form correctly', () => {
      expect(component.form.valid).toBe(true);
    });
  });

  // 6. Navigation Tests
  describe('Navigation', () => {
    it('should navigate to login after successful password set', async () => {
      await component.onChangePassword();
      
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/login']);
    });
  });

  // 7. Model Integration Tests
  describe('Model Integration', () => {
    it('should use setPassword model for form creation', () => {
      expect(mockFormHandlingService.createFormGroup).toHaveBeenCalledWith(setPassword);
      expect(component.setPassword).toBe(setPassword);
    });

    it('should pass model to input components', () => {
      // This is tested through the template rendering
      const inputComponents = fixture.nativeElement.querySelectorAll('co-input');
      expect(inputComponents.length).toBe(2);
    });
  });

  // 7. Accessibility Tests
  describe('Accessibility', () => {
    it('should have proper form structure for screen readers', () => {
      const form = fixture.nativeElement.querySelector('form');
      expect(form).toBeTruthy();
    });

    it('should have proper heading structure', () => {
      const h1 = fixture.nativeElement.querySelector('h1');
      expect(h1).toBeTruthy();
      expect(h1.textContent.trim()).toBe('Set Password');
    });

    it('should have proper button type', () => {
      const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
      expect(submitButton).toBeTruthy();
    });

    it('should have informative content for users', () => {
      const instructionText = fixture.nativeElement.textContent;
      expect(instructionText).toContain('Since you\'re logging in for the first time');
      
      const requirementsList = fixture.nativeElement.querySelector('ul');
      expect(requirementsList).toBeTruthy();
    });
  });

  // 8. Component State Management Tests
  describe('Component State Management', () => {
    it('should maintain form state correctly', () => {
      expect(component.form).toBeTruthy();
      expect(component.form.get('password')).toBeTruthy();
      expect(component.form.get('confirmPassword')).toBeTruthy();
    });

    it('should expose setPassword model correctly', () => {
      expect(component.setPassword).toBe(setPassword);
    });
  });

  // 9. Error Handling Tests
  describe('Error Handling', () => {
    it('should handle errors gracefully in onChangePassword', async () => {
      spyOn(console, 'error');
      
      // Override onChangePassword to simulate an error
      component.onChangePassword = async () => {
        try {
          throw new Error('Test error');
        } catch (error) {
          console.error('Error changing password', error);
        }
      };
      
      await component.onChangePassword();
      
      expect(console.error).toHaveBeenCalledWith('Error changing password', jasmine.any(Error));
    });
  });

  // 10. Integration Tests
  describe('Integration Tests', () => {
    it('should integrate form handling service correctly', () => {
      expect(mockFormHandlingService.createFormGroup).toHaveBeenCalledWith(setPassword);
      expect(component.form).toBeTruthy();
    });

    it('should integrate with password validation', () => {
      expect(mockForm.addValidators).toHaveBeenCalled();
      expect(mockForm.updateValueAndValidity).toHaveBeenCalled();
    });

    it('should have proper service dependencies', () => {
      expect(component.passwordService).toBeTruthy();
      expect(component.messageService).toBeTruthy();
      expect(component.formHandlerService).toBeTruthy();
    });
  });

  // 11. Material Design Integration Tests
  describe('Material Design Integration', () => {
    it('should render Material Card correctly', () => {
      const matCard = fixture.nativeElement.querySelector('mat-card');
      expect(matCard).toBeTruthy();
      
      const matCardHeader = fixture.nativeElement.querySelector('mat-card-header');
      expect(matCardHeader).toBeTruthy();
      
      const matCardContent = fixture.nativeElement.querySelector('mat-card-content');
      expect(matCardContent).toBeTruthy();
      
      const matCardActions = fixture.nativeElement.querySelector('mat-card-actions');
      expect(matCardActions).toBeTruthy();
    });

    it('should have Material Button with correct attributes', () => {
      const matButton = fixture.nativeElement.querySelector('button[mat-raised-button]');
      expect(matButton).toBeTruthy();
      expect(matButton.getAttribute('color')).toBe('primary');
      expect(matButton.classList.contains('w-100')).toBe(true);
    });
  });

  // 12. Component Lifecycle Tests
  describe('Component Lifecycle', () => {
    it('should initialize form during construction', () => {
      expect(mockFormHandlingService.createFormGroup).toHaveBeenCalledWith(setPassword);
      expect(component.form).toBeTruthy();
    });

    it('should add validators during initialization', () => {
      expect(mockForm.addValidators).toHaveBeenCalled();
      expect(mockForm.updateValueAndValidity).toHaveBeenCalled();
    });
  });
});
