import { Component, inject, input, signal, OnDestroy } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { NavigationStart, Router, RouterLink } from '@angular/router';
import { MenuItem } from './menu.model';
import { MenuService } from './menu.service';
import { AuthService } from '../../auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'co-menu',
    imports: [
        MatListModule,
        RouterLink
    ],
    templateUrl: './menu.component.html',
    styleUrl: './menu.component.scss'
})
export class MenuComponent implements OnDestroy {
  menuService = inject(MenuService);
  authService = inject(AuthService);
  router = inject(Router);

  #menuItemsSignal = signal<MenuItem[]>([]);
  menuItems = this.#menuItemsSignal.asReadonly();

  private subscriptions = new Subscription();

  constructor() {
    this.subscriptions.add(
      this.authService.logoutEvent.subscribe(() => {
        this.menuService.clearMenuItems();
        this.#menuItemsSignal.set([]);
      })
    );
    
    this.subscriptions.add(
      this.router.events.subscribe(event => {
        if (event instanceof NavigationStart) {
          this.menuService.clearMenuItems();
          const menuItems = this.menuService.buildMenu();
          this.menuService.setMenuItems(menuItems);
          this.#menuItemsSignal.set(this.menuService.getMenuItems());
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
