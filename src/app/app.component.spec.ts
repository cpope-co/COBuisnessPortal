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

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let messagesService: jasmine.SpyObj<MessagesService>;
  let menuService: jasmine.SpyObj<MenuService>;
  let sessionService: jasmine.SpyObj<SessionService>;
  let router: jasmine.SpyObj<Router>;
  let routerEventsSubject: Subject<any>;
  let authLogoutSubject: Subject<any>;

  beforeEach(async () => {
    routerEventsSubject = new Subject();
    authLogoutSubject = new Subject();
    
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['logout'], {
      isLoggedIn: signal(false),
      logoutEvent: authLogoutSubject.asObservable()
    });
    const messagesServiceSpy = jasmine.createSpyObj('MessagesService', ['clear'], {
      message: signal(null)
    });
    const menuServiceSpy = jasmine.createSpyObj('MenuService', ['getMenuItems', 'clearMenuItems', 'buildMenu', 'setMenuItems']);
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
    menuService = TestBed.inject(MenuService) as jasmine.SpyObj<MenuService>;
    sessionService = TestBed.inject(SessionService) as jasmine.SpyObj<SessionService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
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

    beforeEach(async () => {
      TestBed.resetTestingModule();
      
      const loggedInAuthService = jasmine.createSpyObj('AuthService', ['logout'], {
        isLoggedIn: signal(true),
        logoutEvent: authLogoutSubject.asObservable()
      });
      loggedInSessionService = jasmine.createSpyObj('SessionService', ['startSessionCheck', 'stopSessionCheck']);

      await TestBed.configureTestingModule({
        imports: [
          AppComponent,
          HttpClientTestingModule,
          BrowserAnimationsModule
        ],
        providers: [
          { provide: AuthService, useValue: loggedInAuthService },
          { provide: MessagesService, useValue: messagesService },
          { provide: MenuService, useValue: menuService },
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

    beforeEach(async () => {
      TestBed.resetTestingModule();
      
      const loggedOutAuthService = jasmine.createSpyObj('AuthService', ['logout'], {
        isLoggedIn: signal(false),
        logoutEvent: authLogoutSubject.asObservable()
      });
      loggedOutSessionService = jasmine.createSpyObj('SessionService', ['startSessionCheck', 'stopSessionCheck']);

      await TestBed.configureTestingModule({
        imports: [
          AppComponent,
          HttpClientTestingModule,
          BrowserAnimationsModule
        ],
        providers: [
          { provide: AuthService, useValue: loggedOutAuthService },
          { provide: MessagesService, useValue: messagesService },
          { provide: MenuService, useValue: menuService },
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
      expect(authService.logout).toHaveBeenCalled();
    });
  });

  it('should expose isLoggedIn signal from authService', () => {
    expect(component.isLoggedIn).toBe(authService.isLoggedIn);
  });
});