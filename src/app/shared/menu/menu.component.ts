import { Component, inject, input, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { NavigationStart, Router, RouterLink } from '@angular/router';
import { MenuItem } from './menu.model';
import { MenuService } from './menu.service';
import { AuthService } from '../../auth/auth.service';

@Component({
    selector: 'co-menu',
    imports: [
        JsonPipe,
        MatListModule,
        RouterLink
    ],
    templateUrl: './menu.component.html',
    styleUrl: './menu.component.scss'
})
export class MenuComponent {
  menuService = inject(MenuService);
  authService = inject(AuthService);
  router = inject(Router);

  #menuItemsSignal = signal<MenuItem[]>([]);
  menuItems = this.#menuItemsSignal.asReadonly();


  constructor() {
    this.authService.logoutEvent.subscribe(() => {
      this.menuService.clearMenuItems();
      this.#menuItemsSignal.set([]);
    });
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.menuService.clearMenuItems();
        const menuItems = this.menuService.buildMenu();
        this.menuService.setMenuItems(menuItems);
        this.#menuItemsSignal.set(this.menuService.getMenuItems());
      }
    });
  }

  
}
