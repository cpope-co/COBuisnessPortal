import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { PermissionsService } from '../../services/permissions.service';
import { Permission, UserPermissions } from '../../models/permissions.model';
import { Api4Component } from './api4.component';

describe('Api4Component', () => {
  let component: Api4Component;
  let fixture: ComponentFixture<Api4Component>;
  let mockPermissionsService: jasmine.SpyObj<PermissionsService>;

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

    await TestBed.configureTestingModule({
      imports: [Api4Component],
      providers: [
        { provide: PermissionsService, useValue: mockPermissionsService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Api4Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component Creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with correct RESOURCE_NAME', () => {
      expect(component.RESOURCE_NAME).toBe('API4');
    });

    it('should inject PermissionsService', () => {
      expect(component.permissionService).toBeTruthy();
      expect(component.permissionService).toBe(mockPermissionsService);
    });
  });

  describe('Permission Signals Initialization', () => {
    it('should create permission signals for CREATE, UPDATE, and DELETE', () => {
      expect(mockPermissionsService.createResourcePermissionSignal).toHaveBeenCalledWith('API4', Permission.CREATE);
      expect(mockPermissionsService.createResourcePermissionSignal).toHaveBeenCalledWith('API4', Permission.UPDATE);
      expect(mockPermissionsService.createResourcePermissionSignal).toHaveBeenCalledWith('API4', Permission.DELETE);
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

    it('should use correct resource name for permission signals', () => {
      const calls = mockPermissionsService.createResourcePermissionSignal.calls.all();
      expect(calls.every(call => call.args[0] === 'API4')).toBe(true);
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

    it('should use correct resource name for permission checking', () => {
      const createCall = mockPermissionsService.createResourcePermissionSignal.calls.all()
        .find(call => call.args[1] === Permission.CREATE);
      const updateCall = mockPermissionsService.createResourcePermissionSignal.calls.all()
        .find(call => call.args[1] === Permission.UPDATE);
      const deleteCall = mockPermissionsService.createResourcePermissionSignal.calls.all()
        .find(call => call.args[1] === Permission.DELETE);

      expect(createCall?.args[0]).toBe('API4');
      expect(updateCall?.args[0]).toBe('API4');
      expect(deleteCall?.args[0]).toBe('API4');
    });
  });

  describe('Permission System Integration', () => {
    it('should call PermissionsService methods with correct parameters', () => {
      expect(mockPermissionsService.createResourcePermissionSignal).toHaveBeenCalledWith('API4', Permission.CREATE);
      expect(mockPermissionsService.createResourcePermissionSignal).toHaveBeenCalledWith('API4', Permission.UPDATE);
      expect(mockPermissionsService.createResourcePermissionSignal).toHaveBeenCalledWith('API4', Permission.DELETE);
    });

    it('should handle permission service dependency injection', () => {
      expect(component.permissionService).toBe(mockPermissionsService);
    });
  });

  describe('Error Handling', () => {
    it('should handle permissions service errors gracefully', () => {
      mockPermissionsService.createResourcePermissionSignal.and.throwError('Service error');
      
      expect(() => {
        TestBed.createComponent(Api4Component);
      }).toThrow();
    });
  });
});
