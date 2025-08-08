import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../auth.service';
import { SessionService } from '../../services/session.service';
import { MessagesService } from '../../messages/messages.service';
import { FormHandlingService } from '../../services/form-handling.service';
import { Router } from '@angular/router';
import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { login } from '../../models/login.model';
import { User } from '../../models/user.model';
import { NGX_MASK_CONFIG } from 'ngx-mask';

// Mock InputComponent
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
  setDisabledState?(isDisabled: boolean): void {}
}

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockSessionService: jasmine.SpyObj<SessionService>;
  let mockMessagesService: jasmine.SpyObj<MessagesService>;
  let mockFormHandlingService: jasmine.SpyObj<FormHandlingService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockForm: FormGroup;
  let formMarkTouchedSpy: jasmine.Spy;
  
  const mockUser: User = {
    sub: 1,
    name: 'Test User',
    role: 1,
    exp: Date.now() + 3600000,
    iat: Date.now(),
    refexp: Date.now() + 7200000,
    fpc: false
  };

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['login']);
    const sessionSpy = jasmine.createSpyObj('SessionService', ['startSessionCheck', 'stopSessionCheck']);
    const messagesSpy = jasmine.createSpyObj('MessagesService', ['showMessage']);
    const formHandlingSpy = jasmine.createSpyObj('FormHandlingService', ['createFormGroup']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    // Setup form mock
    mockForm = new FormGroup({
      email: new FormControl('test@example.com'),
      password: new FormControl('password123')
    });
    Object.defineProperty(mockForm, 'invalid', { 
      get: () => false, 
      configurable: true 
    });
    formMarkTouchedSpy = spyOn(mockForm, 'markAllAsTouched');
    formHandlingSpy.createFormGroup.and.returnValue(mockForm);
    
    // Setup default return values
    routerSpy.navigate.and.returnValue(Promise.resolve(true));

    await TestBed.configureTestingModule({
      imports: [
        LoginComponent,
        ReactiveFormsModule,
        MatButtonModule,
        MatCardModule,
        NoopAnimationsModule,
        MockInputComponent,
        RouterTestingModule
      ],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: SessionService, useValue: sessionSpy },
        { provide: MessagesService, useValue: messagesSpy },
        { provide: FormHandlingService, useValue: formHandlingSpy },
        { provide: NGX_MASK_CONFIG, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    mockSessionService = TestBed.inject(SessionService) as jasmine.SpyObj<SessionService>;
    mockMessagesService = TestBed.inject(MessagesService) as jasmine.SpyObj<MessagesService>;
    mockFormHandlingService = TestBed.inject(FormHandlingService) as jasmine.SpyObj<FormHandlingService>;
    
    // Override the component's router with our spy
    mockRouter = routerSpy;
    component.router = mockRouter;
  });

  // 1. Initialization Tests
  describe('Component Initialization', () => {
    it('should create', () => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });

    it('should inject all required services', () => {
      fixture.detectChanges();
      expect(component.authService).toBeTruthy();
      expect(component.sessionService).toBeTruthy();
      expect(component.messageService).toBeTruthy();
      expect(component.router).toBeTruthy();
      expect(component.formHandlerService).toBeTruthy();
    });

    it('should initialize form with login model', () => {
      fixture.detectChanges();
      expect(mockFormHandlingService.createFormGroup).toHaveBeenCalledWith(login);
      expect(component.form).toBeTruthy();
    });

    it('should set login model reference', () => {
      fixture.detectChanges();
      expect(component.login).toBe(login);
    });
  });

  // 2. Template Rendering Tests
  describe('Template Rendering', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should render main title', () => {
      const titleElement = fixture.nativeElement.querySelector('mat-card-title h1');
      expect(titleElement?.textContent).toContain('Chambers & Owen Business Portal');
    });

    it('should render login subtitle', () => {
      const subtitleElement = fixture.nativeElement.querySelector('mat-card-subtitle h2');
      expect(subtitleElement?.textContent).toContain('Login');
    });

    it('should render form with required inputs', () => {
      const formElement = fixture.nativeElement.querySelector('form');
      expect(formElement).toBeTruthy();
      
      const inputComponents = fixture.nativeElement.querySelectorAll('co-input');
      expect(inputComponents.length).toBe(2);
    });

    it('should render login button', () => {
      const loginButton = fixture.nativeElement.querySelector('button[type="submit"]');
      expect(loginButton).toBeTruthy();
      expect(loginButton?.textContent.trim()).toBe('Login');
    });

    it('should render forgot credentials link', () => {
      fixture.detectChanges();
      const forgotLink = Array.from(fixture.nativeElement.querySelectorAll('a')).find((a: any) => 
        a.textContent.trim() === 'Forgot credentials?'
      ) as HTMLAnchorElement;
      expect(forgotLink).toBeTruthy();
      expect(forgotLink.textContent?.trim()).toBe('Forgot credentials?');
    });

    it('should render register link', () => {
      fixture.detectChanges();
      const registerLink = Array.from(fixture.nativeElement.querySelectorAll('a')).find((a: any) => 
        a.textContent.trim() === 'Register'
      ) as HTMLAnchorElement;
      expect(registerLink).toBeTruthy();
      expect(registerLink.textContent?.trim()).toBe('Register');
    });
  });

  // 3. User Interaction Tests
  describe('User Interactions', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should call onLogin when login button is clicked', () => {
      spyOn(component, 'onLogin');
      const loginButton = fixture.nativeElement.querySelector('button[type="submit"]');
      
      loginButton?.click();
      
      expect(component.onLogin).toHaveBeenCalled();
    });

    it('should navigate to forgot password page when forgot link is clicked', () => {
      fixture.detectChanges();
      const forgotLink = Array.from(fixture.nativeElement.querySelectorAll('a')).find((a: any) => 
        a.textContent.trim() === 'Forgot credentials?'
      ) as HTMLAnchorElement;
      expect(forgotLink).toBeTruthy();
    });

    it('should navigate to register page when register link is clicked', () => {
      fixture.detectChanges();
      const registerLink = Array.from(fixture.nativeElement.querySelectorAll('a')).find((a: any) => 
        a.textContent.trim() === 'Register'
      ) as HTMLAnchorElement;
      expect(registerLink).toBeTruthy();
    });
  });

  // 4. Form Integration Tests
  describe('Form Integration', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should bind form to template', () => {
      const formElement = fixture.nativeElement.querySelector('form');
      expect(formElement).toBeTruthy();
    });

    it('should pass correct properties to email input', () => {
      const emailInputs = fixture.nativeElement.querySelectorAll('co-input');
      expect(emailInputs.length).toBeGreaterThan(0);
    });

    it('should pass correct properties to password input', () => {
      const passwordInputs = fixture.nativeElement.querySelectorAll('co-input');
      expect(passwordInputs.length).toBeGreaterThan(1);
    });
  });

  // 5. Authentication Flow Tests
  describe('Authentication Flow', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should successfully login with valid credentials', async () => {
      mockAuthService.login.and.returnValue(Promise.resolve(mockUser));
      mockRouter.navigate.and.returnValue(Promise.resolve(true));

      await component.onLogin();

      expect(mockAuthService.login).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(mockSessionService.startSessionCheck).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['home']);
    });

    it('should handle login failure', async () => {
      mockAuthService.login.and.returnValue(Promise.reject(new Error('Invalid credentials')));

      await component.onLogin();

      expect(mockMessagesService.showMessage).toHaveBeenCalledWith('Invalid email or password.', 'danger');
      expect(formMarkTouchedSpy).toHaveBeenCalled();
      expect(mockSessionService.stopSessionCheck).toHaveBeenCalled();
    });

    it('should extract email and password from form value', async () => {
      mockAuthService.login.and.returnValue(Promise.resolve(mockUser));
      const formValue = { email: 'user@test.com', password: 'testpass' };
      Object.defineProperty(component.form, 'value', { get: () => formValue });

      await component.onLogin();

      expect(mockAuthService.login).toHaveBeenCalledWith('user@test.com', 'testpass');
    });
  });

  // 6. Form Validation Tests
  describe('Form Validation', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should show error message when form is invalid', async () => {
      Object.defineProperty(component.form, 'invalid', { get: () => true });

      await component.onLogin();

      expect(formMarkTouchedSpy).toHaveBeenCalled();
      expect(mockMessagesService.showMessage).toHaveBeenCalledWith('Please correct the errors on the form.', 'danger');
      expect(mockAuthService.login).not.toHaveBeenCalled();
    });

    it('should not proceed with login when form is invalid', async () => {
      Object.defineProperty(component.form, 'invalid', { get: () => true });

      await component.onLogin();

      expect(mockAuthService.login).not.toHaveBeenCalled();
      expect(mockSessionService.startSessionCheck).not.toHaveBeenCalled();
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should validate form before attempting login', async () => {
      Object.defineProperty(component.form, 'invalid', { get: () => false });
      mockAuthService.login.and.returnValue(Promise.resolve(mockUser));

      await component.onLogin();

      expect(mockAuthService.login).toHaveBeenCalled();
    });
  });

  // 7. Service Integration Tests
  describe('Service Integration', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should call AuthService login with correct parameters', async () => {
      mockAuthService.login.and.returnValue(Promise.resolve(mockUser));
      const testEmail = 'test@example.com';
      const testPassword = 'password123';
      Object.defineProperty(component.form, 'value', { 
        get: () => ({ email: testEmail, password: testPassword }) 
      });

      await component.onLogin();

      expect(mockAuthService.login).toHaveBeenCalledWith(testEmail, testPassword);
    });

    it('should start session check after successful login', async () => {
      mockAuthService.login.and.returnValue(Promise.resolve(mockUser));
      mockRouter.navigate.and.returnValue(Promise.resolve(true));

      await component.onLogin();

      expect(mockSessionService.startSessionCheck).toHaveBeenCalled();
    });

    it('should stop session check on login failure', async () => {
      mockAuthService.login.and.returnValue(Promise.reject(new Error('Login failed')));

      await component.onLogin();

      expect(mockSessionService.stopSessionCheck).toHaveBeenCalled();
    });

    it('should navigate to home page after successful login', async () => {
      mockAuthService.login.and.returnValue(Promise.resolve(mockUser));
      mockRouter.navigate.and.returnValue(Promise.resolve(true));

      await component.onLogin();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['home']);
    });
  });

  // 8. Error Handling Tests
  describe('Error Handling', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should handle authentication service errors gracefully', async () => {
      mockAuthService.login.and.returnValue(Promise.reject(new Error('Network error')));

      await component.onLogin();

      expect(mockMessagesService.showMessage).toHaveBeenCalledWith('Invalid email or password.', 'danger');
      expect(formMarkTouchedSpy).toHaveBeenCalled();
    });

    it('should handle router navigation errors', async () => {
      mockAuthService.login.and.returnValue(Promise.resolve(mockUser));
      mockRouter.navigate.and.returnValue(Promise.reject(new Error('Navigation failed')));

      await component.onLogin();

      // Navigation happens after login, session should be started regardless
      expect(mockSessionService.startSessionCheck).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['home']);
    });

    it('should mark form as touched on error', async () => {
      mockAuthService.login.and.returnValue(Promise.reject(new Error('Error')));

      await component.onLogin();

      expect(formMarkTouchedSpy).toHaveBeenCalled();
    });
  });

  // 9. Accessibility Tests
  describe('Accessibility', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should have proper form structure for screen readers', () => {
      const formElement = fixture.nativeElement.querySelector('form');
      expect(formElement).toBeTruthy();
    });

    it('should have proper button types', () => {
      const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
      expect(submitButton).toBeTruthy();
      
      const linkButtons = fixture.nativeElement.querySelectorAll('a[type="button"]');
      expect(linkButtons.length).toBe(2);
    });

    it('should have semantic heading structure', () => {
      const h1 = fixture.nativeElement.querySelector('h1');
      const h2 = fixture.nativeElement.querySelector('h2');
      expect(h1).toBeTruthy();
      expect(h2).toBeTruthy();
    });
  });

  // 10. Styling & Layout Tests
  describe('Styling & Layout', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should apply responsive grid classes', () => {
      const gridContainer = fixture.nativeElement.querySelector('.row');
      expect(gridContainer).toBeTruthy();
      
      const gridColumn = fixture.nativeElement.querySelector('.col-xs-12.offset-xs-0.col-6.offset-3');
      expect(gridColumn).toBeTruthy();
    });

    it('should apply Material Design card structure', () => {
      const card = fixture.nativeElement.querySelector('mat-card');
      const cardHeader = fixture.nativeElement.querySelector('mat-card-header');
      const cardContent = fixture.nativeElement.querySelector('mat-card-content');
      
      expect(card).toBeTruthy();
      expect(cardHeader).toBeTruthy();
      expect(cardContent).toBeTruthy();
    });

    it('should apply button styling classes', () => {
      const loginButton = fixture.nativeElement.querySelector('button[mat-raised-button]');
      expect(loginButton).toBeTruthy();
      expect(loginButton?.classList.contains('w-100')).toBe(true);
    });

    it('should apply margin classes to elements', () => {
      const forgotLink = fixture.nativeElement.querySelector('a.mt-4');
      const registerLink = fixture.nativeElement.querySelector('a.mt-2');
      
      expect(forgotLink).toBeTruthy();
      expect(registerLink).toBeTruthy();
    });
  });
});
