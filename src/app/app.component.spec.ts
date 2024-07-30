import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MessagesService } from './messages/messages.service';
import { SessionService } from './services/session.service';
import { AuthService } from './services/auth.service';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        MatIconModule,
        MatMenuModule,
        MatSidenavModule,
        MatToolbarModule,
        MatButtonModule,
        MatListModule
      ],
      declarations: [AppComponent],
      providers: [MessagesService, SessionService, AuthService]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should render title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Hello, COBusinessPortal');
  });

  it('should call sessionService.stopSessionCheck() and sessionService.startSessionCheck() if user is logged in', () => {
    spyOn(component.sessionService, 'stopSessionCheck');
    spyOn(component.sessionService, 'startSessionCheck');
    spyOn(component.authService, 'isLoggedIn').and.returnValue(true);

    expect(component.sessionService.stopSessionCheck).toHaveBeenCalled();
    expect(component.sessionService.startSessionCheck).toHaveBeenCalled();
  });

  it('should call sessionService.stopSessionCheck() and authService.logout() on logout', () => {
    spyOn(component.sessionService, 'stopSessionCheck');
    spyOn(component.authService, 'logout');

    component.onLogout();

    expect(component.sessionService.stopSessionCheck).toHaveBeenCalled();
    expect(component.authService.logout).toHaveBeenCalled();
  });
});