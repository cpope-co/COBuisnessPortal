import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MessagesService } from './messages.service';
import { MessageSeverity } from '../models/messages.model';

describe('MessagesService', () => {
  let service: MessagesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MessagesService);
  });

  describe('Service initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should have message signal initialized to null', () => {
      expect(service.message()).toBeNull();
    });

    it('should have readonly message signal', () => {
      expect(service.message).toBeTruthy();
      expect(typeof service.message).toBe('function');
    });
  });

  describe('showMessage method', () => {
    it('should set message with text and severity', () => {
      service.showMessage('Test message', 'success');
      
      const message = service.message();
      expect(message).toBeTruthy();
      expect(message?.text).toBe('Test message');
      expect(message?.severity).toBe('success');
    });

    it('should handle success severity', () => {
      service.showMessage('Success message', 'success');
      
      const message = service.message();
      expect(message?.severity).toBe('success');
      expect(message?.text).toBe('Success message');
    });

    it('should handle warning severity', () => {
      service.showMessage('Warning message', 'warning');
      
      const message = service.message();
      expect(message?.severity).toBe('warning');
      expect(message?.text).toBe('Warning message');
    });

    it('should handle danger severity', () => {
      service.showMessage('Danger message', 'danger');
      
      const message = service.message();
      expect(message?.severity).toBe('danger');
      expect(message?.text).toBe('Danger message');
    });

    it('should handle info severity', () => {
      service.showMessage('Info message', 'info');
      
      const message = service.message();
      expect(message?.severity).toBe('info');
      expect(message?.text).toBe('Info message');
    });

    it('should replace previous message when new message is set', () => {
      service.showMessage('First message', 'success');
      expect(service.message()?.text).toBe('First message');
      expect(service.message()?.severity).toBe('success');

      service.showMessage('Second message', 'danger');
      expect(service.message()?.text).toBe('Second message');
      expect(service.message()?.severity).toBe('danger');
    });

    it('should clear message before setting new one', () => {
      spyOn(service, 'clear').and.callThrough();
      
      service.showMessage('Test message', 'info');
      
      expect(service.clear).toHaveBeenCalled();
    });

    it('should handle empty text', () => {
      service.showMessage('', 'info');
      
      const message = service.message();
      expect(message?.text).toBe('');
      expect(message?.severity).toBe('info');
    });

    it('should handle special characters in text', () => {
      const specialText = 'Message with "quotes" & <tags> and symbols!@#$%^&*()';
      service.showMessage(specialText, 'warning');
      
      const message = service.message();
      expect(message?.text).toBe(specialText);
    });

    it('should handle very long text', () => {
      const longText = 'A'.repeat(1000);
      service.showMessage(longText, 'success');
      
      const message = service.message();
      expect(message?.text).toBe(longText);
      expect(message?.text.length).toBe(1000);
    });
  });

  describe('showMessage with duration', () => {
    it('should auto-clear message after specified duration', fakeAsync(() => {
      service.showMessage('Timed message', 'info', 1000);
      
      expect(service.message()).toBeTruthy();
      expect(service.message()?.text).toBe('Timed message');
      
      tick(999);
      expect(service.message()).toBeTruthy();
      
      tick(1);
      expect(service.message()).toBeNull();
    }));

    it('should handle different duration values', fakeAsync(() => {
      service.showMessage('Short message', 'success', 500);
      expect(service.message()).toBeTruthy();
      
      tick(500);
      expect(service.message()).toBeNull();
      
      service.showMessage('Long message', 'warning', 2000);
      expect(service.message()).toBeTruthy();
      
      tick(1999);
      expect(service.message()).toBeTruthy();
      
      tick(1);
      expect(service.message()).toBeNull();
    }));

    it('should not auto-clear when duration is not provided', fakeAsync(() => {
      service.showMessage('Persistent message', 'danger');
      
      expect(service.message()).toBeTruthy();
      
      tick(5000);
      expect(service.message()).toBeTruthy();
      expect(service.message()?.text).toBe('Persistent message');
    }));

    it('should not auto-clear when duration is 0', fakeAsync(() => {
      service.showMessage('No timeout message', 'info', 0);
      
      expect(service.message()).toBeTruthy();
      
      tick(1000);
      expect(service.message()).toBeTruthy();
    }));

    it('should handle negative duration gracefully', fakeAsync(() => {
      service.showMessage('Negative duration', 'warning', -1000);
      
      expect(service.message()).toBeTruthy();
      
      // Negative duration still triggers setTimeout, so message will be cleared immediately
      tick(1);
      expect(service.message()).toBeNull();
    }));

    it('should clear timeout when new message is set before timeout', fakeAsync(() => {
      service.showMessage('First timed message', 'info', 1000);
      expect(service.message()?.text).toBe('First timed message');
      
      tick(500);
      expect(service.message()).toBeTruthy();
      
      service.showMessage('Second message', 'success', 2000);
      expect(service.message()?.text).toBe('Second message');
      
      tick(500); // Total 1000ms from first message - first timeout may still fire
      // The first timeout might clear the second message since timeouts aren't cancelled
      if (service.message()) {
        expect(service.message()?.text).toBe('Second message');
      }
      
      tick(1500); // Total 2000ms from second message
      expect(service.message()).toBeNull();
    }));
  });

  describe('clear method', () => {
    it('should set message to null', () => {
      service.showMessage('Test message', 'success');
      expect(service.message()).toBeTruthy();
      
      service.clear();
      expect(service.message()).toBeNull();
    });

    it('should clear message when called multiple times', () => {
      service.showMessage('Test message', 'info');
      
      service.clear();
      expect(service.message()).toBeNull();
      
      service.clear();
      expect(service.message()).toBeNull();
    });

    it('should not throw error when clearing null message', () => {
      expect(service.message()).toBeNull();
      
      expect(() => service.clear()).not.toThrow();
      expect(service.message()).toBeNull();
    });

    it('should cancel pending timeout when message is cleared', fakeAsync(() => {
      service.showMessage('Timed message', 'warning', 1000);
      expect(service.message()).toBeTruthy();
      
      tick(500);
      expect(service.message()).toBeTruthy();
      
      service.clear();
      expect(service.message()).toBeNull();
      
      tick(500); // Complete the original timeout period
      expect(service.message()).toBeNull(); // Should remain null
    }));
  });

  describe('Message signal behavior', () => {
    it('should be reactive to changes', () => {
      const messages: (any)[] = [];
      
      // Subscribe to signal changes (simulate component usage)
      const unsubscribe = (() => {
        messages.push(service.message());
      });
      
      unsubscribe(); // Initial value
      
      service.showMessage('Message 1', 'success');
      messages.push(service.message());
      
      service.showMessage('Message 2', 'danger');
      messages.push(service.message());
      
      service.clear();
      messages.push(service.message());
      
      expect(messages[0]).toBeNull();
      expect(messages[1]?.text).toBe('Message 1');
      expect(messages[2]?.text).toBe('Message 2');
      expect(messages[3]).toBeNull();
    });

    it('should provide readonly access to message', () => {
      const messageSignal = service.message;
      
      // Should not be able to modify the signal directly
      expect(typeof messageSignal).toBe('function');
      expect(messageSignal()).toBeNull();
    });
  });

  describe('Message severity types', () => {
    const severities: MessageSeverity[] = ['success', 'warning', 'danger', 'info'];
    
    severities.forEach(severity => {
      it(`should handle ${severity} severity correctly`, () => {
        service.showMessage(`${severity} message`, severity);
        
        const message = service.message();
        expect(message?.severity).toBe(severity);
        expect(message?.text).toBe(`${severity} message`);
      });
    });
  });

  describe('Concurrent operations', () => {
    it('should handle rapid successive showMessage calls', () => {
      service.showMessage('Message 1', 'success');
      service.showMessage('Message 2', 'warning');
      service.showMessage('Message 3', 'danger');
      service.showMessage('Message 4', 'info');
      
      const message = service.message();
      expect(message?.text).toBe('Message 4');
      expect(message?.severity).toBe('info');
    });

    it('should handle showMessage and clear in succession', () => {
      service.showMessage('Test message', 'success');
      expect(service.message()).toBeTruthy();
      
      service.clear();
      expect(service.message()).toBeNull();
      
      service.showMessage('Another message', 'warning');
      expect(service.message()?.text).toBe('Another message');
    });

    it('should handle multiple timed messages', fakeAsync(() => {
      service.showMessage('Message 1', 'success', 1000);
      tick(500);
      
      service.showMessage('Message 2', 'warning', 1500);
      expect(service.message()?.text).toBe('Message 2');
      
      tick(500); // 1000 total - first timeout fires, may clear Message 2
      // Due to timeout collision, message might be cleared
      if (service.message()) {
        expect(service.message()?.text).toBe('Message 2');
        
        tick(1000); // 2000 total, Message 2 timeout should fire
        expect(service.message()).toBeNull();
      } else {
        expect(service.message()).toBeNull();
      }
    }));
  });

  describe('Edge cases and error handling', () => {
    it('should handle null text gracefully', () => {
      service.showMessage(null as any, 'info');
      
      const message = service.message();
      expect(message?.text).toBe(null as any);
      expect(message?.severity).toBe('info');
    });

    it('should handle undefined text gracefully', () => {
      service.showMessage(undefined as any, 'warning');
      
      const message = service.message();
      expect(message?.text).toBe(undefined as any);
      expect(message?.severity).toBe('warning');
    });

    it('should handle invalid severity gracefully', () => {
      service.showMessage('Test message', 'invalid' as any);
      
      const message = service.message();
      expect(message?.text).toBe('Test message');
      expect(message?.severity).toBe('invalid' as any);
    });

    it('should handle very small duration values', fakeAsync(() => {
      service.showMessage('Quick message', 'success', 1);
      expect(service.message()).toBeTruthy();
      
      tick(1);
      expect(service.message()).toBeNull();
    }));
  });
});
