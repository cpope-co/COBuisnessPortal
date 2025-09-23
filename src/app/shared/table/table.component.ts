import { Component, input, output, OnInit, AfterViewInit, ViewChild, effect, computed, ChangeDetectorRef } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FiltersComponent } from '../filters/filters.component';

export interface TableColumn {
  column: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  formatter?: (value: any, formatOptions?: any) => string;
  formatOptions?: any;
}

export interface TableConfig {
  showFilter?: boolean;
  showAdvancedFilters?: boolean;
  showPagination?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  showFirstLastButtons?: boolean;
  clickableRows?: boolean;
}

export interface FilterConfig {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'date' | 'boolean';
  options?: any[];
}

@Component({
  selector: 'co-table',
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    FiltersComponent
  ],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss'
})
export class TableComponent<T = any> implements OnInit, AfterViewInit {
  // Required inputs
  data = input.required<T[]>();
  columns = input.required<TableColumn[]>();

  // Optional configuration
  config = input<TableConfig>({
    showFilter: true,
    showAdvancedFilters: false,
    showPagination: true,
    pageSize: 10,
    pageSizeOptions: [10, 25, 50, 100],
    showFirstLastButtons: true,
    clickableRows: true
  });

  // Optional inputs
  filterPlaceholder = input<string>('Filter data...');
  emptyMessage = input<string>('No data available');

  // Outputs
  rowClick = output<T>();
  rowDoubleClick = output<T>();
  filtersChanged = output<any>();

  // Internal properties
  dataSource = new MatTableDataSource<T>([]);
  originalData: T[] = [];
  currentFilters: { [key: string]: any } = {}; // Track current filter state

  // Computed properties
  displayedColumns = computed(() => this.columns().map(col => col.column));
  hasData = computed(() => this.data().length > 0);

  // Filter configuration for advanced filters
  filterConfigs = computed(() => this.generateFilterConfigs());

  @ViewChild('tablePaginator') paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private cdr: ChangeDetectorRef) {
    // Update data source when data changes
    effect(() => {
      this.originalData = [...this.data()];
      this.dataSource.data = this.data();
    });
  }

  ngOnInit() {
    this.originalData = [...this.data()];
    this.dataSource.data = this.data();

    // Custom filter predicate for simple text filtering
    this.dataSource.filterPredicate = (data: T, filter: string) => {
      const searchStr = filter.toLowerCase();
      return this.columns()
        .filter(col => col.filterable !== false)
        .some(column => {
          const value = this.getCellValue(data, column.column);
          return String(value).toLowerCase().includes(searchStr);
        });
    };
  }

  ngAfterViewInit() {
    // Setup paginator and sort after view initialization
    // Use setTimeout to ensure ViewChild elements are fully initialized
    setTimeout(() => {
      if (this.paginator && this.config().showPagination) {
        this.dataSource.paginator = this.paginator;
      }
      if (this.sort) {
        this.dataSource.sort = this.sort;
      }
      
      this.cdr.detectChanges();
    });
  }

  /**
   * Generate filter configurations based on table columns
   */
  private generateFilterConfigs(): FilterConfig[] {
    return this.columns()
      .filter(col => col.filterable !== false)
      .map(column => {
        const uniqueValues = this.getUniqueColumnValues(column.column);

        return {
          key: column.column,
          label: column.label,
          type: this.determineFilterType(column.column, uniqueValues),
          options: uniqueValues.length <= 20 ? uniqueValues : undefined // Only show options for small sets
        } as FilterConfig;
      });
  }

  /**
   * Get unique values for a column to determine filter type and options
   */
  private getUniqueColumnValues(columnName: string): any[] {
    const values = this.originalData.map(item => (item as any)[columnName]);
    const uniqueValues = [...new Set(values)].filter(val => val != null);
    return uniqueValues.sort();
  }

  /**
   * Determine the appropriate filter type based on column data
   */
  private determineFilterType(columnName: string, values: any[]): 'text' | 'number' | 'select' | 'date' | 'boolean' {
    if (values.length === 0) return 'text';

    const firstValue = values[0];

    // Check for boolean
    if (typeof firstValue === 'boolean' ||
      (values.length <= 2 && values.every(v => v === true || v === false || v === 'true' || v === 'false'))) {
      return 'boolean';
    }

    // Check for number
    if (typeof firstValue === 'number' || values.every(v => !isNaN(Number(v)))) {
      return 'number';
    }

    // Check for date
    if (firstValue instanceof Date ||
      values.every(v => !isNaN(Date.parse(v)))) {
      return 'date';
    }

    // If small set of unique values, use select
    if (values.length <= 20) {
      return 'select';
    }

    // Default to text
    return 'text';
  }

  /**
   * Apply simple text filter to the table
   */
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  /**
   * Handle advanced filters from filters component
   */
  onFiltersChanged(filterChange: any) {
    // Update the current filters state
    if (filterChange && filterChange.key) {
      if (filterChange.value === '' || filterChange.value == null) {
        // Remove filter when value is empty or "All" is selected
        delete this.currentFilters[filterChange.key];
      } else {
        // Set filter value
        this.currentFilters[filterChange.key] = filterChange.value;
      }
    }

    this.filtersChanged.emit(this.currentFilters);

    // Apply advanced filters to data
    this.applyFilters();
  }

  /**
   * Apply all current filters to the data
   */
  private applyFilters() {
    let filteredData = [...this.originalData];
    // Apply each active filter to the data
    Object.keys(this.currentFilters).forEach(key => {
      const filterValue = this.currentFilters[key];
      
      if (filterValue != null && filterValue !== '') {
        filteredData = filteredData.filter(item => {
          const itemValue = (item as any)[key];
          const matches = this.matchesFilter(itemValue, filterValue, key);
          return matches;
        });
      }
    });

    this.dataSource.data = filteredData;

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  /**
   * Check if item value matches filter criteria
   */
  private matchesFilter(itemValue: any, filterValue: any, columnName: string): boolean {
    if (itemValue == null) return false;

    const column = this.columns().find(col => col.column === columnName);
    const filterType = this.determineFilterType(columnName, [itemValue]);

    switch (filterType) {
      case 'text':
        return String(itemValue).toLowerCase().includes(String(filterValue).toLowerCase());

      case 'number':
        return Number(itemValue) === Number(filterValue);

      case 'select':
        return itemValue === filterValue;

      case 'boolean':
        return Boolean(itemValue) === Boolean(filterValue);

      case 'date':
        const itemDate = new Date(itemValue).toDateString();
        const filterDate = new Date(filterValue).toDateString();
        return itemDate === filterDate;

      default:
        return String(itemValue).toLowerCase().includes(String(filterValue).toLowerCase());
    }
  }

  /**
   * Clear all filters
   */
  clearFilters() {
    this.dataSource.filter = '';
    this.currentFilters = {}; // Clear the filters state
    this.dataSource.data = [...this.originalData];

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  /**
   * Get formatted cell value
   */
  getCellValue(element: T, columnName: string): string {
    const column = this.columns().find(col => col.column === columnName);
    const rawValue = (element as any)[columnName];

    if (column?.formatter) {
      return column.formatter(rawValue, column.formatOptions);
    }

    return String(rawValue ?? '');
  }

  /**
   * Handle row click
   */
  onRowClick(row: T) {
    if (this.config().clickableRows) {
      this.rowClick.emit(row);
    }
  }

  /**
   * Handle row double click
   */
  onRowDoubleClick(row: T) {
    if (this.config().clickableRows) {
      this.rowDoubleClick.emit(row);
    }
  }

  /**
   * Check if column is sortable
   */
  isSortable(columnName: string): boolean {
    const column = this.columns().find(col => col.column === columnName);
    return column?.sortable !== false; // Default to true unless explicitly false
  }
}
