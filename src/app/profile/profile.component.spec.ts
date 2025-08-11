import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { FormGroup, FormControl } from '@angular/forms';

import { ProfileComponent } from './profile.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { FormHandlingService } from '../services/form-handling.service';
import { UserAccountService } from '../services/user-accounts.service';
import { AuthService } from '../auth/auth.service';
import { MessagesService } from '../messages/messages.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { User } from '../models/user.model';
import { UserAccount } from '../models/user-accounts.model';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let formHandlingService: jasmine.SpyObj<FormHandlingService>;
  let userAccountService: jasmine.SpyObj<UserAccountService>;
  let authService: jasmine.SpyObj<AuthService>;
  let messagesService: jasmine.SpyObj<MessagesService>;
  let router: jasmine.SpyObj<Router>;
  let dialog: jasmine.SpyObj<MatDialog>;

  const mockUser: User = {
    sub: 1,
    name: 'Test User',
    role: 1,
    exp: 1234567890,
    iat: 1234567890,
    refexp: 1234567890,
    fpc: false
  };

  const mockUserAccount: UserAccount = {
    usunbr: 1,
    usemail: 'john.doe@example.com',
    usfname: 'John',
    uslname: 'Doe',
    usstat: 'active',
    usfpc: false,
    usnfla: 0,
    usibmi: false,
    usroleid: 1,
    usidle: 30,
    usabnum: 123,
    usplcts: new Date(),
    uslflats: new Date(),
    usllts: new Date(),
    uscrts: new Date()
  };

  beforeEach(async () => {
    const formHandlingSpy = jasmine.createSpyObj('FormHandlingService', ['createFormGroup']);
    const userAccountSpy = jasmine.createSpyObj('UserAccountService', ['loadUserAccountById', 'saveUserAccount']);
    const authSpy = jasmine.createSpyObj('AuthService', ['user']);
    const messagesSpy = jasmine.createSpyObj('MessagesService', ['showMessage']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        ProfileComponent,
        HttpClientTestingModule,
        BrowserAnimationsModule,
        NgxMaskDirective
      ],
      providers: [
        provideNgxMask(),
        { provide: FormHandlingService, useValue: formHandlingSpy },
        { provide: UserAccountService, useValue: userAccountSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: MessagesService, useValue: messagesSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MatDialog, useValue: dialogSpy }
      ]
    })
      .compileComponents();

    formHandlingService = TestBed.inject(FormHandlingService) as jasmine.SpyObj<FormHandlingService>;
    userAccountService = TestBed.inject(UserAccountService) as jasmine.SpyObj<UserAccountService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    messagesService = TestBed.inject(MessagesService) as jasmine.SpyObj<MessagesService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    dialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
  });

  describe('with no user', () => {
    beforeEach(() => {
      authService.user.and.returnValue(null);
      const mockForm = new FormGroup({
        usemail: new FormControl(''),
        usfname: new FormControl(''),
        uslname: new FormControl('')
      });
      formHandlingService.createFormGroup.and.returnValue(mockForm);
      
      fixture = TestBed.createComponent(ProfileComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should handle undefined userId in onLoadProfile', async () => {
      spyOn(console, 'error');
      
      await component.onLoadProfile();
      
      expect(console.error).toHaveBeenCalledWith('User ID is undefined');
      expect(userAccountService.loadUserAccountById).not.toHaveBeenCalled();
    });
  });

  describe('with valid user', () => {
    beforeEach(() => {
      authService.user.and.returnValue(mockUser);
      const mockForm = new FormGroup({
        usemail: new FormControl(''),
        usfname: new FormControl(''),
        uslname: new FormControl('')
      });
      formHandlingService.createFormGroup.and.returnValue(mockForm);
      userAccountService.loadUserAccountById.and.returnValue(Promise.resolve(mockUserAccount));
      
      fixture = TestBed.createComponent(ProfileComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create with valid user', () => {
      expect(component).toBeTruthy();
      expect(component.user()).toEqual(mockUser);
    });

    it('should load profile successfully when userId is a number', async () => {
      spyOn(component.form, 'patchValue');
      spyOn(component.form, 'markAsPristine');
      spyOn(component.form, 'markAsUntouched');
      
      await component.onLoadProfile();
      
      expect(userAccountService.loadUserAccountById).toHaveBeenCalledWith(1);
      expect(component.form.patchValue).toHaveBeenCalledWith(mockUserAccount);
      expect(component.form.markAsPristine).toHaveBeenCalled();
      expect(component.form.markAsUntouched).toHaveBeenCalled();
    });

    it('should handle error in onLoadProfile', async () => {
      userAccountService.loadUserAccountById.and.returnValue(Promise.reject('Load error'));
      
      // Should not throw
      await component.onLoadProfile();
      
      expect(userAccountService.loadUserAccountById).toHaveBeenCalledWith(1);
    });

    describe('onSaveProfile', () => {
      it('should show error message when form is invalid', async () => {
        Object.defineProperty(component.form, 'invalid', { value: true, configurable: true });
        spyOn(component.form, 'markAllAsTouched');
        
        await component.onSaveProfile();
        
        expect(component.form.markAllAsTouched).toHaveBeenCalled();
        expect(messagesService.showMessage).toHaveBeenCalledWith('Please correct the errors on the form.', 'danger');
        expect(userAccountService.saveUserAccount).not.toHaveBeenCalled();
      });

      it('should save profile successfully when form is valid', async () => {
        Object.defineProperty(component.form, 'invalid', { value: false, configurable: true });
        Object.defineProperty(component.form, 'value', { value: mockUserAccount, configurable: true });
        userAccountService.saveUserAccount.and.returnValue(Promise.resolve(mockUserAccount));
        
        await component.onSaveProfile();
        
        expect(userAccountService.saveUserAccount).toHaveBeenCalledWith(mockUserAccount, 1);
        expect(messagesService.showMessage).toHaveBeenCalledWith('Profile saved!', 'success');
      });

      it('should handle error during save', async () => {
        Object.defineProperty(component.form, 'invalid', { value: false, configurable: true });
        Object.defineProperty(component.form, 'value', { value: mockUserAccount, configurable: true });
        userAccountService.saveUserAccount.and.returnValue(Promise.reject('Save error'));
        
        // Should not throw
        await component.onSaveProfile();
        
        expect(userAccountService.saveUserAccount).toHaveBeenCalledWith(mockUserAccount, 1);
      });
    });

    describe('onCancel', () => {
      let mockEvent: MouseEvent;

      beforeEach(() => {
        mockEvent = new MouseEvent('click');
        spyOn(mockEvent, 'stopPropagation');
      });

      it('should open lose changes dialog when form is touched', () => {
        Object.defineProperty(component.form, 'touched', { value: true, configurable: true });
        Object.defineProperty(component.form, 'dirty', { value: false, configurable: true });
        spyOn(component.form, 'markAllAsTouched');
        
        component.onCancel(mockEvent);
        
        expect(mockEvent.stopPropagation).toHaveBeenCalled();
        expect(dialog.open).toHaveBeenCalled();
        expect(component.form.markAllAsTouched).toHaveBeenCalled();
        expect(router.navigate).not.toHaveBeenCalled();
      });

      it('should open lose changes dialog when form is dirty', () => {
        Object.defineProperty(component.form, 'touched', { value: false, configurable: true });
        Object.defineProperty(component.form, 'dirty', { value: true, configurable: true });
        spyOn(component.form, 'markAllAsTouched');
        
        component.onCancel(mockEvent);
        
        expect(mockEvent.stopPropagation).toHaveBeenCalled();
        expect(dialog.open).toHaveBeenCalled();
        expect(component.form.markAllAsTouched).toHaveBeenCalled();
        expect(router.navigate).not.toHaveBeenCalled();
      });

      it('should open lose changes dialog when form is both touched and dirty', () => {
        Object.defineProperty(component.form, 'touched', { value: true, configurable: true });
        Object.defineProperty(component.form, 'dirty', { value: true, configurable: true });
        spyOn(component.form, 'markAllAsTouched');
        
        component.onCancel(mockEvent);
        
        expect(mockEvent.stopPropagation).toHaveBeenCalled();
        expect(dialog.open).toHaveBeenCalled();
        expect(component.form.markAllAsTouched).toHaveBeenCalled();
        expect(router.navigate).not.toHaveBeenCalled();
      });

      it('should navigate to home when form is clean', () => {
        Object.defineProperty(component.form, 'touched', { value: false, configurable: true });
        Object.defineProperty(component.form, 'dirty', { value: false, configurable: true });
        
        component.onCancel(mockEvent);
        
        expect(mockEvent.stopPropagation).toHaveBeenCalled();
        expect(dialog.open).not.toHaveBeenCalled();
        expect(router.navigate).toHaveBeenCalledWith(['/home']);
      });
    });
  });
});
