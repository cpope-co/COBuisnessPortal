import { Component, inject, signal } from '@angular/core';
import { Register, RegistrationTypes } from '../../models/register.model';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
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

@Component({
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
    NgxMaskPipe
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
  router = inject(Router);
  fb = inject(FormBuilder);

  fillin: Register = {
    usemail: 'popecj29@gmail.com',
    verifyEmail: 'popecj29@gmail.com',
    usfname: 'Charlie',
    uslname: 'Pope',
    usabnum: 12564645,
    wcatmgr: 99928,
    wacctname: 'Test',
    wphone: '1234567890',
    wregtype: RegistrationTypes.s,
    wrecaptchatoken: ''
  };

  #wcatmgrs = signal<WCatMgr[]>([]);
  wcatmgrs = this.#wcatmgrs.asReadonly();



  form = this.fb.group({
    usemail: [''],
    verifyEmail: [''],
    usfname: [''],
    uslname: [''],
    usabnum: [''],
    wcatmgr: [],
    wacctname: [''],
    wphone: [''],
    wregtype: [''],
    wrecaptchatoken: ['']
  });


  constructor() {
    this.loadCategoryManagers();
    this.form.patchValue(JSON.parse(JSON.stringify(this.fillin)));
  }


  onRegister() {
    try {
      this.getRecaptchaToken().then((token) => {
        this.form.patchValue({ wrecaptchatoken: token });
        this.registerService.registerAccount(this.form.value as Register);
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
