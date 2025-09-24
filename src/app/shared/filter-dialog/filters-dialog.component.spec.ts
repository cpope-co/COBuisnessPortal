import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { FiltersDialogComponent } from './filters-dialog.component';
import { FilterConfig } from '../table/table.component';

describe('FiltersDialogComponent', () => {
  let component: FiltersDialogComponent;
  let fixture: ComponentFixture<FiltersDialogComponent>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<FiltersDialogComponent>>;
  let mockDialogData: { filterConfigs: FilterConfig[], currentFilters: any };

  beforeEach(async () => {
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
    
    mockDialogData = {
      filterConfigs: [
        { key: 'test1', label: 'Test 1', type: 'text' },
        { key: 'test2', label: 'Test 2', type: 'select', options: ['A', 'B', 'C'] }
      ],
      currentFilters: { test1: 'existing value' }
    };

    await TestBed.configureTestingModule({
      imports: [FiltersDialogComponent, ReactiveFormsModule, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FiltersDialogComponent);
    component = fixture.componentInstance;
    mockDialogRef = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<FiltersDialogComponent>>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('form initialization', () => {
    it('should initialize form with filter configs and current values', () => {
      expect(component.filtersForm).toBeTruthy();
      expect(component.filtersForm.get('test1')?.value).toBe('existing value');
      expect(component.filtersForm.get('test2')?.value).toBe('');
    });

    it('should create form controls for all filter configs', () => {
      expect(component.filtersForm.contains('test1')).toBeTruthy();
      expect(component.filtersForm.contains('test2')).toBeTruthy();
    });
  });

  describe('dialog actions', () => {
    it('should close dialog with apply action and form values', () => {
      component.filtersForm.patchValue({ test1: 'new value', test2: 'B' });
      
      component.apply();

      expect(mockDialogRef.close).toHaveBeenCalledWith({
        action: 'apply',
        filters: { test1: 'new value', test2: 'B' }
      });
    });

    it('should reset form and close dialog with clear action', () => {
      spyOn(component.filtersForm, 'reset');
      
      component.clearFilters();

      expect(component.filtersForm.reset).toHaveBeenCalled();
      expect(mockDialogRef.close).toHaveBeenCalledWith({
        action: 'clear'
      });
    });

    it('should close dialog without data', () => {
      component.close();

      expect(mockDialogRef.close).toHaveBeenCalledWith();
    });
  });

  describe('helper methods', () => {
    it('should return formatted select options', () => {
      const options = ['Option1', 'Option2', 'Option3'];
      const result = component.getSelectOptions(options);

      expect(result).toEqual([
        { id: '', name: 'All' },
        { id: 'Option1', name: 'Option1' },
        { id: 'Option2', name: 'Option2' },
        { id: 'Option3', name: 'Option3' }
      ]);
    });

    it('should return empty object for dummy model', () => {
      expect(component.dummyModel).toEqual({});
    });
  });

  describe('data integration', () => {
    it('should use injected dialog data', () => {
      expect(component.data).toEqual(mockDialogData);
    });

    it('should handle empty current filters', () => {
      const testData = {
        filterConfigs: [{ key: 'test', label: 'Test', type: 'text' }],
        currentFilters: {}
      };

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [FiltersDialogComponent, ReactiveFormsModule, NoopAnimationsModule],
        providers: [
          { provide: MatDialogRef, useValue: jasmine.createSpyObj('MatDialogRef', ['close']) },
          { provide: MAT_DIALOG_DATA, useValue: testData }
        ]
      });

      const newFixture = TestBed.createComponent(FiltersDialogComponent);
      const newComponent = newFixture.componentInstance;
      newFixture.detectChanges();

      expect(newComponent.filtersForm.get('test')?.value).toBe('');
    });
  });
});