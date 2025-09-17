import { Component, forwardRef, inject, input } from '@angular/core';
import { FormGroup, NG_VALUE_ACCESSOR, ReactiveFormsModule, ControlValueAccessor } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormHandlingService } from '../../services/form-handling.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule, MatSelectionListChange } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';

@Component({
    selector: 'co-pick-list',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => PickListComponent),
            multi: true,
        }
    ],
    imports: [
        MatFormFieldModule,
        MatSelectModule,
        MatButtonModule,
        MatListModule,
        MatCardModule,
        ReactiveFormsModule,
    ],
    templateUrl: './pick-list.component.html',
    styleUrl: './pick-list.component.scss'
})
export class PickListComponent implements ControlValueAccessor {

  formHandlerService = inject(FormHandlingService);

  sourceOptions = input.required<any[]>(); // Available items to choose from
  sourceLabel = input.required<string>(); // Label for source list (e.g., "Manufacturer List")
  targetLabel = input.required<string>(); // Label for target list (e.g., "Access List")
  formGroup = input.required<FormGroup>();
  formControlName = input.required<string>();
  model = input.required<{ [key: string]: any }>();
  primaryField = input<string>(''); // Field to track which item is primary

  selectedItems: any[] = []; // Items in the target list
  selectedSourceItems: any[] = []; // Currently selected items in source list
  selectedTargetItems: any[] = []; // Currently selected items in target list
  primaryItem: any = null; // The primary item

  // ControlValueAccessor implementation
  private onChange = (value: any) => {};
  private onTouched = () => {};

  writeValue(value: any): void {
    if (value) {
      this.selectedItems = value.items || [];
      this.primaryItem = value.primary || null;
    } else {
      this.selectedItems = [];
      this.primaryItem = null;
    }
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  // Get available items (source items minus already selected items)
  get availableItems(): any[] {
    return this.sourceOptions().filter(item => 
      !this.selectedItems.some(selected => this.compareItems(selected, item))
    );
  }

  // Add selected items from source to target
  addItems(): void {
    if (this.selectedSourceItems.length === 0) return;
    
    this.selectedItems = [...this.selectedItems, ...this.selectedSourceItems];
    this.selectedSourceItems = [];
    this.updateFormValue();
  }

  // Remove selected items from target
  removeItems(): void {
    if (this.selectedTargetItems.length === 0) return;
    
    // If removing the primary item, clear primary
    if (this.primaryItem && this.selectedTargetItems.some(item => this.compareItems(item, this.primaryItem))) {
      this.primaryItem = null;
    }
    
    this.selectedItems = this.selectedItems.filter(item => 
      !this.selectedTargetItems.some(selected => this.compareItems(selected, item))
    );
    this.selectedTargetItems = [];
    this.updateFormValue();
  }

  // Toggle selected item as primary
  setPrimary(): void {
    if (this.selectedTargetItems.length === 1) {
      const selectedItem = this.selectedTargetItems[0];
      
      // If the selected item is already primary, remove primary status
      if (this.primaryItem && this.compareItems(selectedItem, this.primaryItem)) {
        this.primaryItem = null;
      } else {
        // Set the selected item as primary
        this.primaryItem = selectedItem;
      }
      
      this.updateFormValue();
    }
  }

  // Handle source list selection
  onSourceSelectionChange(event: MatSelectionListChange): void {
    this.selectedSourceItems = event.source.selectedOptions.selected.map(option => option.value);
  }

  // Handle target list selection
  onTargetSelectionChange(event: MatSelectionListChange): void {
    this.selectedTargetItems = event.source.selectedOptions.selected.map(option => option.value);
  }

  // Update form control value
  private updateFormValue(): void {
    const value = {
      items: this.selectedItems,
      primary: this.primaryItem
    };
    this.onChange(value);
    this.onTouched();
  }

  // Compare items for equality
  private compareItems(item1: any, item2: any): boolean {
    if (!item1 || !item2) return false;
    if (item1.id !== undefined && item2.id !== undefined) {
      return item1.id === item2.id;
    }
    return item1 === item2;
  }

  // Get error message
  getErrorMessage(key: string): string {
    return this.formHandlerService.getErrorMessages(this.formGroup(), this.formControlName(), this.model());
  }

  // Check if item is primary
  isPrimary(item: any): boolean {
    return this.primaryItem && this.compareItems(item, this.primaryItem);
  }

  // Get the button text for Set Primary based on current selection
  getPrimaryButtonText(): string {
    if (this.selectedTargetItems.length === 1) {
      const selectedItem = this.selectedTargetItems[0];
      if (this.primaryItem && this.compareItems(selectedItem, this.primaryItem)) {
        return 'Remove Primary';
      }
    }
    return 'Set Primary';
  }

  // TrackBy function for performance
  trackByFn(index: number, item: any): any {
    return item.id || item;
  }
}
