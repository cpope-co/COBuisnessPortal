import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, FormControl } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSelectionListChange } from '@angular/material/list';

import { PickListComponent } from './pick-list.component';
import { FormHandlingService } from '../../services/form-handling.service';

describe('PickListComponent', () => {
  let component: PickListComponent;
  let fixture: ComponentFixture<PickListComponent>;
  let mockFormHandlingService: jasmine.SpyObj<FormHandlingService>;

  const mockSourceOptions = [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
    { id: 3, name: 'Item 3' }
  ];

  const mockFormGroup = new FormGroup({
    testControl: new FormControl([])
  });

  beforeEach(async () => {
    mockFormHandlingService = jasmine.createSpyObj('FormHandlingService', ['getErrorMessages']);
    mockFormHandlingService.getErrorMessages.and.returnValue('');

    await TestBed.configureTestingModule({
      imports: [PickListComponent, BrowserAnimationsModule],
      providers: [
        { provide: FormHandlingService, useValue: mockFormHandlingService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PickListComponent);
    component = fixture.componentInstance;
    
    // Set required inputs
    fixture.componentRef.setInput('sourceOptions', mockSourceOptions);
    fixture.componentRef.setInput('sourceLabel', 'Source Items');
    fixture.componentRef.setInput('targetLabel', 'Selected Items');
    fixture.componentRef.setInput('formGroup', mockFormGroup);
    fixture.componentRef.setInput('formControlName', 'testControl');
    fixture.componentRef.setInput('model', {});
    fixture.componentRef.setInput('primaryField', 'primaryId');
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ControlValueAccessor implementation', () => {
    it('should write value with items and primary', () => {
      const testValue = {
        items: [mockSourceOptions[0], mockSourceOptions[1]],
        primary: mockSourceOptions[0]
      };

      component.writeValue(testValue);

      expect(component.selectedItems).toEqual(testValue.items);
      expect(component.primaryItem).toEqual(testValue.primary);
    });

    it('should write value with null', () => {
      component.writeValue(null);

      expect(component.selectedItems).toEqual([]);
      expect(component.primaryItem).toBeNull();
    });

    it('should write value with empty object', () => {
      component.writeValue({});

      expect(component.selectedItems).toEqual([]);
      expect(component.primaryItem).toBeNull();
    });

    it('should register onChange function', () => {
      const mockOnChange = jasmine.createSpy('onChange');
      
      component.registerOnChange(mockOnChange);
      
      // Trigger change
      component.selectedItems = [mockSourceOptions[0]];
      component['updateFormValue']();
      
      expect(mockOnChange).toHaveBeenCalled();
    });

    it('should register onTouched function', () => {
      const mockOnTouched = jasmine.createSpy('onTouched');
      
      component.registerOnTouched(mockOnTouched);
      
      // Trigger touched
      component['updateFormValue']();
      
      expect(mockOnTouched).toHaveBeenCalled();
    });
  });

  describe('availableItems getter', () => {
    it('should return all source options when no items selected', () => {
      component.selectedItems = [];
      
      expect(component.availableItems).toEqual(mockSourceOptions);
    });

    it('should filter out selected items', () => {
      component.selectedItems = [mockSourceOptions[0]];
      
      const available = component.availableItems;
      
      expect(available).toEqual([mockSourceOptions[1], mockSourceOptions[2]]);
      expect(available).not.toContain(mockSourceOptions[0]);
    });
  });

  describe('addItems', () => {
    it('should add selected source items to target', () => {
      component.selectedSourceItems = [mockSourceOptions[0], mockSourceOptions[1]];
      spyOn(component as any, 'updateFormValue');

      component.addItems();

      expect(component.selectedItems).toEqual([mockSourceOptions[0], mockSourceOptions[1]]);
      expect(component.selectedSourceItems).toEqual([]);
      expect(component['updateFormValue']).toHaveBeenCalled();
    });

    it('should not add items when none selected in source', () => {
      component.selectedSourceItems = [];
      const initialSelectedItems = [...component.selectedItems];
      spyOn(component as any, 'updateFormValue');

      component.addItems();

      expect(component.selectedItems).toEqual(initialSelectedItems);
      expect(component['updateFormValue']).not.toHaveBeenCalled();
    });
  });

  describe('removeItems', () => {
    beforeEach(() => {
      component.selectedItems = [mockSourceOptions[0], mockSourceOptions[1]];
      component.primaryItem = mockSourceOptions[0];
    });

    it('should remove selected target items', () => {
      component.selectedTargetItems = [mockSourceOptions[1]];
      spyOn(component as any, 'updateFormValue');

      component.removeItems();

      expect(component.selectedItems).toEqual([mockSourceOptions[0]]);
      expect(component.selectedTargetItems).toEqual([]);
      expect(component['updateFormValue']).toHaveBeenCalled();
    });

    it('should clear primary when removing primary item', () => {
      component.selectedTargetItems = [mockSourceOptions[0]]; // Primary item
      spyOn(component as any, 'updateFormValue');

      component.removeItems();

      expect(component.primaryItem).toBeNull();
      expect(component.selectedItems).toEqual([mockSourceOptions[1]]);
      expect(component['updateFormValue']).toHaveBeenCalled();
    });

    it('should not remove items when none selected in target', () => {
      component.selectedTargetItems = [];
      const initialSelectedItems = [...component.selectedItems];
      spyOn(component as any, 'updateFormValue');

      component.removeItems();

      expect(component.selectedItems).toEqual(initialSelectedItems);
      expect(component['updateFormValue']).not.toHaveBeenCalled();
    });
  });

  describe('setPrimary', () => {
    beforeEach(() => {
      component.selectedItems = [mockSourceOptions[0], mockSourceOptions[1]];
    });

    it('should set primary when one item selected and no current primary', () => {
      component.selectedTargetItems = [mockSourceOptions[0]];
      component.primaryItem = null;
      spyOn(component as any, 'updateFormValue');

      component.setPrimary();

      expect(component.primaryItem).toEqual(mockSourceOptions[0]);
      expect(component['updateFormValue']).toHaveBeenCalled();
    });

    it('should remove primary when selected item is already primary', () => {
      component.selectedTargetItems = [mockSourceOptions[0]];
      component.primaryItem = mockSourceOptions[0];
      spyOn(component as any, 'updateFormValue');

      component.setPrimary();

      expect(component.primaryItem).toBeNull();
      expect(component['updateFormValue']).toHaveBeenCalled();
    });

    it('should change primary when different item selected', () => {
      component.selectedTargetItems = [mockSourceOptions[1]];
      component.primaryItem = mockSourceOptions[0];
      spyOn(component as any, 'updateFormValue');

      component.setPrimary();

      expect(component.primaryItem).toEqual(mockSourceOptions[1]);
      expect(component['updateFormValue']).toHaveBeenCalled();
    });

    it('should not set primary when multiple items selected', () => {
      component.selectedTargetItems = [mockSourceOptions[0], mockSourceOptions[1]];
      component.primaryItem = null;
      spyOn(component as any, 'updateFormValue');

      component.setPrimary();

      expect(component.primaryItem).toBeNull();
      expect(component['updateFormValue']).not.toHaveBeenCalled();
    });

    it('should not set primary when no items selected', () => {
      component.selectedTargetItems = [];
      component.primaryItem = null;
      spyOn(component as any, 'updateFormValue');

      component.setPrimary();

      expect(component.primaryItem).toBeNull();
      expect(component['updateFormValue']).not.toHaveBeenCalled();
    });
  });

  describe('selection change handlers', () => {
    it('should handle source selection change', () => {
      const mockEvent = {
        source: {
          selectedOptions: {
            selected: [
              { value: mockSourceOptions[0] },
              { value: mockSourceOptions[1] }
            ]
          }
        }
      } as MatSelectionListChange;

      component.onSourceSelectionChange(mockEvent);

      expect(component.selectedSourceItems).toEqual([mockSourceOptions[0], mockSourceOptions[1]]);
    });

    it('should handle target selection change', () => {
      const mockEvent = {
        source: {
          selectedOptions: {
            selected: [
              { value: mockSourceOptions[0] }
            ]
          }
        }
      } as MatSelectionListChange;

      component.onTargetSelectionChange(mockEvent);

      expect(component.selectedTargetItems).toEqual([mockSourceOptions[0]]);
    });
  });

  describe('compareItems', () => {
    it('should compare items by id when both have id', () => {
      const item1 = { id: 1, name: 'Item 1' };
      const item2 = { id: 1, name: 'Different Name' };
      const item3 = { id: 2, name: 'Item 2' };

      expect(component['compareItems'](item1, item2)).toBeTruthy();
      expect(component['compareItems'](item1, item3)).toBeFalsy();
    });

    it('should compare items directly when no id', () => {
      const item1 = 'item1';
      const item2 = 'item1';
      const item3 = 'item2';

      expect(component['compareItems'](item1, item2)).toBeTruthy();
      expect(component['compareItems'](item1, item3)).toBeFalsy();
    });

    it('should return false for null/undefined items', () => {
      expect(component['compareItems'](null, mockSourceOptions[0])).toBeFalsy();
      expect(component['compareItems'](mockSourceOptions[0], null)).toBeFalsy();
      expect(component['compareItems'](undefined, mockSourceOptions[0])).toBeFalsy();
      expect(component['compareItems'](null, null)).toBeFalsy();
    });
  });

  describe('utility methods', () => {
    it('should get error message from form handling service', () => {
      const errorMessage = 'Test error message';
      mockFormHandlingService.getErrorMessages.and.returnValue(errorMessage);

      const result = component.getErrorMessage('testKey');

      expect(result).toBe(errorMessage);
      expect(mockFormHandlingService.getErrorMessages).toHaveBeenCalledWith(
        mockFormGroup,
        'testControl',
        {}
      );
    });

    it('should check if item is primary', () => {
      component.primaryItem = mockSourceOptions[0];

      expect(component.isPrimary(mockSourceOptions[0])).toBeTruthy();
      expect(component.isPrimary(mockSourceOptions[1])).toBeFalsy();
    });

    it('should handle null primary item in isPrimary', () => {
      component.primaryItem = null;

      expect(component.isPrimary(mockSourceOptions[0])).toBeFalsy();
    });

    it('should get correct primary button text', () => {
      // No selection
      component.selectedTargetItems = [];
      expect(component.getPrimaryButtonText()).toBe('Set Primary');

      // Multiple selections
      component.selectedTargetItems = [mockSourceOptions[0], mockSourceOptions[1]];
      expect(component.getPrimaryButtonText()).toBe('Set Primary');

      // Single selection, not primary
      component.selectedTargetItems = [mockSourceOptions[0]];
      component.primaryItem = null;
      expect(component.getPrimaryButtonText()).toBe('Set Primary');

      // Single selection, is primary
      component.selectedTargetItems = [mockSourceOptions[0]];
      component.primaryItem = mockSourceOptions[0];
      expect(component.getPrimaryButtonText()).toBe('Remove Primary');
    });

    it('should track items by id or item itself', () => {
      const itemWithId = { id: 1, name: 'Item 1' };
      const itemWithoutId = 'simple item';

      expect(component.trackByFn(0, itemWithId)).toBe(1);
      expect(component.trackByFn(0, itemWithoutId)).toBe('simple item');
    });
  });

  describe('updateFormValue', () => {
    it('should call onChange and onTouched with correct value', () => {
      const mockOnChange = jasmine.createSpy('onChange');
      const mockOnTouched = jasmine.createSpy('onTouched');
      
      component.registerOnChange(mockOnChange);
      component.registerOnTouched(mockOnTouched);
      
      component.selectedItems = [mockSourceOptions[0]];
      component.primaryItem = mockSourceOptions[0];

      component['updateFormValue']();

      expect(mockOnChange).toHaveBeenCalledWith({
        items: [mockSourceOptions[0]],
        primary: mockSourceOptions[0]
      });
      expect(mockOnTouched).toHaveBeenCalled();
    });
  });
});
