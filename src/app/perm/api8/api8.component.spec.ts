import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { computed, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

import { Api8Component } from './api8.component';
import { PermissionsService } from '../../services/permissions.service';

describe('Api8Component', () => {
  let component: Api8Component;
  let fixture: ComponentFixture<Api8Component>;
  let mockPermissionsService: jasmine.SpyObj<PermissionsService>;
  
  // Mock signals for permission testing
  let mockCanCreate = signal(false);
  let mockCanUpdate = signal(false);
  let mockCanDelete = signal(false);

  beforeEach(async () => {
    const permissionsSpy = jasmine.createSpyObj('PermissionsService', ['createResourcePermissionSignal']);

    await TestBed.configureTestingModule({
      imports: [Api8Component],
      providers: [
        { provide: PermissionsService, useValue: permissionsSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Api8Component);
    component = fixture.componentInstance;
    mockPermissionsService = TestBed.inject(PermissionsService) as jasmine.SpyObj<PermissionsService>;

    // Setup mock permission signals to return computed signals
    component.canCreate = computed(() => mockCanCreate());
    component.canUpdate = computed(() => mockCanUpdate());
    component.canDelete = computed(() => mockCanDelete());

    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should have correct resource name', () => {
      expect(component.RESOURCE_NAME).toBe('API8');
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
