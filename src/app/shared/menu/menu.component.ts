import { Component, inject, input, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { RouterLink } from '@angular/router';
import { MenuItem } from './menu.model';
import { MenuService } from './menu.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'co-menu',
  standalone: true,
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

  #menuItemsSignal = signal<MenuItem[]>([]);
  menuItems = this.#menuItemsSignal.asReadonly();


  constructor() {
    this.authService.logoutEvent.subscribe(() => {
      this.menuService.clearMenuItems();
    });
    this.authService.loginEvent.subscribe(() => {
      const menuItems = this.menuService.loadMenuItems();
      this.#menuItemsSignal.set(menuItems);
    });
  }


}
