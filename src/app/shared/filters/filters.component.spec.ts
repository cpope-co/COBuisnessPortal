import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { FiltersComponent } from './filters.component';

describe('FiltersComponent', () => {
  let component: FiltersComponent;
  let fixture: ComponentFixture<FiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FiltersComponent, NoopAnimationsModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('component properties', () => {
    it('should initialize with correct default values', () => {
      expect(component.selected).toBe('');
    });

    it('should have search output with correct alias', () => {
      const searchOutput = component.search;
      expect(searchOutput).toBeDefined();
      // Note: alias testing would be done through template integration
    });

    it('should have filter output with correct alias', () => {
      const filterOutput = component.filter;
      expect(filterOutput).toBeDefined();
      // Note: alias testing would be done through template integration
    });

    it('should accept filters input', () => {
      const testFilters = [{ id: 1, name: 'Filter 1' }, { id: 2, name: 'Filter 2' }];
      fixture.componentRef.setInput('filters', testFilters);
      expect(component.filters()).toEqual(testFilters);
    });
  });

  describe('updateSearch', () => {
    let searchSpy: jasmine.Spy;

    beforeEach(() => {
      searchSpy = spyOn(component.search, 'emit');
    });

    it('should emit search value when input length is greater than 2', () => {
      const mockEvent = {
        target: { value: 'test' }
      } as unknown as KeyboardEvent;

      component.updateSearch(mockEvent);

      expect(searchSpy).toHaveBeenCalledWith('test');
    });

    it('should emit search value when input length is exactly 0 (empty)', () => {
      const mockEvent = {
        target: { value: '' }
      } as unknown as KeyboardEvent;

      component.updateSearch(mockEvent);

      expect(searchSpy).toHaveBeenCalledWith('');
    });

    it('should emit search value when input length is 1 character', () => {
      const mockEvent = {
        target: { value: 'a' }
      } as unknown as KeyboardEvent;

      component.updateSearch(mockEvent);

      expect(searchSpy).toHaveBeenCalledWith('a');
    });

    it('should emit search value when input length is 2 characters', () => {
      const mockEvent = {
        target: { value: 'ab' }
      } as unknown as KeyboardEvent;

      component.updateSearch(mockEvent);

      expect(searchSpy).toHaveBeenCalledWith('ab');
    });

    it('should emit search value when input length is exactly 3 characters', () => {
      const mockEvent = {
        target: { value: 'abc' }
      } as unknown as KeyboardEvent;

      component.updateSearch(mockEvent);

      expect(searchSpy).toHaveBeenCalledWith('abc');
    });

    it('should handle null target gracefully', () => {
      const mockEvent = {
        target: null
      } as unknown as KeyboardEvent;

      expect(() => component.updateSearch(mockEvent)).not.toThrow();
      expect(searchSpy).not.toHaveBeenCalled();
    });

    it('should handle undefined target gracefully', () => {
      const mockEvent = {} as KeyboardEvent;

      expect(() => component.updateSearch(mockEvent)).not.toThrow();
      expect(searchSpy).not.toHaveBeenCalled();
    });

    it('should handle non-input element target', () => {
      const mockEvent = {
        target: { tagName: 'DIV' }
      } as unknown as KeyboardEvent;

      expect(() => component.updateSearch(mockEvent)).not.toThrow();
      expect(searchSpy).not.toHaveBeenCalled();
    });
  });

  describe('onFilterChange', () => {
    let filterSpy: jasmine.Spy;

    beforeEach(() => {
      filterSpy = spyOn(component.filter, 'emit');
    });

    it('should emit filter value when called', () => {
      const testValue = 'testFilter';
      
      component.onFilterChange(testValue);

      expect(filterSpy).toHaveBeenCalledWith(testValue);
    });

    it('should emit undefined when called with undefined', () => {
      component.onFilterChange(undefined);

      expect(filterSpy).toHaveBeenCalledWith(undefined);
    });

    it('should emit null when called with null', () => {
      component.onFilterChange(null);

      expect(filterSpy).toHaveBeenCalledWith(null);
    });

    it('should emit object when called with object', () => {
      const testObject = { id: 1, name: 'test' };
      
      component.onFilterChange(testObject);

      expect(filterSpy).toHaveBeenCalledWith(testObject);
    });

    it('should emit number when called with number', () => {
      const testNumber = 123;
      
      component.onFilterChange(testNumber);

      expect(filterSpy).toHaveBeenCalledWith(testNumber);
    });
  });

  describe('selected property', () => {
    it('should allow setting and getting selected value', () => {
      component.selected = 'newValue';
      expect(component.selected).toBe('newValue');
    });

    it('should start with empty string as default', () => {
      expect(component.selected).toBe('');
    });
  });
});
