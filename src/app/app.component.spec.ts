import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router, NavigationStart, ActivatedRoute } from '@angular/router';
import { AuthService } from './auth/auth.service';
import { MessagesService } from './messages/messages.service';
import { MenuService } from './shared/menu/menu.service';
import { SessionService } from './services/session.service';
import { signal } from '@angular/core';
import { Subject, of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MenuItem } from './shared/menu/menu.model';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let messagesService: jasmine.SpyObj<MessagesService>;
  let menuService: any;
  let sessionService: jasmine.SpyObj<SessionService>;
  let router: jasmine.SpyObj<Router>;
  let routerEventsSubject: Subject<any>;
  let logoutTriggerSignal: any;
  let loginTriggerSignal: any;
  let menuItemsSignal: any;
  let menuLoadedSignal: any;

  beforeEach(async () => {
    routerEventsSubject = new Subject();
    logoutTriggerSignal = signal<number>(0);
    loginTriggerSignal = signal<number>(0);
    
    // Create a writable signal for menu items
    menuItemsSignal = signal<MenuItem[]>([]);
    menuLoadedSignal = signal<boolean>(false);
    
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['logout'], {
      isLoggedIn: signal(false),
      logoutTrigger: logoutTriggerSignal.asReadonly(),
      loginTrigger: loginTriggerSignal.asReadonly(),
      user: signal(null)
    });
    const messagesServiceSpy = jasmine.createSpyObj('MessagesService', ['clear'], {
      message: signal(null)
    });
    const menuServiceSpy = jasmine.createSpyObj('MenuService', ['getMenuItems', 'clearMenuItems', 'buildMenu', 'setMenuItems', 'refreshMenu']);
    
    // Add the menuItems signal property to the mock
    Object.defineProperty(menuServiceSpy, 'menuItems', {
      get: () => menuItemsSignal,
      enumerable: true,
      configurable: true
    });
    
    // Add the menuLoaded signal property to the mock
    Object.defineProperty(menuServiceSpy, 'menuLoaded', {
      get: () => menuLoadedSignal,
      enumerable: true,
      configurable: true
    });
    
    // clearMenuItems should clear the signal
    menuServiceSpy.clearMenuItems.and.callFake(() => {
      menuItemsSignal.set([]);
      menuLoadedSignal.set(false);
    });
    
    // setMenuItems should update the signal
    menuServiceSpy.setMenuItems.and.callFake((items: MenuItem[]) => {
      menuItemsSignal.set(items);
    });
    
    const sessionServiceSpy = jasmine.createSpyObj('SessionService', ['startSessionCheck', 'stopSessionCheck']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate', 'createUrlTree', 'serializeUrl'], {
      events: routerEventsSubject.asObservable()
    });
    routerSpy.createUrlTree.and.returnValue({});
    routerSpy.serializeUrl.and.returnValue('/');

    await TestBed.configureTestingModule({
      imports: [
        AppComponent,
        HttpClientTestingModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: MessagesService, useValue: messagesServiceSpy },
        { provide: MenuService, useValue: menuServiceSpy },
        { provide: SessionService, useValue: sessionServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: { params: of({}), queryParams: of({}) } }
      ],
      schemas: [NO_ERRORS_SCHEMA] // This will ignore unknown elements and properties
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    messagesService = TestBed.inject(MessagesService) as jasmine.SpyObj<MessagesService>;
    menuService = TestBed.inject(MenuService) as any;
    sessionService = TestBed.inject(SessionService) as jasmine.SpyObj<SessionService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    
    // Configure menu service mock return values to prevent undefined errors
    menuService.getMenuItems.and.returnValue([]);
    menuService.buildMenu.and.returnValue([]);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should inject all required services', () => {
    expect(component.authService).toBeTruthy();
    expect(component.messageService).toBeTruthy();
    expect(component.menuService).toBeTruthy();
    expect(component.sessionService).toBeTruthy();
    expect(component.router).toBeTruthy();
  });

  it('should clear messages on NavigationStart', () => {
    // Trigger a NavigationStart event
    routerEventsSubject.next(new NavigationStart(1, '/test'));
    
    expect(messagesService.clear).toHaveBeenCalled();
  });

  it('should not clear messages on other router events', () => {
    messagesService.clear.calls.reset();
    
    // Trigger a non-NavigationStart event
    routerEventsSubject.next({ type: 'other' });
    
    expect(messagesService.clear).not.toHaveBeenCalled();
  });

  describe('constructor behavior', () => {
    it('should subscribe to router events and auth logout event', () => {
      // The component is already created in the main beforeEach
      // Just verify that the subscriptions are working
      expect(component).toBeTruthy();
      expect(component.isLoggedIn).toBeDefined();
    });
  });

  describe('constructor behavior when user is logged in', () => {
    let loggedInComponent: AppComponent;
    let loggedInFixture: ComponentFixture<AppComponent>;
    let loggedInSessionService: jasmine.SpyObj<SessionService>;
    let loggedInMenuService: any;
    let loggedInMenuItemsSignal: any;
    let loggedInMenuLoadedSignal: any;

    beforeEach(async () => {
      TestBed.resetTestingModule();
      
      // Create a new signal for this test
      loggedInMenuItemsSignal = signal<MenuItem[]>([]);
      loggedInMenuLoadedSignal = signal<boolean>(false);
      
      const loggedInAuthService = jasmine.createSpyObj('AuthService', ['logout'], {
        isLoggedIn: signal(true),
        logoutTrigger: signal(0).asReadonly(),
        loginTrigger: signal(0).asReadonly(),
        user: signal({ id: 1, email: 'test@example.com', role: 1, firstName: 'Test', lastName: 'User' })
      });
      loggedInSessionService = jasmine.createSpyObj('SessionService', ['startSessionCheck', 'stopSessionCheck']);
      
      loggedInMenuService = jasmine.createSpyObj('MenuService', ['getMenuItems', 'clearMenuItems', 'buildMenu', 'setMenuItems', 'refreshMenu']);
      
      // Add the menuItems signal property to the mock
      Object.defineProperty(loggedInMenuService, 'menuItems', {
        get: () => loggedInMenuItemsSignal,
        enumerable: true,
        configurable: true
      });
      
      // Add the menuLoaded signal property to the mock
      Object.defineProperty(loggedInMenuService, 'menuLoaded', {
        get: () => loggedInMenuLoadedSignal,
        enumerable: true,
        configurable: true
      });
      
      loggedInMenuService.clearMenuItems.and.callFake(() => {
        loggedInMenuItemsSignal.set([]);
        loggedInMenuLoadedSignal.set(false);
      });
      
      loggedInMenuService.setMenuItems.and.callFake((items: MenuItem[]) => {
        loggedInMenuItemsSignal.set(items);
      });
      
      loggedInMenuService.getMenuItems.and.returnValue([]);
      loggedInMenuService.buildMenu.and.returnValue([]);

      await TestBed.configureTestingModule({
        imports: [
          AppComponent,
          HttpClientTestingModule,
          BrowserAnimationsModule
        ],
        providers: [
          { provide: AuthService, useValue: loggedInAuthService },
          { provide: MessagesService, useValue: messagesService },
          { provide: MenuService, useValue: loggedInMenuService },
          { provide: SessionService, useValue: loggedInSessionService },
          { provide: Router, useValue: router },
          { provide: ActivatedRoute, useValue: { params: of({}), queryParams: of({}) } }
        ],
        schemas: [NO_ERRORS_SCHEMA]
      }).compileComponents();

      loggedInFixture = TestBed.createComponent(AppComponent);
      loggedInComponent = loggedInFixture.componentInstance;
      loggedInFixture.detectChanges();
    });

    it('should start session check when user is logged in', () => {
      expect(loggedInSessionService.stopSessionCheck).toHaveBeenCalled();
      expect(loggedInSessionService.startSessionCheck).toHaveBeenCalled();
    });
  });

  describe('constructor behavior when user is not logged in', () => {
    let loggedOutComponent: AppComponent;
    let loggedOutFixture: ComponentFixture<AppComponent>;
    let loggedOutSessionService: jasmine.SpyObj<SessionService>;
    let loggedOutMenuService: any;
    let loggedOutMenuItemsSignal: any;
    let loggedOutMenuLoadedSignal: any;

    beforeEach(async () => {
      TestBed.resetTestingModule();
      
      // Create a new signal for this test
      loggedOutMenuItemsSignal = signal<MenuItem[]>([]);
      loggedOutMenuLoadedSignal = signal<boolean>(false);
      
      const loggedOutAuthService = jasmine.createSpyObj('AuthService', ['logout'], {
        isLoggedIn: signal(false),
        logoutTrigger: signal(0).asReadonly(),
        loginTrigger: signal(0).asReadonly(),
        user: signal(null)
      });
      loggedOutSessionService = jasmine.createSpyObj('SessionService', ['startSessionCheck', 'stopSessionCheck']);
      
      loggedOutMenuService = jasmine.createSpyObj('MenuService', ['getMenuItems', 'clearMenuItems', 'buildMenu', 'setMenuItems', 'refreshMenu']);
      
      // Add the menuItems signal property to the mock
      Object.defineProperty(loggedOutMenuService, 'menuItems', {
        get: () => loggedOutMenuItemsSignal,
        enumerable: true,
        configurable: true
      });
      
      // Add the menuLoaded signal property to the mock
      Object.defineProperty(loggedOutMenuService, 'menuLoaded', {
        get: () => loggedOutMenuLoadedSignal,
        enumerable: true,
        configurable: true
      });
      
      loggedOutMenuService.clearMenuItems.and.callFake(() => {
        loggedOutMenuItemsSignal.set([]);
        loggedOutMenuLoadedSignal.set(false);
      });
      
      loggedOutMenuService.setMenuItems.and.callFake((items: MenuItem[]) => {
        loggedOutMenuItemsSignal.set(items);
      });
      
      loggedOutMenuService.getMenuItems.and.returnValue([]);
      loggedOutMenuService.buildMenu.and.returnValue([]);

      await TestBed.configureTestingModule({
        imports: [
          AppComponent,
          HttpClientTestingModule,
          BrowserAnimationsModule
        ],
        providers: [
          { provide: AuthService, useValue: loggedOutAuthService },
          { provide: MessagesService, useValue: messagesService },
          { provide: MenuService, useValue: loggedOutMenuService },
          { provide: SessionService, useValue: loggedOutSessionService },
          { provide: Router, useValue: router },
          { provide: ActivatedRoute, useValue: { params: of({}), queryParams: of({}) } }
        ],
        schemas: [NO_ERRORS_SCHEMA]
      }).compileComponents();

      loggedOutFixture = TestBed.createComponent(AppComponent);
      loggedOutComponent = loggedOutFixture.componentInstance;
      loggedOutFixture.detectChanges();
    });

    it('should not start session check when user is not logged in', () => {
      expect(loggedOutSessionService.stopSessionCheck).not.toHaveBeenCalled();
      expect(loggedOutSessionService.startSessionCheck).not.toHaveBeenCalled();
    });
  });

  describe('onLogout', () => {
    it('should stop session check and call auth service logout', () => {
      component.onLogout();
      
      expect(sessionService.stopSessionCheck).toHaveBeenCalled();
      expect(authService.logout).toHaveBeenCalledWith('manual');
    });
  });

  it('should expose isLoggedIn signal from authService', () => {
    expect(component.isLoggedIn).toBe(authService.isLoggedIn);
  });
});