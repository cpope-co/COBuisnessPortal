import { Component, OnInit, effect, inject, signal } from '@angular/core';
import { NavigationStart, Router, RouterLink, RouterOutlet } from '@angular/router';
import { MatSidenavModule, MatSidenavContainer } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from './services/auth.service';
import { MessagesService } from './messages/messages.service';
import { MessagesComponent } from './messages/messages.component';
import { MatListModule } from '@angular/material/list';
import { LoadingIndicatorComponent } from './loading/loading.component';
import { MatMenuModule } from '@angular/material/menu';
import { MenuComponent } from './shared/menu/menu.component';
import { MenuService } from './shared/menu/menu.service';
import { MenuItem } from './shared/menu/menu.model';
@Component({
  selector: 'app-root',
  standalone: true,
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
  router = inject(Router);

  isLoggedIn = this.authService.isLoggedIn;
  
  #menuItemsSignal = signal<MenuItem[]>([]);
  menuItems = this.#menuItemsSignal.asReadonly();
  
  loadMenuItems() {
    const menuItems = this.menuService.loadMenuItems();

    this.#menuItemsSignal.set(menuItems);
  }

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
