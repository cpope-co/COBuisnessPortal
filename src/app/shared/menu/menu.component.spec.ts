import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { MenuComponent } from './menu.component';
import { MenuService } from './menu.service';
import { AuthService } from '../../auth/auth.service';
import { MenuItem, MenuItemOptions } from './menu.model';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatListModule } from '@angular/material/list';
import { RouterTestingModule } from '@angular/router/testing';
import { Component, signal } from '@angular/core';

describe('MenuComponent', () => {
  let component: MenuComponent;
  let fixture: ComponentFixture<MenuComponent>;
  let mockMenuService: any;
  let mockAuthService: any;
  let mockRouter: jasmine.SpyObj<Router>;
  let logoutTriggerSignal: any;
  let loginTriggerSignal: any;
  let menuItemsSignal: any;

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

  // Create a dummy component for routing
  @Component({
    template: '<div>Test Route</div>'
  })
  class TestComponent { }

  beforeEach(async () => {
    logoutTriggerSignal = signal<number>(0);
    loginTriggerSignal = signal<number>(0);
    
    // Create a writable signal for menu items
    menuItemsSignal = signal<MenuItem[]>([]);
    
    mockMenuService = jasmine.createSpyObj('MenuService', [
      'clearMenuItems',
      'refreshMenu'
    ]);
    
    // Add the menuItems signal property to the mock
    Object.defineProperty(mockMenuService, 'menuItems', {
      get: () => menuItemsSignal,
      enumerable: true,
      configurable: true
    });
    
    // clearMenuItems should clear the signal
    mockMenuService.clearMenuItems.and.callFake(() => {
      menuItemsSignal.set([]);
    });
    
    mockAuthService = jasmine.createSpyObj('AuthService', [], {
      logoutTrigger: logoutTriggerSignal.asReadonly(),
      loginTrigger: loginTriggerSignal.asReadonly(),
      user: signal(mockUser)
    });

    await TestBed.configureTestingModule({
      imports: [
        MenuComponent, 
        HttpClientTestingModule, 
        MatListModule, 
        RouterTestingModule.withRoutes([
          { path: 'test', component: TestComponent },
          { path: 'dashboard', component: TestComponent },
          { path: 'profile', component: TestComponent }
        ]),
        TestComponent
      ],
      providers: [
        { provide: MenuService, useValue: mockMenuService },
        { provide: AuthService, useValue: mockAuthService }
      ]
    })
    .compileComponents();
    
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    
    fixture = TestBed.createComponent(MenuComponent);
    component = fixture.componentInstance;
  });

  describe('Component initialization', () => {
    it('should create', () => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });

    it('should inject required services', () => {
      fixture.detectChanges();
      expect(component.menuService).toBe(mockMenuService);
      expect(component.authService).toBe(mockAuthService);
      expect(component.router).toBeDefined();
    });

    it('should initialize menuItems signal as readonly from MenuService', () => {
      fixture.detectChanges();
      expect(component.menuItems).toBeDefined();
      expect(component.menuItems()).toEqual([]);
    });

    it('should set up logout event subscription in constructor', () => {
      fixture.detectChanges();
      
      // Set some menu items
      menuItemsSignal.set(mockMenuItems);
      expect(component.menuItems()).toEqual(mockMenuItems);
      
      // Trigger logout by updating the signal
      logoutTriggerSignal.set(1);
      fixture.detectChanges();
      
      expect(mockMenuService.clearMenuItems).toHaveBeenCalled();
      expect(component.menuItems()).toEqual([]);
    });

    it('should call refreshMenu in ngOnInit when user exists and menu is empty', () => {
      fixture.detectChanges();
      
      expect(mockMenuService.refreshMenu).toHaveBeenCalled();
    });

    it('should not call refreshMenu in ngOnInit when menu already has items', () => {
      // Set menu items before initialization
      menuItemsSignal.set(mockMenuItems);
      mockMenuService.refreshMenu.calls.reset();
      
      fixture.detectChanges();
      
      expect(mockMenuService.refreshMenu).not.toHaveBeenCalled();
    });

    it('should not call refreshMenu in ngOnInit when no user', () => {
      // Create a new fixture with no user
      TestBed.resetTestingModule();
      
      const noUserAuthService = jasmine.createSpyObj('AuthService', [], {
        logoutTrigger: signal(0).asReadonly(),
        loginTrigger: signal(0).asReadonly(),
        user: signal(null)
      });
      
      const emptyMenuSignal = signal<MenuItem[]>([]);
      const noUserMenuService = jasmine.createSpyObj('MenuService', ['clearMenuItems', 'refreshMenu']);
      Object.defineProperty(noUserMenuService, 'menuItems', {
        get: () => emptyMenuSignal,
        enumerable: true,
        configurable: true
      });
      noUserMenuService.clearMenuItems.and.callFake(() => {
        emptyMenuSignal.set([]);
      });
      
      TestBed.configureTestingModule({
        imports: [
          MenuComponent, 
          HttpClientTestingModule, 
          MatListModule, 
          RouterTestingModule.withRoutes([]),
          TestComponent
        ],
        providers: [
          { provide: MenuService, useValue: noUserMenuService },
          { provide: AuthService, useValue: noUserAuthService }
        ]
      }).compileComponents();
      
      const noUserFixture = TestBed.createComponent(MenuComponent);
      noUserFixture.detectChanges();
      
      expect(noUserMenuService.refreshMenu).not.toHaveBeenCalled();
    });
  });

  describe('Menu display', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should display menu items from MenuService signal', () => {
      // Initially empty
      expect(component.menuItems()).toEqual([]);
      
      // Update via service
      menuItemsSignal.set(mockMenuItems);
      fixture.detectChanges();
      
      expect(component.menuItems()).toEqual(mockMenuItems);
      expect(component.menuItems().length).toBe(2);
    });

    it('should reactively update when MenuService signal changes', () => {
      const initialItems = [createMockMenuItem('Item 1', '/item1', { display: true, role: 1 })];
      menuItemsSignal.set(initialItems);
      fixture.detectChanges();
      
      expect(component.menuItems()).toEqual(initialItems);
      
      const updatedItems = [
        createMockMenuItem('Item 2', '/item2', { display: true, role: 2 }),
        createMockMenuItem('Item 3', '/item3', { display: true, role: 3 })
      ];
      menuItemsSignal.set(updatedItems);
      fixture.detectChanges();
      
      expect(component.menuItems()).toEqual(updatedItems);
      expect(component.menuItems().length).toBe(2);
    });
  });

  describe('Logout handling', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should clear menu items on logout event', () => {
      // Set initial menu items
      menuItemsSignal.set(mockMenuItems);
      expect(component.menuItems().length).toBe(2);
      
      // Trigger logout by updating the signal
      logoutTriggerSignal.set(1);
      fixture.detectChanges();
      
      expect(mockMenuService.clearMenuItems).toHaveBeenCalled();
      expect(component.menuItems()).toEqual([]);
    });

    it('should handle multiple logout events', () => {
      // First logout
      logoutTriggerSignal.set(1);
      fixture.detectChanges();
      expect(mockMenuService.clearMenuItems).toHaveBeenCalledTimes(1);
      
      // Second logout
      logoutTriggerSignal.set(2);
      fixture.detectChanges();
      expect(mockMenuService.clearMenuItems).toHaveBeenCalledTimes(2);
    });
  });

  describe('Route detection', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should correctly identify current route', () => {
      spyOnProperty(component.router, 'url', 'get').and.returnValue('/dashboard');
      
      expect(component.isCurrentRoute('/dashboard')).toBe(true);
      expect(component.isCurrentRoute('/profile')).toBe(false);
    });

    it('should handle routes with query parameters', () => {
      spyOnProperty(component.router, 'url', 'get').and.returnValue('/dashboard?tab=overview');
      
      expect(component.isCurrentRoute('/dashboard')).toBe(true);
    });

    it('should handle routes with fragments', () => {
      spyOnProperty(component.router, 'url', 'get').and.returnValue('/dashboard#section');
      
      expect(component.isCurrentRoute('/dashboard')).toBe(true);
    });

    it('should match child routes', () => {
      spyOnProperty(component.router, 'url', 'get').and.returnValue('/dashboard/details');
      
      expect(component.isCurrentRoute('/dashboard')).toBe(true);
    });

    it('should not match unrelated routes', () => {
      spyOnProperty(component.router, 'url', 'get').and.returnValue('/profile');
      
      expect(component.isCurrentRoute('/dashboard')).toBe(false);
    });

    it('should handle empty or null routes', () => {
      expect(component.isCurrentRoute('')).toBe(false);
      expect(component.isCurrentRoute(null as any)).toBe(false);
    });
  });

  describe('Memory management', () => {
    it('should unsubscribe on component destruction', () => {
      fixture.detectChanges();
      
      // Verify component is working
      menuItemsSignal.set(mockMenuItems);
      expect(component.menuItems().length).toBe(2);
      
      // Destroy component
      fixture.destroy();
      
      // Reset spy call count
      mockMenuService.clearMenuItems.calls.reset();
      
      // Verify no more calls after destruction (effect should be cleaned up)
      logoutTriggerSignal.set(1);
      fixture.detectChanges();
      expect(mockMenuService.clearMenuItems).not.toHaveBeenCalled();
    });
  });
});
