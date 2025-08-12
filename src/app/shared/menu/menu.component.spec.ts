import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavigationStart, Router } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';

import { MenuComponent } from './menu.component';
import { MenuService } from './menu.service';
import { AuthService } from '../../auth/auth.service';
import { MenuItem, MenuItemOptions } from './menu.model';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatListModule } from '@angular/material/list';
import { RouterTestingModule } from '@angular/router/testing';

describe('MenuComponent', () => {
  let component: MenuComponent;
  let fixture: ComponentFixture<MenuComponent>;
  let mockMenuService: jasmine.SpyObj<MenuService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockLogoutEvent: Subject<void>;
  let mockRouterEvents: Subject<any>;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    role: 2,
    firstName: 'Test',
    lastName: 'User'
  };

  const createMockMenuItem = (title: string, route: string, options?: MenuItemOptions, children?: MenuItem[]): MenuItem => ({
    title,
    route,
    options,
    children
  });

  const mockMenuItems: MenuItem[] = [
    createMockMenuItem('Dashboard', '/dashboard', { display: true, role: 1 }),
    createMockMenuItem('Profile', '/profile', { display: true, role: 2 })
  ];

  beforeEach(async () => {
    mockLogoutEvent = new Subject<void>();
    mockRouterEvents = new Subject<any>();
    
    mockMenuService = jasmine.createSpyObj('MenuService', [
      'clearMenuItems',
      'buildMenu',
      'setMenuItems',
      'getMenuItems'
    ]);
    
    mockAuthService = jasmine.createSpyObj('AuthService', [], {
      logoutEvent: mockLogoutEvent.asObservable(),
      user: jasmine.createSpy('user').and.returnValue(mockUser)
    });
    
    mockRouter = jasmine.createSpyObj('Router', ['navigate'], {
      events: mockRouterEvents.asObservable()
    });

    // Set up default mock return values
    mockMenuService.buildMenu.and.returnValue(mockMenuItems);
    mockMenuService.getMenuItems.and.returnValue(mockMenuItems);

    await TestBed.configureTestingModule({
      imports: [MenuComponent, HttpClientTestingModule, MatListModule, RouterTestingModule],
      providers: [
        { provide: MenuService, useValue: mockMenuService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MenuComponent);
    component = fixture.componentInstance;
  });

  describe('Component initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should inject required services', () => {
      expect(component.menuService).toBe(mockMenuService);
      expect(component.authService).toBe(mockAuthService);
      expect(component.router).toBe(mockRouter);
    });

    it('should initialize menuItems signal as readonly', () => {
      expect(component.menuItems).toBeDefined();
      expect(component.menuItems()).toEqual([]);
    });

    it('should set up logout event subscription in constructor', () => {
      fixture.detectChanges();
      
      // Trigger logout event
      mockLogoutEvent.next();
      
      expect(mockMenuService.clearMenuItems).toHaveBeenCalled();
      expect(component.menuItems()).toEqual([]);
    });

    it('should set up router events subscription in constructor', () => {
      fixture.detectChanges();
      
      // Trigger navigation start event
      const navigationEvent = new NavigationStart(1, '/test-route');
      mockRouterEvents.next(navigationEvent);
      
      expect(mockMenuService.clearMenuItems).toHaveBeenCalled();
      expect(mockMenuService.buildMenu).toHaveBeenCalled();
      expect(mockMenuService.setMenuItems).toHaveBeenCalledWith(mockMenuItems);
      expect(component.menuItems()).toEqual(mockMenuItems);
    });
  });

  describe('Event handling', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should handle logout event correctly', () => {
      // Set initial menu items
      mockMenuService.getMenuItems.and.returnValue(mockMenuItems.slice(0, 1));
      const navigationEvent = new NavigationStart(1, '/dashboard');
      mockRouterEvents.next(navigationEvent);
      
      expect(component.menuItems().length).toBeGreaterThan(0);
      
      // Trigger logout
      mockLogoutEvent.next();
      
      expect(mockMenuService.clearMenuItems).toHaveBeenCalled();
      expect(component.menuItems()).toEqual([]);
    });

    it('should handle multiple logout events', () => {
      // First logout
      mockLogoutEvent.next();
      expect(mockMenuService.clearMenuItems).toHaveBeenCalledTimes(1);
      
      // Second logout
      mockLogoutEvent.next();
      expect(mockMenuService.clearMenuItems).toHaveBeenCalledTimes(2);
    });

    it('should handle NavigationStart events', () => {
      const navigationEvent = new NavigationStart(1, '/profile');
      
      mockRouterEvents.next(navigationEvent);
      
      expect(mockMenuService.clearMenuItems).toHaveBeenCalled();
      expect(mockMenuService.buildMenu).toHaveBeenCalled();
      expect(mockMenuService.setMenuItems).toHaveBeenCalledWith(mockMenuItems);
      expect(component.menuItems()).toEqual(mockMenuItems);
    });

    it('should ignore non-NavigationStart router events', () => {
      const otherEvent = { type: 'NavigationEnd' };
      
      mockMenuService.clearMenuItems.calls.reset();
      mockMenuService.buildMenu.calls.reset();
      
      mockRouterEvents.next(otherEvent);
      
      expect(mockMenuService.clearMenuItems).not.toHaveBeenCalled();
      expect(mockMenuService.buildMenu).not.toHaveBeenCalled();
    });

    it('should handle multiple NavigationStart events', () => {
      const firstNav = new NavigationStart(1, '/dashboard');
      const secondNav = new NavigationStart(2, '/profile');
      
      mockRouterEvents.next(firstNav);
      expect(mockMenuService.buildMenu).toHaveBeenCalledTimes(1);
      
      mockRouterEvents.next(secondNav);
      expect(mockMenuService.buildMenu).toHaveBeenCalledTimes(2);
    });
  });

  describe('Service integration', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should call MenuService methods in correct order during navigation', () => {
      const navigationEvent = new NavigationStart(1, '/test');
      
      mockRouterEvents.next(navigationEvent);
      
      expect(mockMenuService.clearMenuItems).toHaveBeenCalledBefore(mockMenuService.buildMenu as jasmine.Spy);
      expect(mockMenuService.buildMenu).toHaveBeenCalledBefore(mockMenuService.setMenuItems as jasmine.Spy);
      expect(mockMenuService.setMenuItems).toHaveBeenCalledBefore(mockMenuService.getMenuItems as jasmine.Spy);
    });

    it('should handle empty menu from service', () => {
      mockMenuService.buildMenu.and.returnValue([]);
      mockMenuService.getMenuItems.and.returnValue([]);
      
      const navigationEvent = new NavigationStart(1, '/empty');
      mockRouterEvents.next(navigationEvent);
      
      expect(component.menuItems()).toEqual([]);
    });

    it('should update signal when menu items change', () => {
      const initialItems = [createMockMenuItem('Initial', '/initial', { display: true, role: 1 })];
      const updatedItems = [createMockMenuItem('Updated', '/updated', { display: true, role: 1 })];
      
      // First navigation
      mockMenuService.buildMenu.and.returnValue(initialItems);
      mockMenuService.getMenuItems.and.returnValue(initialItems);
      
      const firstNav = new NavigationStart(1, '/initial');
      mockRouterEvents.next(firstNav);
      
      expect(component.menuItems()).toEqual(initialItems);
      
      // Second navigation with different menu
      mockMenuService.buildMenu.and.returnValue(updatedItems);
      mockMenuService.getMenuItems.and.returnValue(updatedItems);
      
      const secondNav = new NavigationStart(2, '/updated');
      mockRouterEvents.next(secondNav);
      
      expect(component.menuItems()).toEqual(updatedItems);
    });
  });

  describe('Error handling', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should handle service method calls gracefully', () => {
      const navigationEvent = new NavigationStart(1, '/test');
      
      expect(() => {
        mockRouterEvents.next(navigationEvent);
      }).not.toThrow();
      
      // Component should still be functional
      expect(component).toBeTruthy();
    });

    it('should handle malformed menu items', () => {
      const malformedItems = [
        { title: '', route: '', options: undefined } as MenuItem,
        { title: 'Valid', route: '/valid', options: { display: true, role: 1 } } as MenuItem
      ];
      
      mockMenuService.buildMenu.and.returnValue(malformedItems);
      mockMenuService.getMenuItems.and.returnValue(malformedItems);
      
      const navigationEvent = new NavigationStart(1, '/test');
      mockRouterEvents.next(navigationEvent);
      
      expect(component.menuItems()).toEqual(malformedItems);
    });
  });

  describe('Menu signal functionality', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should maintain signal state across multiple operations', () => {
      const firstItems = [createMockMenuItem('First', '/first', { display: true, role: 1 })];
      const secondItems = [createMockMenuItem('Second', '/second', { display: true, role: 2 })];
      
      // First navigation
      mockMenuService.buildMenu.and.returnValue(firstItems);
      mockMenuService.getMenuItems.and.returnValue(firstItems);
      
      const firstNav = new NavigationStart(1, '/first');
      mockRouterEvents.next(firstNav);
      
      expect(component.menuItems()).toEqual(firstItems);
      
      // Second navigation
      mockMenuService.buildMenu.and.returnValue(secondItems);
      mockMenuService.getMenuItems.and.returnValue(secondItems);
      
      const secondNav = new NavigationStart(2, '/second');
      mockRouterEvents.next(secondNav);
      
      expect(component.menuItems()).toEqual(secondItems);
      expect(component.menuItems()).not.toEqual(firstItems);
    });

    it('should handle rapid navigation events', () => {
      let callCount = 0;
      mockMenuService.buildMenu.and.callFake(() => {
        callCount++;
        return [createMockMenuItem(`Item ${callCount}`, `/item${callCount}`, { display: true, role: 1 })];
      });
      
      mockMenuService.getMenuItems.and.callFake(() => {
        return [createMockMenuItem(`Item ${callCount}`, `/item${callCount}`, { display: true, role: 1 })];
      });
      
      // Trigger multiple rapid navigations
      for (let i = 1; i <= 3; i++) {
        const navigationEvent = new NavigationStart(i, `/rapid${i}`);
        mockRouterEvents.next(navigationEvent);
      }
      
      expect(mockMenuService.buildMenu).toHaveBeenCalledTimes(3);
      expect(component.menuItems().length).toBe(1);
      expect(component.menuItems()[0].title).toBe('Item 3');
    });
  });

  describe('Memory management', () => {
    it('should handle component destruction gracefully', () => {
      fixture.detectChanges();
      
      // Component should be created successfully
      expect(component).toBeTruthy();
      
      // Destroy component
      fixture.destroy();
      
      // Events should not cause errors after destruction
      expect(() => {
        mockLogoutEvent.next();
        mockRouterEvents.next(new NavigationStart(1, '/test'));
      }).not.toThrow();
    });

    it('should handle subscription cleanup', () => {
      fixture.detectChanges();
      
      // Verify component is working
      const navigationEvent = new NavigationStart(1, '/test');
      mockRouterEvents.next(navigationEvent);
      expect(mockMenuService.buildMenu).toHaveBeenCalled();
      
      // Reset call count
      mockMenuService.buildMenu.calls.reset();
      
      // Destroy component
      fixture.destroy();
      
      // Verify no more calls after destruction
      mockRouterEvents.next(new NavigationStart(2, '/test2'));
      expect(mockMenuService.buildMenu).not.toHaveBeenCalled();
    });
  });
});
