import { Component, inject } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { InputComponent } from '../../shared/input/input.component';
import { FormHandlingService } from '../../services/form-handling.service';
import { MessagesService } from '../../messages/messages.service';
import { forgot } from './forgot.model';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-forgot',
    imports: [
        MatCardModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatInputModule,
        MatIconModule,
        MatFormFieldModule,
        InputComponent,
        RouterLink
    ],
    templateUrl: './forgot.component.html',
    styleUrl: './forgot.component.scss'
})
export class ForgotComponent {
  formHandlerService = inject(FormHandlingService);
  messageService = inject(MessagesService);

  form!: FormGroup;
  forgot = forgot;

  constructor() {
    this.form = this.formHandlerService.createFormGroup(this.forgot);
  }
  
  onForgotPassword() {
    try {
      // 
    }
    catch (error) {
      console.error('Error resetting password', error);
    }
  }

}
