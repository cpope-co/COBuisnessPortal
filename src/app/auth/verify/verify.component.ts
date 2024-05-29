import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MessagesService } from '../../messages/messages.service';

@Component({
  selector: 'verify',
  standalone: true,
  imports: [MatCardModule],
  templateUrl: './verify.component.html',
  styleUrl: './verify.component.scss'
})
export class VerifyComponent {
  route = inject(ActivatedRoute);
  authService = inject(AuthService);
  messageService = inject(MessagesService);
  
  #isVerifying = signal<boolean>(true);
  isVerifying = this.#isVerifying.asReadonly();

  #isVerified = signal<boolean>(false);
  isVerified = this.#isVerified.asReadonly();

  #tokenSignal = signal<string>('');
  token = this.#tokenSignal.asReadonly();

  constructor() {
    this.#tokenSignal.set(this.route.snapshot.params['token']);
    this.onVerify();

  }

  async onVerify() {
    console.log('Verifying token...');
    try {
      await this.authService.verify(this.token());
      console.log('Token verified.');

    }
    catch (error: any) {
      this.#isVerifying.set(false);
      this.messageService.showMessage('Error verifying token.', 'danger', error.messages);
    }
  }
}
