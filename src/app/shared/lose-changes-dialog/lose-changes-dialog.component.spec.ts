import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

import { LoseChangesDialogComponent } from './lose-changes-dialog.component';
import { LoseChangesDialogData } from './lose-changes-dialog.data.model';
import { AuthService } from '../../auth/auth.service';
import { SessionService } from '../../services/session.service';
import { MessagesService } from '../../messages/messages.service';

describe('LoseChangesDialogComponent', () => {
  let component: LoseChangesDialogComponent;
  let fixture: ComponentFixture<LoseChangesDialogComponent>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<LoseChangesDialogComponent>>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockSessionService: jasmine.SpyObj<SessionService>;
  let mockMessagesService: jasmine.SpyObj<MessagesService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockDialogData: LoseChangesDialogData;

  beforeEach(async () => {
    // Create spies
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close', 'afterClosed']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['logout', 'refreshToken']);
    mockSessionService = jasmine.createSpyObj('SessionService', ['clearSession', 'refreshSession']);
    mockMessagesService = jasmine.createSpyObj('MessagesService', ['showMessage']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    // Mock dialog data
    mockDialogData = {
      mode: 'save',
      title: 'Unsaved Changes',
      message: 'You have unsaved changes. What would you like to do?',
      destination: '/dashboard'
    };

    // Setup afterClosed to return observable
    mockDialogRef.afterClosed.and.returnValue(of(undefined));

    await TestBed.configureTestingModule({
      imports: [
        LoseChangesDialogComponent,
        HttpClientTestingModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: MatDialog, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: AuthService, useValue: mockAuthService },
        { provide: SessionService, useValue: mockSessionService },
        { provide: MessagesService, useValue: mockMessagesService },
        { provide: Router, useValue: mockRouter }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LoseChangesDialogComponent);
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
    expect(component.messageService).toBeDefined();
    expect(component.router).toBeDefined();
  });

  it('should have dialog data injected', () => {
    expect(component.data).toEqual(mockDialogData);
    expect(component.data.title).toBe('Unsaved Changes');
    expect(component.data.message).toBe('You have unsaved changes. What would you like to do?');
    expect(component.data.destination).toBe('/dashboard');
    expect(component.data.mode).toBe('save');
  });

  describe('Template rendering', () => {
    it('should display the dialog title', () => {
      const titleElement = fixture.nativeElement.querySelector('h3[mat-dialog-title]');
      expect(titleElement).toBeTruthy();
      expect(titleElement.textContent.trim()).toBe('Unsaved Changes');
    });

    it('should display the dialog message', () => {
      const messageElement = fixture.nativeElement.querySelector('mat-dialog-content p');
      expect(messageElement).toBeTruthy();
      expect(messageElement.textContent.trim()).toBe('You have unsaved changes. What would you like to do?');
    });

    it('should render both action buttons', () => {
      const buttons = fixture.nativeElement.querySelectorAll('button[mat-button]');
      expect(buttons.length).toBe(2);
      
      const discardButton = buttons[0];
      const stayButton = buttons[1];
      
      expect(discardButton.textContent.trim()).toBe('Discard');
      expect(discardButton.getAttribute('color')).toBe('warn');
      
      expect(stayButton.textContent.trim()).toBe('Stay');
      expect(stayButton.getAttribute('color')).toBe('primary');
    });

    it('should handle missing message gracefully', () => {
      // Update data to not have a message
      component.data = {
        mode: 'save',
        title: 'Test Title',
        destination: '/test'
      };
      fixture.detectChanges();

      const messageElement = fixture.nativeElement.querySelector('mat-dialog-content p');
      expect(messageElement).toBeTruthy();
      expect(messageElement.textContent.trim()).toBe('');
    });
  });

  describe('onCancel', () => {
    it('should close the dialog', async () => {
      await component.onCancel();
      expect(mockDialogRef.close).toHaveBeenCalled();
    });

    it('should navigate to destination after dialog closes', async () => {
      await component.onCancel();
      expect(mockDialogRef.afterClosed).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should show warning message after dialog closes', async () => {
      await component.onCancel();
      expect(mockMessagesService.showMessage).toHaveBeenCalledWith('Changes were not saved', 'warning');
    });

    it('should work with different destinations', async () => {
      component.data.destination = '/profile';
      await component.onCancel();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/profile']);
    });

    it('should handle button click', () => {
      spyOn(component, 'onCancel');
      const discardButton = fixture.nativeElement.querySelector('button[color="warn"]');
      discardButton.click();
      expect(component.onCancel).toHaveBeenCalled();
    });
  });

  describe('onStay', () => {
    it('should close the dialog', async () => {
      await component.onStay();
      expect(mockDialogRef.close).toHaveBeenCalled();
    });

    it('should show info message', async () => {
      await component.onStay();
      expect(mockMessagesService.showMessage).toHaveBeenCalledWith('Complete your changes before leaving', 'info');
    });

    it('should not navigate anywhere', async () => {
      await component.onStay();
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should handle button click', () => {
      spyOn(component, 'onStay');
      const stayButton = fixture.nativeElement.querySelector('button[color="primary"]');
      stayButton.click();
      expect(component.onStay).toHaveBeenCalled();
    });
  });

  describe('Component integration', () => {
    it('should handle complete discard workflow', async () => {
      // Simulate clicking discard button
      const discardButton = fixture.nativeElement.querySelector('button[color="warn"]');
      discardButton.click();

      // Verify the complete workflow
      expect(mockDialogRef.close).toHaveBeenCalled();
      expect(mockDialogRef.afterClosed).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
      expect(mockMessagesService.showMessage).toHaveBeenCalledWith('Changes were not saved', 'warning');
    });

    it('should handle complete stay workflow', async () => {
      // Simulate clicking stay button
      const stayButton = fixture.nativeElement.querySelector('button[color="primary"]');
      stayButton.click();

      // Verify the complete workflow
      expect(mockDialogRef.close).toHaveBeenCalled();
      expect(mockMessagesService.showMessage).toHaveBeenCalledWith('Complete your changes before leaving', 'info');
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });

  describe('Error handling', () => {
    it('should handle successful navigation', async () => {
      mockRouter.navigate.and.returnValue(Promise.resolve(true));
      
      await component.onCancel();
      expect(mockDialogRef.close).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should navigate on afterClosed when dialog is canceled', fakeAsync(() => {
      mockRouter.navigate.and.returnValue(Promise.resolve(true));
      
      component.onCancel();
      
      expect(mockDialogRef.close).toHaveBeenCalled();
      
      // Simulate the afterClosed observable
      mockDialogRef.afterClosed.and.returnValue(of(undefined));
      
      // Wait for async operations
      tick();
      
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
    }));

    it('should handle message service in onStay', async () => {
      await component.onStay();
      expect(mockMessagesService.showMessage).toHaveBeenCalledWith('Complete your changes before leaving', 'info');
      expect(mockDialogRef.close).toHaveBeenCalled();
    });
  });

  describe('Data variations', () => {
    it('should work with minimal data', () => {
      const minimalData: LoseChangesDialogData = {
        mode: 'save',
        title: 'Warning',
        destination: '/'
      };
      
      component.data = minimalData;
      fixture.detectChanges();
      
      expect(component.data.title).toBe('Warning');
      expect(component.data.destination).toBe('/');
      expect(component.data.message).toBeUndefined();
    });

    it('should handle different destinations properly', async () => {
      const testCases = ['/home', '/settings', '/profile', '/admin'];
      
      for (const destination of testCases) {
        component.data.destination = destination;
        await component.onCancel();
        expect(mockRouter.navigate).toHaveBeenCalledWith([destination]);
        mockRouter.navigate.calls.reset();
      }
    });
  });
});
