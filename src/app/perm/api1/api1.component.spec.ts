import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal, computed } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { Api1Component } from './api1.component';
import { PermissionsService } from '../../services/permissions.service';
import { Permission } from '../../models/permissions.model';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

describe('Api1Component', () => {
  let component: Api1Component;
  let fixture: ComponentFixture<Api1Component>;
  let mockPermissionsService: jasmine.SpyObj<PermissionsService>;

  // Mock permission signals
  const mockCanCreate = signal(true);
  const mockCanUpdate = signal(false);
  const mockCanDelete = signal(true);

  beforeEach(async () => {
    const permissionsServiceSpy = jasmine.createSpyObj('PermissionsService', [
      'createResourcePermissionSignal'
    ]);

    // Set up the spy to return the mock signals
    permissionsServiceSpy.createResourcePermissionSignal.and.callFake((resource: string, permission: Permission) => {
      switch (permission) {
        case Permission.CREATE:
          return computed(() => mockCanCreate());
        case Permission.UPDATE:
          return computed(() => mockCanUpdate());
        case Permission.DELETE:
          return computed(() => mockCanDelete());
        default:
          return computed(() => false);
      }
    });

    await TestBed.configureTestingModule({
      imports: [
        Api1Component,
        MatButtonModule,
        MatCardModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: PermissionsService, useValue: permissionsServiceSpy }
      ]
    })
    .compileComponents();

    mockPermissionsService = TestBed.inject(PermissionsService) as jasmine.SpyObj<PermissionsService>;
    fixture = TestBed.createComponent(Api1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should have correct resource name', () => {
      expect(component.RESOURCE_NAME).toBe('API1');
    });

    it('should inject permissions service', () => {
      expect(component.permissionService).toBe(mockPermissionsService);
    });
  });

  describe('Permission Signals', () => {
    it('should create canCreate signal with CREATE permission', () => {
      expect(mockPermissionsService.createResourcePermissionSignal)
        .toHaveBeenCalledWith('API1', Permission.CREATE);
      expect(component.canCreate()).toBe(true);
    });

    it('should create canUpdate signal with UPDATE permission', () => {
      expect(mockPermissionsService.createResourcePermissionSignal)
        .toHaveBeenCalledWith('API1', Permission.UPDATE);
      expect(component.canUpdate()).toBe(false);
    });

    it('should create canDelete signal with DELETE permission', () => {
      expect(mockPermissionsService.createResourcePermissionSignal)
        .toHaveBeenCalledWith('API1', Permission.DELETE);
      expect(component.canDelete()).toBe(true);
    });

    it('should update when permission signals change', () => {
      // Initially true
      expect(component.canCreate()).toBe(true);
      
      // Change the signal
      mockCanCreate.set(false);
      fixture.detectChanges();
      
      expect(component.canCreate()).toBe(false);
    });
  });

  describe('CRUD Operations', () => {
    it('should throw error when create() is called', () => {
      expect(() => component.create()).toThrowError('Method not implemented.');
    });

    it('should throw error when update() is called', () => {
      expect(() => component.update()).toThrowError('Method not implemented.');
    });

    it('should throw error when delete() is called', () => {
      expect(() => component.delete()).toThrowError('Method not implemented.');
    });
  });

  describe('Template Rendering', () => {
    it('should display the correct title', () => {
      const compiled = fixture.nativeElement;
      const title = compiled.querySelector('mat-card-title');
      expect(title.textContent).toContain('API 1 Component');
    });

    it('should display content description', () => {
      const compiled = fixture.nativeElement;
      const content = compiled.querySelector('mat-card-content p');
      expect(content.textContent).toContain('This is the API 1 component content.');
    });

    it('should show Create button when canCreate is true', () => {
      mockCanCreate.set(true);
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const buttons = compiled.querySelectorAll('button');
      const createButton = Array.from(buttons as NodeListOf<HTMLButtonElement>).find((btn: HTMLButtonElement) => 
        btn.textContent?.includes('Create New')
      );
      
      expect(createButton).toBeTruthy();
    });

    it('should hide Create button when canCreate is false', () => {
      mockCanCreate.set(false);
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const buttons = compiled.querySelectorAll('button');
      const createButton = Array.from(buttons as NodeListOf<HTMLButtonElement>).find((btn: HTMLButtonElement) => 
        btn.textContent?.includes('Create New')
      );
      
      expect(createButton).toBeFalsy();
    });

    it('should show Delete button when canDelete is true', () => {
      mockCanDelete.set(true);
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const buttons = compiled.querySelectorAll('button');
      const deleteButton = Array.from(buttons as NodeListOf<HTMLButtonElement>).find((btn: HTMLButtonElement) => 
        btn.textContent?.includes('Delete')
      );
      
      expect(deleteButton).toBeTruthy();
    });

    it('should hide Update button when canUpdate is false', () => {
      mockCanUpdate.set(false);
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const buttons = compiled.querySelectorAll('button');
      const updateButton = Array.from(buttons as NodeListOf<HTMLButtonElement>).find((btn: HTMLButtonElement) => 
        btn.textContent?.includes('Update')
      );
      
      expect(updateButton).toBeFalsy();
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

  describe('Permissions Integration', () => {
    it('should call createResourcePermissionSignal for each permission type', () => {
      expect(mockPermissionsService.createResourcePermissionSignal).toHaveBeenCalledTimes(3);
      expect(mockPermissionsService.createResourcePermissionSignal).toHaveBeenCalledWith('API1', Permission.CREATE);
      expect(mockPermissionsService.createResourcePermissionSignal).toHaveBeenCalledWith('API1', Permission.UPDATE);
      expect(mockPermissionsService.createResourcePermissionSignal).toHaveBeenCalledWith('API1', Permission.DELETE);
    });

    it('should react to permission changes', () => {
      // Test CREATE permission change
      expect(component.canCreate()).toBe(true);
      mockCanCreate.set(false);
      expect(component.canCreate()).toBe(false);
      
      // Test DELETE permission change
      expect(component.canDelete()).toBe(true);
      mockCanDelete.set(false);
      expect(component.canDelete()).toBe(false);
      
      // Test UPDATE permission change  
      expect(component.canUpdate()).toBe(false);
      mockCanUpdate.set(true);
      expect(component.canUpdate()).toBe(true);
    });
  });
});
