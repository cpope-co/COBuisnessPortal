import { CUSTOM_ELEMENTS_SCHEMA, Component, effect, inject, signal } from '@angular/core';
import { Register, RegistrationTypes, register } from './register.model';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { WCatMgrService } from '../../services/wcatmgr.service';
import { WCatMgr } from '../../models/wcatmgr.model';
import { TitleCasePipe } from '@angular/common';
import { RegisterService } from './register.service';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import { RECAPTCHA_V3_SITE_KEY, ReCaptchaV3Service, RecaptchaLoaderService, RecaptchaModule } from 'ng-recaptcha';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { MessagesService } from '../../messages/messages.service';
import { InputComponent } from '../../shared/input/input.component';
import { SelectComponent } from '../../shared/select/select.component';
import { RadioComponent } from '../../shared/radio/radio.component';
import { FormHandlingService } from '../../services/form-handling.service';
import { matchEmailsValidator } from '../../validators/verifyemail.validator';

@Component({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'register',
  standalone: true,
  imports: [
    RecaptchaModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatRadioModule,
    MatButtonModule,
    MatSelectModule,
    TitleCasePipe,
    NgxMaskDirective,
    NgxMaskPipe,
    InputComponent,
    SelectComponent,
    RadioComponent
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
    const verifyMatchedEmails = matchEmailsValidator(this.nestedFormGroup);
    this.nestedFormGroup.addValidators(verifyMatchedEmails);
    this.nestedFormGroup.updateValueAndValidity(); // Update validity status after adding the validator
  }




  onRegister() {
    try {
      if(this.form.get('wregtype')?.value === RegistrationTypes.r){
        this.form.removeControl('wcatmgr');
      } else if(this.form.get('wregtype')?.value === RegistrationTypes.s) {
        this.form.removeControl('usabnum')
      }
      this.getRecaptchaToken().then((token) => {
        this.form.patchValue({ wrecaptchatoken: token });
        this.registerService.registerAccount(this.form.value);
      }).catch((error) => {
        this.messageService.showMessage('Error', error.messages.join('\n'));
      });
    }

    catch (error) {
      console.error(error);
    }

  }

  onCancel() {

    this.router.navigate(['/auth/login']);
  }

  getRecaptchaToken(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.recaptchaV3Service.execute('register').subscribe(
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
      console.log(wcatmgrs);
      this.#wcatmgrs.set(wcatmgrs);
    } catch (error) {
      console.error(error);
    }
  }
}
