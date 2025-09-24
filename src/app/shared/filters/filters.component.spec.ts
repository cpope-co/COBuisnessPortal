import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ElementRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { FiltersComponent } from './filters.component';
import { FilterConfig } from '../table/table.component';

describe('FiltersComponent', () => {
  let component: FiltersComponent;
  let fixture: ComponentFixture<FiltersComponent>;
  let mockDialog: jasmine.SpyObj<MatDialog>;

  beforeEach(async () => {
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      imports: [FiltersComponent, NoopAnimationsModule],
      providers: [
        { provide: MatDialog, useValue: dialogSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FiltersComponent);
    component = fixture.componentInstance;
    mockDialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('component properties', () => {
    it('should initialize with correct default values', () => {
      expect(component.currentSearch).toBe('');
      expect(component['currentFilters']).toEqual({});
    });

    it('should have search output with correct alias', () => {
      const searchOutput = component.search;
      expect(searchOutput).toBeDefined();
    });

    it('should have filter output with correct alias', () => {
      const filterOutput = component.filter;
      expect(filterOutput).toBeDefined();
    });

    it('should accept filterConfigs input', () => {
      const testConfigs: FilterConfig[] = [
        { key: 'test1', label: 'Test 1', type: 'text' },
        { key: 'test2', label: 'Test 2', type: 'select', options: ['A', 'B'] }
      ];
      fixture.componentRef.setInput('filterConfigs', testConfigs);
      expect(component.filterConfigs()).toEqual(testConfigs);
    });
  });

  describe('onSearchChange', () => {
    let searchSpy: jasmine.Spy;

    beforeEach(() => {
      searchSpy = spyOn(component.search, 'emit');
    });

    it('should emit search value when input length is 4 or more characters', () => {
      const mockEvent = {
        target: { value: 'test' }
      } as unknown as KeyboardEvent;

      component.onSearchChange(mockEvent);

      expect(component.currentSearch).toBe('test');
      expect(searchSpy).toHaveBeenCalledWith('test');
    });

    it('should emit search value when input is empty (to clear)', () => {
      const mockEvent = {
        target: { value: '' }
      } as unknown as KeyboardEvent;

      component.onSearchChange(mockEvent);

      expect(component.currentSearch).toBe('');
      expect(searchSpy).toHaveBeenCalledWith('');
    });

    it('should not emit search value when input length is 1 character', () => {
      const mockEvent = {
        target: { value: 'a' }
      } as unknown as KeyboardEvent;

      component.onSearchChange(mockEvent);

      expect(component.currentSearch).toBe('a');
      expect(searchSpy).not.toHaveBeenCalled();
    });

    it('should not emit search value when input length is 2 characters', () => {
      const mockEvent = {
        target: { value: 'ab' }
      } as unknown as KeyboardEvent;

      component.onSearchChange(mockEvent);

      expect(component.currentSearch).toBe('ab');
      expect(searchSpy).not.toHaveBeenCalled();
    });

    it('should not emit search value when input length is 3 characters', () => {
      const mockEvent = {
        target: { value: 'abc' }
      } as unknown as KeyboardEvent;

      component.onSearchChange(mockEvent);

      expect(component.currentSearch).toBe('abc');
      expect(searchSpy).not.toHaveBeenCalled();
    });

    it('should handle null target gracefully', () => {
      const mockEvent = {
        target: null
      } as unknown as KeyboardEvent;

      expect(() => component.onSearchChange(mockEvent)).not.toThrow();
      expect(searchSpy).not.toHaveBeenCalled();
    });

    it('should handle undefined target gracefully', () => {
      const mockEvent = {} as KeyboardEvent;

      expect(() => component.onSearchChange(mockEvent)).not.toThrow();
      expect(searchSpy).not.toHaveBeenCalled();
    });

    it('should handle target without value property', () => {
      const mockEvent = {
        target: { tagName: 'DIV' }
      } as unknown as KeyboardEvent;

      expect(() => component.onSearchChange(mockEvent)).not.toThrow();
      expect(searchSpy).not.toHaveBeenCalled();
    });
  });

  describe('dialog management', () => {
    it('should open filters dialog with correct configuration', () => {
      const testConfigs: FilterConfig[] = [
        { key: 'test1', label: 'Test 1', type: 'text' }
      ];
      fixture.componentRef.setInput('filterConfigs', testConfigs);
      
      const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
      const afterClosedSubject = { subscribe: jasmine.createSpy().and.returnValue({ unsubscribe: jasmine.createSpy() }) };
      dialogRefSpy.afterClosed.and.returnValue(afterClosedSubject);
      mockDialog.open.and.returnValue(dialogRefSpy);

      component.openFiltersDialog();

      expect(mockDialog.open).toHaveBeenCalledWith(
        jasmine.any(Function), 
        jasmine.objectContaining({
          data: {
            filterConfigs: testConfigs,
            currentFilters: {}
          },
          width: '600px',
          maxWidth: '90vw',
          maxHeight: '80vh',
          autoFocus: false
        })
      );
    });
  });

  describe('filter logic', () => {
    it('should return true for hasActiveFilters when search is active', () => {
      component.currentSearch = 'test';
      expect(component.hasActiveFilters()).toBeTrue();
    });

    it('should return true for hasActiveFilters when advanced filters are active', () => {
      component['currentFilters'] = { key1: 'value1' };
      expect(component.hasActiveFilters()).toBeTrue();
    });

    it('should return false for hasActiveFilters when no filters are active', () => {
      component.currentSearch = '';
      component['currentFilters'] = {};
      expect(component.hasActiveFilters()).toBeFalse();
    });

    it('should return false for hasActiveFilters when filters have null/empty values', () => {
      component.currentSearch = '';
      component['currentFilters'] = { key1: null, key2: '', key3: undefined };
      expect(component.hasActiveFilters()).toBeFalse();
    });

    it('should return true for hasActiveAdvancedFilters when filters are active', () => {
      component['currentFilters'] = { key1: 'value1' };
      expect(component.hasActiveAdvancedFilters()).toBeTrue();
    });

    it('should return false for hasActiveAdvancedFilters when no filters are active', () => {
      component['currentFilters'] = { key1: null, key2: '', key3: undefined };
      expect(component.hasActiveAdvancedFilters()).toBeFalse();
    });

    it('should count active filters correctly', () => {
      component.currentSearch = 'test';
      component['currentFilters'] = { key1: 'value1', key2: null, key3: 'value3' };
      expect(component.getActiveFilterCount()).toBe(3); // search + 2 active filters
    });

    it('should count active advanced filters correctly', () => {
      component['currentFilters'] = { key1: 'value1', key2: null, key3: 'value3' };
      expect(component.getActiveAdvancedFilterCount()).toBe(2);
    });
  });

  describe('clearing filters', () => {
    beforeEach(() => {
      // Set up some filter configs for testing
      fixture.componentRef.setInput('filterConfigs', [
        { key: 'key1', label: 'Key 1', type: 'text' },
        { key: 'key2', label: 'Key 2', type: 'text' }
      ]);
    });

    it('should clear all filters and emit events', () => {
      const filtersChangedSpy = spyOn(component.filtersChanged, 'emit');
      const filtersClearedSpy = spyOn(component.filtersCleared, 'emit');
      const searchSpy = spyOn(component.search, 'emit');
      
      component['currentFilters'] = { key1: 'value1' };
      component.currentSearch = 'test';
      component.searchInputRef = {
        nativeElement: { value: 'test' }
      } as ElementRef<HTMLInputElement>;

      component.clearAllFilters();

      expect(component['currentFilters']).toEqual({});
      expect(component.currentSearch).toBe('');
      expect(component.searchInputRef.nativeElement.value).toBe('');
      expect(filtersChangedSpy).toHaveBeenCalledWith({ key: 'key1', value: null });
      expect(filtersChangedSpy).toHaveBeenCalledWith({ key: 'key2', value: null });
      expect(searchSpy).toHaveBeenCalledWith('');
      expect(filtersClearedSpy).toHaveBeenCalled();
    });

    it('should clear only advanced filters and emit events', () => {
      const filtersChangedSpy = spyOn(component.filtersChanged, 'emit');
      const filtersClearedSpy = spyOn(component.filtersCleared, 'emit');
      const searchSpy = spyOn(component.search, 'emit');
      
      component['currentFilters'] = { key1: 'value1' };
      component.currentSearch = 'test';

      component.clearAdvancedFilters();

      expect(component['currentFilters']).toEqual({});
      expect(component.currentSearch).toBe('test'); // Search should remain
      expect(filtersChangedSpy).toHaveBeenCalledWith({ key: 'key1', value: null });
      expect(filtersChangedSpy).toHaveBeenCalledWith({ key: 'key2', value: null });
      expect(searchSpy).not.toHaveBeenCalled(); // Search should not be cleared
      expect(filtersClearedSpy).toHaveBeenCalled();
    });

    it('should handle clearAllFilters without searchInputRef', () => {
      const filtersChangedSpy = spyOn(component.filtersChanged, 'emit');
      const filtersClearedSpy = spyOn(component.filtersCleared, 'emit');
      const searchSpy = spyOn(component.search, 'emit');
      
      component['currentFilters'] = { key1: 'value1' };
      component.currentSearch = 'test';
      component.searchInputRef = undefined as any;

      expect(() => component.clearAllFilters()).not.toThrow();
      expect(component['currentFilters']).toEqual({});
      expect(component.currentSearch).toBe('');
      expect(filtersChangedSpy).toHaveBeenCalled();
      expect(searchSpy).toHaveBeenCalledWith('');
      expect(filtersClearedSpy).toHaveBeenCalled();
    });
  });
});
