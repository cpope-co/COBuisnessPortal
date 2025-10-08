import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { PermissionsService } from '../../services/permissions.service';
import { Permission, UserPermissions } from '../../models/permissions.model';
import { By } from '@angular/platform-browser';
import { computed } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

import { Api3Component } from './api3.component';
describe('Api3Component', () => {
  let component: Api3Component;
  let fixture: ComponentFixture<Api3Component>;
  let mockPermissionsService: jasmine.SpyObj<PermissionsService>;
  
  // Mock signals for permission testing
  let mockCanCreate = signal(false);
  let mockCanUpdate = signal(false);
  let mockCanDelete = signal(false);

  beforeEach(async () => {
    // Create spy object for PermissionsService
    mockPermissionsService = jasmine.createSpyObj('PermissionsService', [
      'createResourcePermissionSignal',
      'hasResourcePermission',
      'setUserPermissions',
      'clearPermissions'
    ]);

    // Mock the signal return values
    const mockCanCreateSignal = signal(false);
    const mockCanUpdateSignal = signal(false);
    const mockCanDeleteSignal = signal(false);

    mockPermissionsService.createResourcePermissionSignal.and.callFake((resource: string, permission: Permission) => {
      if (permission === Permission.CREATE) return mockCanCreateSignal;
      if (permission === Permission.UPDATE) return mockCanUpdateSignal;
      if (permission === Permission.DELETE) return mockCanDeleteSignal;
      return signal(false);
    });

    const permissionsSpy = jasmine.createSpyObj('PermissionsService', ['createResourcePermissionSignal']);

    await TestBed.configureTestingModule({
      imports: [Api3Component],
      providers: [
        { provide: PermissionsService, useValue: mockPermissionsService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Api3Component);
    component = fixture.componentInstance;
    mockPermissionsService = TestBed.inject(PermissionsService) as jasmine.SpyObj<PermissionsService>;

    // Setup mock permission signals to return computed signals
    component.canCreate = computed(() => mockCanCreate());
    component.canUpdate = computed(() => mockCanUpdate());
    component.canDelete = computed(() => mockCanDelete());

    fixture.detectChanges();
  });

  describe('Component Creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with RESOURCE_NAME', () => {
      expect(component.RESOURCE_NAME).toBe('API3');
    });

    it('should inject PermissionsService', () => {
      expect(component.permissionService).toBeTruthy();
      expect(component.permissionService).toBe(mockPermissionsService);
    });
  });

  describe('Permission Signals Initialization', () => {
    it('should create permission signals for CREATE, UPDATE, and DELETE', () => {
      expect(mockPermissionsService.createResourcePermissionSignal).toHaveBeenCalledWith('API3', Permission.CREATE);
      expect(mockPermissionsService.createResourcePermissionSignal).toHaveBeenCalledWith('API3', Permission.UPDATE);
      expect(mockPermissionsService.createResourcePermissionSignal).toHaveBeenCalledWith('API3', Permission.DELETE);
      expect(mockPermissionsService.createResourcePermissionSignal).toHaveBeenCalledTimes(3);
    });

    it('should initialize canCreate signal', () => {
      expect(component.canCreate).toBeTruthy();
      expect(typeof component.canCreate).toBe('function');
    });

    it('should initialize canUpdate signal', () => {
      expect(component.canUpdate).toBeTruthy();
      expect(typeof component.canUpdate).toBe('function');
    });

    it('should initialize canDelete signal', () => {
      expect(component.canDelete).toBeTruthy();
      expect(typeof component.canDelete).toBe('function');
    });
  });

  describe('Permission Signal Values', () => {
    it('should return false by default for canCreate', () => {
      expect(component.canCreate()).toBe(false);
    });

    it('should return false by default for canUpdate', () => {
      expect(component.canUpdate()).toBe(false);
    });

    it('should return false by default for canDelete', () => {
      expect(component.canDelete()).toBe(false);
    });

    it('should use resource name for permission signals', () => {
      // Verify the service was called with the resource name
      const calls = mockPermissionsService.createResourcePermissionSignal.calls.all();
      expect(calls.every(call => call.args[0] === 'API3')).toBe(true);
    });
  });

  describe('Action Methods', () => {
    describe('create()', () => {
      it('should throw "Method not implemented." error', () => {
        expect(() => component.create()).toThrowError('Method not implemented.');
      });

      it('should be a function', () => {
        expect(typeof component.create).toBe('function');
      });
    });

    describe('update()', () => {
      it('should throw "Method not implemented." error', () => {
        expect(() => component.update()).toThrowError('Method not implemented.');
      });

      it('should be a function', () => {
        expect(typeof component.update).toBe('function');
      });
    });

    describe('delete()', () => {
      it('should throw "Method not implemented." error', () => {
        expect(() => component.delete()).toThrowError('Method not implemented.');
      });

      it('should be a function', () => {
        expect(typeof component.delete).toBe('function');
      });
    });
  });

  describe('Component Integration', () => {
    it('should have all required properties defined', () => {
      expect(component.RESOURCE_NAME).toBeDefined();
      expect(component.permissionService).toBeDefined();
      expect(component.canCreate).toBeDefined();
      expect(component.canUpdate).toBeDefined();
      expect(component.canDelete).toBeDefined();
    });

    it('should use resource name for permission checking', () => {
      const createCall = mockPermissionsService.createResourcePermissionSignal.calls.all()
        .find(call => call.args[1] === Permission.CREATE);
      const updateCall = mockPermissionsService.createResourcePermissionSignal.calls.all()
        .find(call => call.args[1] === Permission.UPDATE);
      const deleteCall = mockPermissionsService.createResourcePermissionSignal.calls.all()
        .find(call => call.args[1] === Permission.DELETE);

      // Verify resource names are used correctly
      expect(createCall?.args[0]).toBe('API3');
      expect(updateCall?.args[0]).toBe('API3');
      expect(deleteCall?.args[0]).toBe('API3');
    });
  });

  describe('Permission System Integration', () => {
    it('should call PermissionsService methods with correct parameters', () => {
      expect(mockPermissionsService.createResourcePermissionSignal).toHaveBeenCalledWith('API3', Permission.CREATE);
      expect(mockPermissionsService.createResourcePermissionSignal).toHaveBeenCalledWith('API3', Permission.UPDATE);
      expect(mockPermissionsService.createResourcePermissionSignal).toHaveBeenCalledWith('API3', Permission.DELETE);
    });

    it('should handle permission service dependency injection', () => {
      expect(component.permissionService).toBe(mockPermissionsService);
    });
  });

  describe('Error Handling', () => {
    it('should handle permissions service errors gracefully', () => {
      // Create a new test module with a failing service
      mockPermissionsService.createResourcePermissionSignal.and.throwError('Service error');
      
      expect(() => {
        TestBed.createComponent(Api3Component);
      }).toThrow();
    });
  });

  describe('Bug Documentation', () => {
    it('should use correct resource name for the API3 component', () => {
      // Verify the component uses the correct resource name
      expect(component.RESOURCE_NAME).toBe('API3');
    });
  });
  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should have correct resource name', () => {
      expect(component.RESOURCE_NAME).toBe('API3');
    });

    it('should inject permissions service', () => {
      expect(component.permissionService).toBeDefined();
    });
  });

  describe('Template Rendering', () => {
    it('should render mat-card', () => {
      const cardElement = fixture.debugElement.query(By.css('mat-card'));
      expect(cardElement).toBeTruthy();
    });

    it('should show Create button when canCreate is true', () => {
      mockCanCreate.set(true);
      fixture.detectChanges();

      const buttons = fixture.debugElement.queryAll(By.css('button'));
      const createButton = buttons.find(btn => btn.nativeElement.textContent?.includes('Create New'));
      expect(createButton).toBeTruthy();
    });

    it('should hide Create button when canCreate is false', () => {
      mockCanCreate.set(false);
      fixture.detectChanges();

      const buttons = fixture.debugElement.queryAll(By.css('button'));
      const createButton = buttons.find(btn => btn.nativeElement.textContent?.includes('Create New'));
      expect(createButton).toBeFalsy();
    });

    it('should show Update button when canUpdate is true', () => {
      mockCanUpdate.set(true);
      fixture.detectChanges();

      const buttons = fixture.debugElement.queryAll(By.css('button'));
      const updateButton = buttons.find(btn => btn.nativeElement.textContent?.includes('Update'));
      expect(updateButton).toBeTruthy();
    });

    it('should show Delete button when canDelete is true', () => {
      mockCanDelete.set(true);
      fixture.detectChanges();

      const buttons = fixture.debugElement.queryAll(By.css('button'));
      const deleteButton = buttons.find(btn => btn.nativeElement.textContent?.includes('Delete'));
      expect(deleteButton).toBeTruthy();
    });

    it('should show multiple buttons when multiple permissions are true', () => {
      mockCanCreate.set(true);
      mockCanUpdate.set(true);
      mockCanDelete.set(true);
      fixture.detectChanges();

      const buttons = fixture.debugElement.queryAll(By.css('button'));
      expect(buttons.length).toBe(3);
    });
  });

  describe('Component Methods', () => {
    it('should have create method that throws error', () => {
      expect(() => component.create()).toThrowError('Method not implemented.');
    });

    it('should have update method that throws error', () => {
      expect(() => component.update()).toThrowError('Method not implemented.');
    });

    it('should have delete method that throws error', () => {
      expect(() => component.delete()).toThrowError('Method not implemented.');
    });
  });

  describe('Button Click Events', () => {
    it('should call create() when Create button is clicked', () => {
      mockCanCreate.set(true);
      fixture.detectChanges();
      
      spyOn(component, 'create').and.returnValue();
      
      const compiled = fixture.nativeElement;
      const buttons = compiled.querySelectorAll('button');
      const createButton = Array.from(buttons as NodeListOf<HTMLButtonElement>).find((btn: HTMLButtonElement) => 
        btn.textContent?.includes('Create New')
      );
      
      expect(createButton).toBeTruthy();
      createButton?.click();
      expect(component.create).toHaveBeenCalled();
    });

    it('should call delete() when Delete button is clicked', () => {
      mockCanDelete.set(true);
      fixture.detectChanges();
      
      spyOn(component, 'delete').and.returnValue();
      
      const compiled = fixture.nativeElement;
      const buttons = compiled.querySelectorAll('button');
      const deleteButton = Array.from(buttons as NodeListOf<HTMLButtonElement>).find((btn: HTMLButtonElement) => 
        btn.textContent?.includes('Delete')
      );
      
      expect(deleteButton).toBeTruthy();
      deleteButton?.click();
      expect(component.delete).toHaveBeenCalled();
    });
  });

  describe('Permission Signal Integration', () => {
    it('should respond to permission signal changes', () => {
      // Test CREATE permission
      mockCanCreate.set(true);
      fixture.detectChanges();
      expect(component.canCreate()).toBe(true);

      mockCanCreate.set(false);
      fixture.detectChanges();
      expect(component.canCreate()).toBe(false);

      // Test UPDATE permission
      mockCanUpdate.set(true);
      fixture.detectChanges();
      expect(component.canUpdate()).toBe(true);

      // Test DELETE permission
      mockCanDelete.set(true);
      fixture.detectChanges();
      expect(component.canDelete()).toBe(true);
    });

    it('should use computed signals for reactive permission checking', () => {
      expect(typeof component.canCreate).toBe('function');
      expect(typeof component.canUpdate).toBe('function');
      expect(typeof component.canDelete).toBe('function');
    });
  });
});
