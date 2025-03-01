import { CUSTOM_ELEMENTS_SCHEMA, Component, effect, inject, signal } from '@angular/core';
import { Register, RegistrationTypes, register } from './register.model';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatRadioModule } from '@angular/material/radio';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { WCatMgrService } from '../../services/wcatmgr.service';
import { WCatMgr } from '../../models/wcatmgr.model';
import { TitleCasePipe } from '@angular/common';
import { RegisterService } from './register.service';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import { RECAPTCHA_V3_SITE_KEY, ReCaptchaV3Service, RecaptchaLoaderService, RecaptchaV3Module } from 'ng-recaptcha-2';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { MessagesService } from '../../messages/messages.service';
import { InputComponent } from '../../shared/input/input.component';
import { SelectComponent } from '../../shared/select/select.component';
import { RadioComponent } from '../../shared/radio/radio.component';
import { FormHandlingService } from '../../services/form-handling.service';
import { ApiResponseError } from '../../shared/api-response-error';
import { matchControlsValidator } from '../../validators/verifypassword.validator';

@Component({
    selector: 'register',
    imports: [
        MatCardModule,
        MatButtonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        InputComponent,
        SelectComponent,
        RadioComponent,
        RecaptchaV3Module,
    ],
    providers: [
        ReCaptchaV3Service,
        RecaptchaLoaderService,
        { provide: RECAPTCHA_V3_SITE_KEY, useValue: environment.recaptchaSiteKey }
    ],
    templateUrl: './register.component.html',
    styleUrl: './register.component.scss'
})
export class RegisterComponent {

  wcatmgrService = inject(WCatMgrService);
  registerService = inject(RegisterService);
  recaptchaV3Service = inject(ReCaptchaV3Service);
  messageService = inject(MessagesService);
  formHandlerService = inject(FormHandlingService);

  router = inject(Router);
  fb = inject(FormBuilder);

  RegistrationTypes = RegistrationTypes;

  form!: FormGroup;
  nestedFormGroup!: FormGroup;
  register = register;

  #wcatmgrs = signal<WCatMgr[]>([]);
  wcatmgrs = this.#wcatmgrs.asReadonly();
  phoneMask = '(000) 000-0000';

  wregtype = Object.values(RegistrationTypes).map((type) => ({
    id: type,
    name: type,
  }));



  constructor() {
    this.loadCategoryManagers();
    this.form = this.formHandlerService.createFormGroup(this.register);
    this.nestedFormGroup = this.formHandlerService.getNestedFormGroup(this.form, 'matchEmails');
    const verifyMatchedEmails = matchControlsValidator('usemail', 'verifyEmail');
    this.nestedFormGroup.addValidators(verifyMatchedEmails);
    this.nestedFormGroup.updateValueAndValidity(); // Update validity status after adding the validator
  }




  async onRegister() {
    if (this.form.get('wregtype')?.value === RegistrationTypes.r) {
      this.form.removeControl('wcatmgr');
    } else if (this.form.get('wregtype')?.value === RegistrationTypes.s) {
      this.form.removeControl('usabnum')
    }
    if (this.form.valid) {
      try {
        const token = await this.getRecaptchaToken();
        this.form.patchValue({ wrecaptchatoken: token });
        await this.registerService.registerAccount(this.form.value);
        this.messageService.showMessage('Registration successful. Please check your email for further instructions.', 'success'); 
        this.form.reset();
      } catch (error: unknown) {
        if (error instanceof ApiResponseError) {
          this.formHandlerService.handleFormErrors(error.validationErrors, this.form)
        }
      }
    } else {
      this.form.markAllAsTouched();
      this.messageService.showMessage('Please correct the errors on the form.', 'danger');
    }
  }

  onCancel() {

    this.router.navigate(['/auth/login']);
  }

  getRecaptchaToken(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.recaptchaV3Service.execute('SubmitRegisterForm').subscribe(
        (token) => {
          resolve(token);
        },
        (error) => {
          console.error(error);
          reject('');
        }
      );
    });
  }

  async loadCategoryManagers() {
    try {
      const wcatmgrs = await this.wcatmgrService.loadAllWCatMgrs();
      this.#wcatmgrs.set(wcatmgrs);
    } catch (error) {
      console.error(error);
    }
  }
}
