import { Component, effect, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule, MatSidenavContainer } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../services/auth.service';
import { SessionService } from '../services/session.service';
import { MessagesComponent } from './messages/messages.component';
import { MessagesService } from './messages/messages.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    MatSidenavContainer,
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MessagesComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  authService = inject(AuthService);
  sessionService = inject(SessionService);
  messageService = inject(MessagesService);
  isLoggedIn = this.authService.isLoggedIn;

  constructor() {

  }
  onLogout() {
    this.authService.logout();

  }

}
