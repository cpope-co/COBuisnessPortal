import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { RefreshSessionDialogComponent, openRefreshSessionDialog } from './refresh-session-dialog.component';
import { RefreshSessionDialogData } from './refresh-session-dialog.data.model';
import { AuthService } from '../../auth/auth.service';
import { SessionService } from '../../services/session.service';

describe('RefreshSessionDialogComponent', () => {
  let component: RefreshSessionDialogComponent;
  let fixture: ComponentFixture<RefreshSessionDialogComponent>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<RefreshSessionDialogComponent>>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockSessionService: jasmine.SpyObj<SessionService>;
  let mockDialog: jasmine.SpyObj<MatDialog>;
  let mockDialogData: RefreshSessionDialogData;

  beforeEach(async () => {
    // Create spies
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close', 'afterClosed']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['logout', 'refreshToken']);
    mockSessionService = jasmine.createSpyObj('SessionService', ['resetSession', 'clearSession']);
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);

    // Mock dialog data
    mockDialogData = {
      mode: 'refresh',
      title: 'Session Expired',
      message: 'Your session has expired. Please refresh your session or logout.'
    };

    // Setup afterClosed to return observable
    mockDialogRef.afterClosed.and.returnValue(of());

    await TestBed.configureTestingModule({
      imports: [
        RefreshSessionDialogComponent,
        HttpClientTestingModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: MatDialog, useValue: mockDialog },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: AuthService, useValue: mockAuthService },
        { provide: SessionService, useValue: mockSessionService }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RefreshSessionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should inject all required services', () => {
    expect(component.dialogRef).toBeDefined();
    expect(component.authService).toBeDefined();
    expect(component.sessionService).toBeDefined();
  });

  it('should have dialog data injected', () => {
    expect(component.data).toEqual(mockDialogData);
    expect(component.data.title).toBe('Session Expired');
    expect(component.data.message).toBe('Your session has expired. Please refresh your session or logout.');
    expect(component.data.mode).toBe('refresh');
  });

  describe('Template rendering', () => {
    it('should display the dialog title', () => {
      const titleElement = fixture.nativeElement.querySelector('h3[mat-dialog-title]');
      expect(titleElement).toBeTruthy();
      expect(titleElement.textContent.trim()).toBe('Session Expired');
    });

    it('should display the dialog message', () => {
      const messageElement = fixture.nativeElement.querySelector('mat-dialog-content p');
      expect(messageElement).toBeTruthy();
      expect(messageElement.textContent.trim()).toBe('Your session has expired. Please refresh your session or logout.');
    });

    it('should render both action buttons', () => {
      const buttons = fixture.nativeElement.querySelectorAll('button[mat-button]');
      expect(buttons.length).toBe(2);
      
      const logoutButton = buttons[0];
      const refreshButton = buttons[1];
      
      expect(logoutButton.textContent.trim()).toBe('Logout');
      expect(refreshButton.textContent.trim()).toBe('Refresh');
    });

    it('should handle missing message gracefully', () => {
      // Update data to not have a message
      component.data = {
        mode: 'refresh',
        title: 'Test Title'
      };
      fixture.detectChanges();

      const messageElement = fixture.nativeElement.querySelector('mat-dialog-content p');
      expect(messageElement).toBeTruthy();
      expect(messageElement.textContent.trim()).toBe('');
    });
  });

  describe('onLogout', () => {
    it('should call authService.logout', async () => {
      mockAuthService.logout.and.returnValue(Promise.resolve());
      
      await component.onLogout();
      
      expect(mockAuthService.logout).toHaveBeenCalled();
    });

    it('should close the dialog after logout', async () => {
      mockAuthService.logout.and.returnValue(Promise.resolve());
      
      await component.onLogout();
      
      expect(mockDialogRef.close).toHaveBeenCalled();
    });

    it('should handle logout button click', () => {
      spyOn(component, 'onLogout');
      const logoutButton = fixture.nativeElement.querySelector('button:first-child');
      
      logoutButton.click();
      
      expect(component.onLogout).toHaveBeenCalled();
    });

    it('should propagate logout errors', async () => {
      const error = new Error('Logout failed');
      mockAuthService.logout.and.returnValue(Promise.reject(error));
      
      await expectAsync(component.onLogout()).toBeRejectedWith(error);
      
      expect(mockAuthService.logout).toHaveBeenCalled();
    });
  });

  describe('onRefresh', () => {
    it('should call sessionService.resetSession', async () => {
      await component.onRefresh();
      expect(mockSessionService.resetSession).toHaveBeenCalled();
    });

    it('should close the dialog after refresh', async () => {
      await component.onRefresh();
      expect(mockDialogRef.close).toHaveBeenCalled();
    });

    it('should handle refresh button click', () => {
      spyOn(component, 'onRefresh');
      const refreshButton = fixture.nativeElement.querySelector('button:last-child');
      
      refreshButton.click();
      
      expect(component.onRefresh).toHaveBeenCalled();
    });

    it('should propagate refresh errors', async () => {
      const error = new Error('Refresh failed');
      mockSessionService.resetSession.and.throwError(error);
      
      await expectAsync(component.onRefresh()).toBeRejected();
      
      expect(mockSessionService.resetSession).toHaveBeenCalled();
    });
  });

  describe('Component integration', () => {
    it('should handle complete logout workflow', async () => {
      mockAuthService.logout.and.returnValue(Promise.resolve());
      
      // Simulate clicking logout button
      const logoutButton = fixture.nativeElement.querySelector('button:first-child');
      logoutButton.click();

      // Wait for async operation
      await fixture.whenStable();

      // Verify the complete workflow
      expect(mockAuthService.logout).toHaveBeenCalled();
      expect(mockDialogRef.close).toHaveBeenCalled();
    });

    it('should handle complete refresh workflow', async () => {
      // Simulate clicking refresh button
      const refreshButton = fixture.nativeElement.querySelector('button:last-child');
      refreshButton.click();

      // Wait for async operation
      await fixture.whenStable();

      // Verify the complete workflow
      expect(mockSessionService.resetSession).toHaveBeenCalled();
      expect(mockDialogRef.close).toHaveBeenCalled();
    });
  });

  describe('Data variations', () => {
    it('should work with minimal data', () => {
      const minimalData: RefreshSessionDialogData = {
        mode: 'refresh',
        title: 'Session Issue'
      };
      
      component.data = minimalData;
      fixture.detectChanges();
      
      expect(component.data.title).toBe('Session Issue');
      expect(component.data.message).toBeUndefined();
      expect(component.data.mode).toBe('refresh');
    });

    it('should handle different titles properly', () => {
      const testTitles = ['Session Timeout', 'Authentication Required', 'Please Login'];
      
      for (const title of testTitles) {
        component.data.title = title;
        fixture.detectChanges();
        
        const titleElement = fixture.nativeElement.querySelector('h3[mat-dialog-title]');
        expect(titleElement.textContent.trim()).toBe(title);
      }
    });

    it('should handle different messages properly', () => {
      const testMessages = [
        'Your session has timed out.',
        'Please authenticate again.',
        'Session expired due to inactivity.'
      ];
      
      for (const message of testMessages) {
        component.data.message = message;
        fixture.detectChanges();
        
        const messageElement = fixture.nativeElement.querySelector('mat-dialog-content p');
        expect(messageElement.textContent.trim()).toBe(message);
      }
    });
  });
});

describe('openRefreshSessionDialog utility function', () => {
  let mockDialog: jasmine.SpyObj<MatDialog>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<RefreshSessionDialogComponent>>;

  beforeEach(() => {
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close', 'afterClosed']);
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);
    mockDialog.open.and.returnValue(mockDialogRef);
  });

  it('should open dialog with correct configuration', () => {
    const testData: RefreshSessionDialogData = {
      mode: 'refresh',
      title: 'Test Session Dialog',
      message: 'Test message'
    };

    const result = openRefreshSessionDialog(mockDialog, testData);

    expect(mockDialog.open).toHaveBeenCalledWith(RefreshSessionDialogComponent, jasmine.objectContaining({
      disableClose: true,
      autoFocus: true,
      width: '400px',
      data: testData
    }));
    expect(result).toBe(mockDialogRef);
  });

  it('should handle data without message', () => {
    const testData: RefreshSessionDialogData = {
      mode: 'refresh',
      title: 'Test Title'
    };

    openRefreshSessionDialog(mockDialog, testData);

    expect(mockDialog.open).toHaveBeenCalledWith(RefreshSessionDialogComponent, jasmine.objectContaining({
      data: testData
    }));
  });

  it('should return the dialog reference', () => {
    const testData: RefreshSessionDialogData = {
      mode: 'refresh',
      title: 'Test'
    };

    const result = openRefreshSessionDialog(mockDialog, testData);

    expect(result).toBe(mockDialogRef);
    expect(result).toBeDefined();
  });
});
