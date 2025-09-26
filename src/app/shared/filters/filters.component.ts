import { Component, effect, EventEmitter, input, model, output, signal, ViewChild, ElementRef, QueryList, ViewChildren, inject, Inject } from '@angular/core';
import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormField, MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FilterConfig } from '../table/table.component';
import { InputComponent } from '../input/input.component';
import { SelectComponent } from '../select/select.component';
import { FiltersDialogComponent } from '../filter-dialog/filters-dialog.component';

@Component({
    selector: 'co-filters',
    imports: [
        MatButtonModule,
        MatIconModule,
        MatDialogModule,
        MatInputModule,
        MatFormField,
        FormsModule,
    ],
    templateUrl: './filters.component.html',
    styleUrl: './filters.component.scss'
})
export class FiltersComponent {

  private dialog = inject(MatDialog);

  @ViewChild('searchInput') searchInputRef!: ElementRef<HTMLInputElement>;

  // Inputs
  filterConfigs = input<FilterConfig[]>([]);
  showSearch = input<boolean>(true);
  showAdvancedFilters = input<boolean>(true);

  // Outputs
  search = output<string>({
    alias: 'searchOutput'
  });
  filter = output<string>({
    alias: 'filterOutput'
  });
  filtersChanged = output<any>();
  filtersCleared = output<void>();

  // Track current filter state
  private currentFilters: { [key: string]: any } = {};
  currentSearch: string = ''; // Make public for template access

  constructor() {
    
  }

  onSearchChange(event: KeyboardEvent): void {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement && inputElement.value !== undefined) {
      this.currentSearch = inputElement.value;
      
      // Only emit search when 4+ characters or empty (to clear)
      if (inputElement.value.length >= 4 || inputElement.value.length === 0) {
        this.search.emit(inputElement.value);
      } else if (this.currentSearch.length === 0) {
        // Also emit when clearing search
        this.search.emit('');
      }
    }
  }

  openFiltersDialog(): void {
    const dialogRef = this.dialog.open(FiltersDialogComponent, {
      data: {
        filterConfigs: this.filterConfigs(),
        currentFilters: this.currentFilters
      },
      width: '600px',
      maxWidth: '90vw',
      maxHeight: '80vh',
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.action === 'apply') {
          // Update internal state
          this.currentFilters = { ...result.filters };
          
          // Emit individual filter changes
          if (result.filters) {
            Object.keys(result.filters).forEach(key => {
              this.filtersChanged.emit({
                key: key,
                value: result.filters[key]
              });
            });
          }
        } else if (result.action === 'clear') {
          this.clearAdvancedFilters();
        }
      }
    });
  }

  hasActiveFilters(): boolean {
    return this.currentSearch.length > 0 || 
           Object.keys(this.currentFilters).some(key => 
             this.currentFilters[key] !== null && 
             this.currentFilters[key] !== '' && 
             this.currentFilters[key] !== undefined
           );
  }

  hasActiveAdvancedFilters(): boolean {
    return Object.keys(this.currentFilters).some(key => 
      this.currentFilters[key] !== null && 
      this.currentFilters[key] !== '' && 
      this.currentFilters[key] !== undefined
    );
  }

  getActiveFilterCount(): number {
    let count = this.currentSearch.length > 0 ? 1 : 0;
    count += Object.keys(this.currentFilters).filter(key => 
      this.currentFilters[key] !== null && 
      this.currentFilters[key] !== '' && 
      this.currentFilters[key] !== undefined
    ).length;
    return count;
  }

  getActiveAdvancedFilterCount(): number {
    return Object.keys(this.currentFilters).filter(key => 
      this.currentFilters[key] !== null && 
      this.currentFilters[key] !== '' && 
      this.currentFilters[key] !== undefined
    ).length;
  }

  private getCurrentFilterValues(): any {
    return {
      filters: this.currentFilters
    };
  }

  clearAllFilters(): void {
    // Clear internal state
    this.currentFilters = {};
    this.currentSearch = '';
    
    // Clear the search input in the UI
    if (this.searchInputRef && this.searchInputRef.nativeElement) {
      this.searchInputRef.nativeElement.value = '';
    }
    
    // Emit cleared filters for each filter config
    this.filterConfigs().forEach(config => {
      this.filtersChanged.emit({
        key: config.key,
        value: null
      });
    });

    // Emit search cleared
    this.search.emit('');

    // Emit filters cleared event
    this.filtersCleared.emit();
  }

  clearAdvancedFilters(): void {
    // Clear only advanced filters, not search
    this.currentFilters = {};
    
    // Emit cleared filters for each filter config
    this.filterConfigs().forEach(config => {
      this.filtersChanged.emit({
        key: config.key,
        value: null
      });
    });

    // Emit filters cleared event (but not search)
    this.filtersCleared.emit();
  }
}
