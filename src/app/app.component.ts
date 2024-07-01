import { Component, OnInit, effect, inject } from '@angular/core';
import { NavigationStart, Router, RouterLink, RouterOutlet } from '@angular/router';
import { MatSidenavModule, MatSidenavContainer } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from './services/auth.service';
import { MessagesComponent } from './messages/messages.component';
import { MessagesService } from './messages/messages.service';
import { MatListModule } from '@angular/material/list';
import { LoadingIndicatorComponent } from './loading/loading.component';
import { MatMenuModule } from '@angular/material/menu';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    LoadingIndicatorComponent,
    MessagesComponent,
    MatSidenavContainer,
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  authService = inject(AuthService);
  messageService = inject(MessagesService);
  router = inject(Router);

  isLoggedIn = this.authService.isLoggedIn;

  constructor() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.messageService.clear();
      }
    });
  }

  onLogout() {
    this.authService.logout();
  }

}
