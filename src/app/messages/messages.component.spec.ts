import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DebugElement } from '@angular/core';

import { MessagesComponent } from './messages.component';
import { MessagesService } from './messages.service';
import { MessageSeverity } from '../models/messages.model';

describe('MessagesComponent', () => {
  let component: MessagesComponent;
  let fixture: ComponentFixture<MessagesComponent>;
  let messagesService: MessagesService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessagesComponent, NoopAnimationsModule]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MessagesComponent);
    component = fixture.componentInstance;
    messagesService = TestBed.inject(MessagesService);
    fixture.detectChanges();
  });

  describe('Component initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should inject MessagesService', () => {
      expect(component.messagesService).toBe(messagesService);
    });

    it('should have message signal from service', () => {
      expect(component.message).toBe(messagesService.message);
    });

    it('should not display message when no message is set', () => {
      const messageContainer = fixture.debugElement.query(By.css('.alert'));
      expect(messageContainer).toBeFalsy();
    });
  });

  describe('Message display', () => {
    it('should display success message', () => {
      messagesService.showMessage('Success message', 'success');
      fixture.detectChanges();

      const messageContainer = fixture.debugElement.query(By.css('.alert'));
      expect(messageContainer).toBeTruthy();
      expect(messageContainer.nativeElement.classList.contains('alert-success')).toBe(true);
      
      const messageText = fixture.debugElement.query(By.css('span'));
      expect(messageText.nativeElement.textContent).toBe('Success message');
      
      const icon = fixture.debugElement.query(By.css('mat-icon'));
      expect(icon.nativeElement.textContent.trim()).toBe('check_circle');
    });

    it('should display warning message', () => {
      messagesService.showMessage('Warning message', 'warning');
      fixture.detectChanges();

      const messageContainer = fixture.debugElement.query(By.css('.alert'));
      expect(messageContainer.nativeElement.classList.contains('alert-warning')).toBe(true);
      
      const messageText = fixture.debugElement.query(By.css('span'));
      expect(messageText.nativeElement.textContent).toBe('Warning message');
      
      const icon = fixture.debugElement.query(By.css('mat-icon'));
      expect(icon.nativeElement.textContent.trim()).toBe('warning');
    });

    it('should display danger message', () => {
      messagesService.showMessage('Danger message', 'danger');
      fixture.detectChanges();

      const messageContainer = fixture.debugElement.query(By.css('.alert'));
      expect(messageContainer.nativeElement.classList.contains('alert-danger')).toBe(true);
      
      const messageText = fixture.debugElement.query(By.css('span'));
      expect(messageText.nativeElement.textContent).toBe('Danger message');
      
      const icon = fixture.debugElement.query(By.css('mat-icon'));
      expect(icon.nativeElement.textContent.trim()).toBe('error');
    });

    it('should display info message', () => {
      messagesService.showMessage('Info message', 'info');
      fixture.detectChanges();

      const messageContainer = fixture.debugElement.query(By.css('.alert'));
      expect(messageContainer.nativeElement.classList.contains('alert-info')).toBe(true);
      
      const messageText = fixture.debugElement.query(By.css('span'));
      expect(messageText.nativeElement.textContent).toBe('Info message');
      
      const icon = fixture.debugElement.query(By.css('mat-icon'));
      expect(icon.nativeElement.textContent.trim()).toBe('info');
    });

    it('should update display when message changes', () => {
      messagesService.showMessage('First message', 'success');
      fixture.detectChanges();

      let messageText = fixture.debugElement.query(By.css('span'));
      expect(messageText.nativeElement.textContent).toBe('First message');

      messagesService.showMessage('Second message', 'danger');
      fixture.detectChanges();

      messageText = fixture.debugElement.query(By.css('span'));
      expect(messageText.nativeElement.textContent).toBe('Second message');
      
      const messageContainer = fixture.debugElement.query(By.css('.alert'));
      expect(messageContainer.nativeElement.classList.contains('alert-danger')).toBe(true);
    });
  });

  describe('Template structure', () => {
    beforeEach(() => {
      messagesService.showMessage('Test message', 'info');
      fixture.detectChanges();
    });

    it('should have correct Bootstrap classes', () => {
      const row = fixture.debugElement.query(By.css('.row'));
      expect(row).toBeTruthy();
      expect(row.nativeElement.classList.contains('mt-4')).toBe(true);

      const col = fixture.debugElement.query(By.css('.col-xs-12'));
      expect(col).toBeTruthy();
      expect(col.nativeElement.classList.contains('offset-xs-0')).toBe(true);
      expect(col.nativeElement.classList.contains('col-lg-10')).toBe(true);
      expect(col.nativeElement.classList.contains('offset-lg-1')).toBe(true);
    });

    it('should have correct alert classes', () => {
      const alert = fixture.debugElement.query(By.css('.alert'));
      expect(alert.nativeElement.classList.contains('alert-dismissible')).toBe(true);
      expect(alert.nativeElement.classList.contains('fade')).toBe(true);
      expect(alert.nativeElement.classList.contains('show')).toBe(true);
      expect(alert.nativeElement.getAttribute('role')).toBe('alert');
    });

    it('should have close button', () => {
      const closeButton = fixture.debugElement.query(By.css('.btn-close'));
      expect(closeButton).toBeTruthy();
      expect(closeButton.nativeElement.type).toBe('button');
    });

    it('should display mat-icon', () => {
      const icon = fixture.debugElement.query(By.css('mat-icon'));
      expect(icon).toBeTruthy();
    });

    it('should display message text in span', () => {
      const span = fixture.debugElement.query(By.css('span'));
      expect(span).toBeTruthy();
      expect(span.nativeElement.textContent).toBe('Test message');
    });
  });

  describe('User interactions', () => {
    beforeEach(() => {
      messagesService.showMessage('Test message', 'success');
      fixture.detectChanges();
    });

    it('should call onClose when close button is clicked', () => {
      spyOn(component, 'onClose');
      
      const closeButton = fixture.debugElement.query(By.css('.btn-close'));
      closeButton.nativeElement.click();
      
      expect(component.onClose).toHaveBeenCalled();
    });

    it('should clear message when onClose is called', () => {
      expect(component.message()).toBeTruthy();
      
      component.onClose();
      fixture.detectChanges();
      
      expect(component.message()).toBeFalsy();
      const messageContainer = fixture.debugElement.query(By.css('.alert'));
      expect(messageContainer).toBeFalsy();
    });

    it('should call MessagesService.clear when onClose is called', () => {
      spyOn(messagesService, 'clear');
      
      component.onClose();
      
      expect(messagesService.clear).toHaveBeenCalled();
    });
  });

  describe('Message lifecycle', () => {
    it('should show and hide message with duration', fakeAsync(() => {
      messagesService.showMessage('Timed message', 'info', 1000);
      fixture.detectChanges();

      let messageContainer = fixture.debugElement.query(By.css('.alert'));
      expect(messageContainer).toBeTruthy();

      tick(1000);
      fixture.detectChanges();

      messageContainer = fixture.debugElement.query(By.css('.alert'));
      expect(messageContainer).toBeFalsy();
    }));

    it('should not display message after service clear is called', () => {
      messagesService.showMessage('Test message', 'success');
      fixture.detectChanges();

      let messageContainer = fixture.debugElement.query(By.css('.alert'));
      expect(messageContainer).toBeTruthy();

      messagesService.clear();
      fixture.detectChanges();

      messageContainer = fixture.debugElement.query(By.css('.alert'));
      expect(messageContainer).toBeFalsy();
    });
  });

  describe('Edge cases', () => {
    it('should handle empty message text', () => {
      messagesService.showMessage('', 'info');
      fixture.detectChanges();

      const messageContainer = fixture.debugElement.query(By.css('.alert'));
      expect(messageContainer).toBeTruthy();
      
      const messageText = fixture.debugElement.query(By.css('span'));
      expect(messageText.nativeElement.textContent).toBe('');
    });

    it('should handle rapid message changes', () => {
      messagesService.showMessage('Message 1', 'success');
      messagesService.showMessage('Message 2', 'danger');
      messagesService.showMessage('Message 3', 'warning');
      fixture.detectChanges();

      const messageText = fixture.debugElement.query(By.css('span'));
      expect(messageText.nativeElement.textContent).toBe('Message 3');
      
      const messageContainer = fixture.debugElement.query(By.css('.alert'));
      expect(messageContainer.nativeElement.classList.contains('alert-warning')).toBe(true);
    });

    it('should handle message clearing after close button click', () => {
      messagesService.showMessage('Test message', 'info');
      fixture.detectChanges();

      const closeButton = fixture.debugElement.query(By.css('.btn-close'));
      closeButton.nativeElement.click();
      fixture.detectChanges();

      const messageContainer = fixture.debugElement.query(By.css('.alert'));
      expect(messageContainer).toBeFalsy();
      expect(component.message()).toBeFalsy();
    });
  });

  describe('Integration with MessagesService', () => {
    it('should reflect service message state changes', () => {
      expect(component.message()).toBeFalsy();

      messagesService.showMessage('Service message', 'success');
      expect(component.message()).toBeTruthy();
      expect(component.message()?.text).toBe('Service message');
      expect(component.message()?.severity).toBe('success');

      messagesService.clear();
      expect(component.message()).toBeFalsy();
    });

    it('should update when service message changes', () => {
      messagesService.showMessage('First', 'info');
      expect(component.message()?.text).toBe('First');

      messagesService.showMessage('Second', 'warning');
      expect(component.message()?.text).toBe('Second');
      expect(component.message()?.severity).toBe('warning');
    });
  });
});
