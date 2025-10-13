import { Component, inject, input, signal, OnDestroy, HostListener, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { NavigationStart, Router, RouterLink, RouterModule } from '@angular/router';
import { MenuItem } from './menu.model';
import { MenuService } from './menu.service';
import { AuthService } from '../../auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'co-menu',
    standalone: true,
    imports: [
        CommonModule,
        MatListModule,
        RouterLink,
        RouterModule
    ],
    templateUrl: './menu.component.html',
    styleUrl: './menu.component.scss'
})
export class MenuComponent implements OnInit, OnDestroy {
  menuService = inject(MenuService);
  authService = inject(AuthService);
  router = inject(Router);
  private elementRef = inject(ElementRef);

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

  ngOnInit(): void {
    // Set up initial focus management
    this.setupInitialFocus();
    
    // Initialize menu items with tab indices
    const initialMenuItems = this.menuService.getMenuItems();
    if (initialMenuItems.length > 0) {
      this.#menuItemsSignal.set(initialMenuItems);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onKeyDown(event: KeyboardEvent) {
    const target = event.target as Element;
    
    // Only handle keydown if it's from one of our menu items
    if (!target.matches('a[mat-list-item][role="menuitem"]')) {
      return;
    }
    
    const focusableElements = this.elementRef.nativeElement.querySelectorAll('a[mat-list-item][role="menuitem"]');
    const currentIndex = Array.from(focusableElements).indexOf(target);

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault();
        this.focusNextItem(focusableElements, currentIndex);
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault();
        this.focusPreviousItem(focusableElements, currentIndex);
        break;
      case 'Home':
        event.preventDefault();
        this.focusFirstItem(focusableElements);
        break;
      case 'End':
        event.preventDefault();
        this.focusLastItem(focusableElements);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        (event.target as HTMLElement)?.click();
        break;
      case 'Escape':
        event.preventDefault();
        this.removeFocus();
        break;
    }
  }

  isCurrentRoute(route: string): boolean {
    if (!route) return false;
    
    const currentUrl = this.router.url;
    const currentPath = currentUrl.split('?')[0].split('#')[0]; // Remove query params and fragments
    
    // Normalize paths - router.url always starts with '/', route from menu might not
    const normalizedCurrentPath = currentPath;
    const normalizedRoute = route.startsWith('/') ? route : '/' + route;
    
    // Exact match
    if (normalizedCurrentPath === normalizedRoute) return true;
    
    // Check if current path starts with route (for child routes)
    if (normalizedRoute !== '/' && normalizedCurrentPath.startsWith(normalizedRoute + '/')) return true;
    
    return false;
  }

  private setupInitialFocus(): void {
    // Ensure first menu item is focusable for screen readers
    setTimeout(() => {
      const firstMenuItem = this.elementRef.nativeElement.querySelector('a[mat-list-item][role="menuitem"]');
      if (firstMenuItem) {
        firstMenuItem.tabIndex = 0;
      }
    });
  }

  private focusNextItem(elements: NodeListOf<Element>, currentIndex: number): void {
    if (elements.length === 0) return;
    const nextIndex = currentIndex < elements.length - 1 ? currentIndex + 1 : 0;
    this.setFocus(elements, nextIndex);
  }

  private focusPreviousItem(elements: NodeListOf<Element>, currentIndex: number): void {
    if (elements.length === 0) return;
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : elements.length - 1;
    this.setFocus(elements, prevIndex);
  }

  private focusFirstItem(elements: NodeListOf<Element>): void {
    if (elements.length > 0) {
      this.setFocus(elements, 0);
    }
  }

  private focusLastItem(elements: NodeListOf<Element>): void {
    if (elements.length > 0) {
      this.setFocus(elements, elements.length - 1);
    }
  }

  private setFocus(elements: NodeListOf<Element>, index: number): void {
    // Remove tabindex from all elements
    elements.forEach(el => (el as HTMLElement).tabIndex = -1);
    
    // Set focus and tabindex on target element
    const targetElement = elements[index] as HTMLElement;
    targetElement.tabIndex = 0;
    targetElement.focus();
  }

  private removeFocus(): void {
    const focusedElement = document.activeElement as HTMLElement;
    if (focusedElement) {
      focusedElement.blur();
    }
  }
}
