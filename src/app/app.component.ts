import { Component, OnInit, effect, inject, signal } from '@angular/core';
import { NavigationStart, Router, RouterLink, RouterOutlet } from '@angular/router';
import { MatSidenavModule, MatSidenavContainer } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from './auth/auth.service';
import { MessagesService } from './messages/messages.service';
import { MessagesComponent } from './messages/messages.component';
import { MatListModule } from '@angular/material/list';
import { LoadingIndicatorComponent } from './loading/loading.component';
import { MatMenuModule } from '@angular/material/menu';
import { MenuComponent } from './shared/menu/menu.component';
import { MenuService } from './shared/menu/menu.service';
import { MenuItem } from './shared/menu/menu.model';
import { SessionService } from './services/session.service';
@Component({
    selector: 'app-root',
    imports: [
        RouterOutlet,
        RouterLink,
        LoadingIndicatorComponent,
        MatSidenavContainer,
        MatSidenavModule,
        MatToolbarModule,
        MatButtonModule,
        MatIconModule,
        MatListModule,
        MatMenuModule,
        MessagesComponent,
        MenuComponent
    ],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {
  authService = inject(AuthService);
  messageService = inject(MessagesService);
  menuService = inject(MenuService);
  sessionService = inject(SessionService);
  router = inject(Router);

  isLoggedIn = this.authService.isLoggedIn;
  
  constructor() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.messageService.clear();
      }
    });
    if(this.isLoggedIn()) {
      this.sessionService.stopSessionCheck();
      this.sessionService.startSessionCheck();
    };
  }

  onLogout() {
    this.sessionService.stopSessionCheck();
    this.authService.logout();
  }

}
