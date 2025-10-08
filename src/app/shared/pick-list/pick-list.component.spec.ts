import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSelectionListChange } from '@angular/material/list';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

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
    testControl: new FormControl<any>(null)
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

  describe('Template Rendering', () => {
    it('should render source and target labels', () => {
      const sourceTitle = fixture.debugElement.query(By.css('mat-card-title'));
      expect(sourceTitle.nativeElement.textContent.trim()).toBe('Source Items');
      
      const targetTitle = fixture.debugElement.queryAll(By.css('mat-card-title'))[1];
      expect(targetTitle.nativeElement.textContent.trim()).toBe('Selected Items');
    });

    it('should render available items in source list', () => {
      const sourceItems = fixture.debugElement.queryAll(By.css('mat-selection-list mat-list-option'));
      expect(sourceItems.length).toBe(3); // All items available initially
      
      const firstItem = sourceItems[0];
      expect(firstItem.nativeElement.textContent.trim()).toBe('Item 1');
    });

    it('should show "No items available" when all items are selected', () => {
      component.selectedItems = [...mockSourceOptions];
      fixture.detectChanges();
      
      const noItemsMessage = fixture.debugElement.query(By.css('.text-muted'));
      expect(noItemsMessage.nativeElement.textContent.trim()).toBe('No items available');
    });

    it('should show "No items selected" when target list is empty', () => {
      component.selectedItems = [];
      fixture.detectChanges();
      
      const noItemsMessages = fixture.debugElement.queryAll(By.css('.text-muted'));
      const targetMessage = noItemsMessages.find(msg => 
        msg.nativeElement.textContent.trim() === 'No items selected'
      );
      expect(targetMessage).toBeTruthy();
    });

    it('should disable Add button when no source items selected', () => {
      component.selectedSourceItems = [];
      fixture.detectChanges();
      
      const buttons = fixture.debugElement.queryAll(By.css('button'));
      const addButton = buttons.find(btn => 
        btn.nativeElement.textContent.trim().includes('Add')
      );
      expect(addButton?.nativeElement.disabled).toBeTruthy();
    });

    it('should enable Add button when source items selected', () => {
      component.selectedSourceItems = [mockSourceOptions[0]];
      fixture.detectChanges();
      
      const buttons = fixture.debugElement.queryAll(By.css('button'));
      const addButton = buttons.find(btn => 
        btn.nativeElement.textContent.trim().includes('Add')
      );
      expect(addButton?.nativeElement.disabled).toBeFalsy();
    });

    it('should disable Remove button when no target items selected', () => {
      component.selectedTargetItems = [];
      fixture.detectChanges();
      
      const buttons = fixture.debugElement.queryAll(By.css('button'));
      const removeButton = buttons.find(btn => 
        btn.nativeElement.textContent.trim().includes('Remove')
      );
      expect(removeButton?.nativeElement.disabled).toBeTruthy();
    });

    it('should enable Remove button when target items selected', () => {
      component.selectedTargetItems = [mockSourceOptions[0]];
      fixture.detectChanges();
      
      const buttons = fixture.debugElement.queryAll(By.css('button'));
      const removeButton = buttons.find(btn => 
        btn.nativeElement.textContent.trim().includes('Remove')
      );
      expect(removeButton?.nativeElement.disabled).toBeFalsy();
    });

    it('should disable Set Primary button when no target items or multiple items selected', () => {
      component.selectedTargetItems = [];
      fixture.detectChanges();
      
      const buttons = fixture.debugElement.queryAll(By.css('button'));
      const primaryButton = buttons.find(btn => 
        btn.nativeElement.textContent.trim().includes('Set Primary')
      );
      expect(primaryButton?.nativeElement.disabled).toBeTruthy();
      
      component.selectedTargetItems = [mockSourceOptions[0], mockSourceOptions[1]];
      fixture.detectChanges();
      
      expect(primaryButton?.nativeElement.disabled).toBeTruthy();
    });

    it('should enable Set Primary button when exactly one target item selected', () => {
      component.selectedTargetItems = [mockSourceOptions[0]];
      fixture.detectChanges();
      
      const buttons = fixture.debugElement.queryAll(By.css('button'));
      const primaryButton = buttons.find(btn => 
        btn.nativeElement.textContent.trim().includes('Set Primary')
      );
      expect(primaryButton?.nativeElement.disabled).toBeFalsy();
    });

    it('should show primary badge for primary item', () => {
      component.selectedItems = [mockSourceOptions[0], mockSourceOptions[1]];
      component.primaryItem = mockSourceOptions[0];
      fixture.detectChanges();
      
      const badges = fixture.debugElement.queryAll(By.css('.badge'));
      expect(badges.length).toBe(1);
      expect(badges[0].nativeElement.textContent.trim()).toBe('Primary');
    });

    it('should display error message when form control is invalid and touched', () => {
      const formControl = mockFormGroup.get('testControl');
      formControl?.setValidators([Validators.required]);
      formControl?.setValue(null);
      formControl?.markAsTouched();
      
      mockFormHandlingService.getErrorMessages.and.returnValue('This field is required');
      fixture.detectChanges();
      
      const errorMessage = fixture.debugElement.query(By.css('.text-danger'));
      expect(errorMessage).toBeTruthy();
      expect(errorMessage.nativeElement.textContent.trim()).toBe('This field is required');
    });

    it('should not display error message when form control is valid', () => {
      const formControl = mockFormGroup.get('testControl');
      formControl?.setValue(mockSourceOptions[0]);
      formControl?.markAsTouched();
      fixture.detectChanges();
      
      const errorMessage = fixture.debugElement.query(By.css('.text-danger'));
      expect(errorMessage).toBeFalsy();
    });
  });

  describe('Button Click Integration', () => {
    it('should add items when Add button is clicked', () => {
      component.selectedSourceItems = [mockSourceOptions[0]];
      fixture.detectChanges();
      spyOn(component, 'addItems');
      
      const buttons = fixture.debugElement.queryAll(By.css('button'));
      const addButton = buttons.find(btn => 
        btn.nativeElement.textContent.trim().includes('Add')
      );
      addButton?.nativeElement.click();
      
      expect(component.addItems).toHaveBeenCalled();
    });

    it('should remove items when Remove button is clicked', () => {
      component.selectedTargetItems = [mockSourceOptions[0]];
      fixture.detectChanges();
      spyOn(component, 'removeItems');
      
      const buttons = fixture.debugElement.queryAll(By.css('button'));
      const removeButton = buttons.find(btn => 
        btn.nativeElement.textContent.trim().includes('Remove')
      );
      removeButton?.nativeElement.click();
      
      expect(component.removeItems).toHaveBeenCalled();
    });

    it('should set primary when Set Primary button is clicked', () => {
      component.selectedTargetItems = [mockSourceOptions[0]];
      fixture.detectChanges();
      spyOn(component, 'setPrimary');
      
      const buttons = fixture.debugElement.queryAll(By.css('button'));
      const primaryButton = buttons.find(btn => 
        btn.nativeElement.textContent.trim().includes('Set Primary')
      );
      primaryButton?.nativeElement.click();
      
      expect(component.setPrimary).toHaveBeenCalled();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty source options', () => {
      fixture.componentRef.setInput('sourceOptions', []);
      fixture.detectChanges();
      
      expect(component.availableItems).toEqual([]);
    });

    it('should handle items without id property', () => {
      const stringItems = ['item1', 'item2', 'item3'];
      fixture.componentRef.setInput('sourceOptions', stringItems);
      fixture.detectChanges();
      
      component.selectedItems = ['item1'];
      
      expect(component.availableItems).toEqual(['item2', 'item3']);
      expect(component['compareItems']('item1', 'item1')).toBeTruthy();
      expect(component['compareItems']('item1', 'item2')).toBeFalsy();
    });

    it('should handle mixed item types (objects and strings)', () => {
      const mixedItems = [{ id: 1, name: 'Object Item' }, 'String Item'];
      fixture.componentRef.setInput('sourceOptions', mixedItems);
      fixture.detectChanges();
      
      component.selectedItems = [mixedItems[0]];
      
      expect(component.availableItems).toEqual(['String Item']);
    });

    it('should handle duplicate additions gracefully', () => {
      component.selectedItems = [mockSourceOptions[0]];
      component.selectedSourceItems = [mockSourceOptions[0]]; // Already selected
      
      const initialCount = component.selectedItems.length;
      component.addItems();
      
      // Should add duplicate (component doesn't prevent this)
      expect(component.selectedItems.length).toBe(initialCount + 1);
    });

    it('should handle removal of non-existent items', () => {
      component.selectedItems = [mockSourceOptions[0]];
      component.selectedTargetItems = [mockSourceOptions[1]]; // Not in selected items
      
      const initialItems = [...component.selectedItems];
      component.removeItems();
      
      expect(component.selectedItems).toEqual(initialItems); // No change
    });
  });

  describe('Complex Scenarios', () => {
    it('should maintain primary item when adding new items', () => {
      component.selectedItems = [mockSourceOptions[0]];
      component.primaryItem = mockSourceOptions[0];
      component.selectedSourceItems = [mockSourceOptions[1]];
      
      component.addItems();
      
      expect(component.primaryItem).toEqual(mockSourceOptions[0]); // Still primary
      expect(component.selectedItems).toContain(mockSourceOptions[1]); // New item added
    });

    it('should handle setting primary on item without id', () => {
      const stringItems = ['item1', 'item2'];
      component.selectedItems = stringItems;
      component.selectedTargetItems = ['item1'];
      component.primaryItem = null;
      
      component.setPrimary();
      
      expect(component.primaryItem).toBe('item1');
    });

    it('should update form value when primary changes', () => {
      const mockOnChange = jasmine.createSpy('onChange');
      component.registerOnChange(mockOnChange);
      
      component.selectedItems = [mockSourceOptions[0]];
      component.selectedTargetItems = [mockSourceOptions[0]];
      
      component.setPrimary();
      
      expect(mockOnChange).toHaveBeenCalledWith({
        items: [mockSourceOptions[0]],
        primary: mockSourceOptions[0]
      });
    });

    it('should clear selections after adding items', () => {
      component.selectedSourceItems = [mockSourceOptions[0], mockSourceOptions[1]];
      
      component.addItems();
      
      expect(component.selectedSourceItems).toEqual([]);
    });

    it('should clear selections after removing items', () => {
      component.selectedItems = [mockSourceOptions[0], mockSourceOptions[1]];
      component.selectedTargetItems = [mockSourceOptions[0]];
      
      component.removeItems();
      
      expect(component.selectedTargetItems).toEqual([]);
    });
  });

  describe('Accessibility and Performance', () => {
    it('should have proper trackBy function for performance', () => {
      const itemWithId = { id: 42, name: 'Test' };
      const itemWithoutId = 'simple';
      
      expect(component.trackByFn(0, itemWithId)).toBe(42);
      expect(component.trackByFn(1, itemWithoutId)).toBe('simple');
    });

    it('should handle button type attributes correctly', () => {
      const buttons = fixture.debugElement.queryAll(By.css('button[type="button"]'));
      expect(buttons.length).toBe(3); // All three buttons should have type="button"
    });
  });

  describe('ControlValueAccessor Edge Cases', () => {
    it('should handle writeValue with undefined', () => {
      component.writeValue(undefined);
      
      expect(component.selectedItems).toEqual([]);
      expect(component.primaryItem).toBeNull();
    });

    it('should handle writeValue with value containing only items', () => {
      component.writeValue({ items: [mockSourceOptions[0]] });
      
      expect(component.selectedItems).toEqual([mockSourceOptions[0]]);
      expect(component.primaryItem).toBeNull();
    });

    it('should handle writeValue with value containing only primary', () => {
      component.writeValue({ primary: mockSourceOptions[0] });
      
      expect(component.selectedItems).toEqual([]);
      expect(component.primaryItem).toEqual(mockSourceOptions[0]);
    });
  });
});
