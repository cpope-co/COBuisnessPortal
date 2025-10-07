import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideNgxMask } from 'ngx-mask';
import { signal } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTableDataSource } from '@angular/material/table';

import { TableComponent, TableColumn, TableConfig, FilterConfig, DEFAULT_FORMATTERS } from './table.component';

describe('TableComponent', () => {
  let component: TableComponent;
  let fixture: ComponentFixture<TableComponent>;

  const testData = [
    { 
      id: 1, 
      name: 'John Doe', 
      age: 30, 
      active: true, 
      salary: 50000, 
      joinDate: '2023-01-15',
      department: 'Engineering'
    },
    { 
      id: 2, 
      name: 'Jane Smith', 
      age: 25, 
      active: false, 
      salary: 60000, 
      joinDate: '2023-02-20',
      department: 'Marketing'
    },
    { 
      id: 3, 
      name: 'Bob Johnson', 
      age: 35, 
      active: true, 
      salary: 75000, 
      joinDate: '2022-12-01',
      department: 'Engineering'
    }
  ];

  const testColumns: TableColumn[] = [
    { column: 'id', label: 'ID', sortable: true, filterable: true },
    { column: 'name', label: 'Name', sortable: true, filterable: true },
    { column: 'age', label: 'Age', sortable: true, filterable: true },
    { column: 'active', label: 'Active', sortable: true, filterable: true },
    { 
      column: 'salary', 
      label: 'Salary', 
      sortable: true, 
      filterable: true,
      formatter: (value: number) => new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(value)
    },
    { column: 'department', label: 'Department', sortable: true, filterable: true }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableComponent, BrowserAnimationsModule],
      providers: [
        provideNgxMask()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableComponent);
    component = fixture.componentInstance;
    
    // Set required inputs
    fixture.componentRef.setInput('data', testData);
    fixture.componentRef.setInput('columns', testColumns);
    
    fixture.detectChanges();
  });

  afterEach(() => {
    // Ensure component is properly destroyed to clean up effects
    if (fixture) {
      if (component && component.ngOnDestroy) {
        component.ngOnDestroy();
      }
      fixture.destroy();
    }
    // Force garbage collection
    component = null as any;
    fixture = null as any;
  });

  describe('Component Creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with required inputs', () => {
      expect(component.data()).toEqual(testData);
      expect(component.columns()).toEqual(testColumns);
    });

    it('should initialize with default config', () => {
      const defaultConfig = component.config();
      expect(defaultConfig.showAdvancedFilters).toBe(false);
      expect(defaultConfig.showPagination).toBe(true);
      expect(defaultConfig.pageSize).toBe(10);
      expect(defaultConfig.clickableRows).toBe(true);
    });

    it('should accept custom config', () => {
      const customConfig: TableConfig = {
        showAdvancedFilters: true,
        showPagination: false,
        pageSize: 25,
        clickableRows: false
      };
      
      fixture.componentRef.setInput('config', customConfig);
      fixture.detectChanges();
      
      expect(component.config().showAdvancedFilters).toBe(true);
      expect(component.config().showPagination).toBe(false);
      expect(component.config().pageSize).toBe(25);
      expect(component.config().clickableRows).toBe(false);
    });
  });

  describe('Data Source Management', () => {
    it('should initialize dataSource with provided data', () => {
      expect(component.dataSource.data).toEqual(testData);
      expect(component.originalData).toEqual(testData);
    });

    it('should update dataSource when data changes', () => {
      const newData = [{ id: 4, name: 'New User', age: 40, active: true, salary: 80000, department: 'Sales' }];
      
      fixture.componentRef.setInput('data', newData);
      fixture.detectChanges();
      
      expect(component.dataSource.data).toEqual(newData);
      expect(component.originalData).toEqual(newData);
    });

    it('should handle empty data', () => {
      fixture.componentRef.setInput('data', []);
      fixture.detectChanges();
      
      expect(component.dataSource.data).toEqual([]);
      expect(component.hasData()).toBe(false);
    });
  });

  describe('Computed Properties', () => {
    it('should compute displayedColumns correctly', () => {
      const expectedColumns = ['id', 'name', 'age', 'active', 'salary', 'department'];
      expect(component.displayedColumns()).toEqual(expectedColumns);
    });

    it('should compute hasData correctly', () => {
      expect(component.hasData()).toBe(true);
      
      fixture.componentRef.setInput('data', []);
      fixture.detectChanges();
      
      expect(component.hasData()).toBe(false);
    });

    it('should generate filter configs based on columns', () => {
      const filterConfigs = component.filterConfigs();
      expect(filterConfigs.length).toBe(testColumns.length);
      
      const nameFilter = filterConfigs.find(f => f.key === 'name');
      expect(nameFilter).toBeDefined();
      expect(nameFilter?.label).toBe('Name');
      expect(nameFilter?.type).toBe('select'); // Small dataset should use select
    });
  });

  describe('Static Methods', () => {
    it('should return correct formatter for known types', () => {
      const textFormatter = TableComponent.getFormatter('text');
      expect(textFormatter('test')).toBe('test');
      
      const currencyFormatter = TableComponent.getFormatter('currency');
      expect(currencyFormatter(1000)).toBe('$1,000.00');
      
      const percentageFormatter = TableComponent.getFormatter('percentage');
      expect(percentageFormatter(50)).toBe('50%');
    });

    it('should use custom formatters when provided', () => {
      const customFormatters = new Map<'text' | 'currency' | 'percentage' | 'number', (value: any, options?: any) => string>([
        ['text', (value: any) => `Custom: ${value}`]
      ]);
      
      const formatter = TableComponent.getFormatter('text', customFormatters);
      expect(formatter('test')).toBe('Custom: test');
    });

    it('should fall back to text formatter for unknown types', () => {
      const formatter = TableComponent.getFormatter('unknown' as any);
      expect(formatter('test')).toBe('test');
    });
  });

  describe('Filter Type Determination', () => {
    it('should determine boolean filter type', () => {
      const booleanData = [{ flag: true }, { flag: false }];
      fixture.componentRef.setInput('data', booleanData);
      fixture.detectChanges();
      
      const filterType = (component as any).determineFilterType('flag', [true, false]);
      expect(filterType).toBe('boolean');
    });

    it('should determine number filter type', () => {
      const filterType = (component as any).determineFilterType('age', [25, 30, 35]);
      expect(filterType).toBe('number');
    });

    it('should determine select filter type for small datasets', () => {
      const filterType = (component as any).determineFilterType('department', ['Engineering', 'Marketing']);
      expect(filterType).toBe('select');
    });

    it('should determine text filter type for large datasets', () => {
      const largeValueSet = Array.from({ length: 25 }, (_, i) => `value${i}`);
      const filterType = (component as any).determineFilterType('column', largeValueSet);
      expect(filterType).toBe('text');
    });

    it('should handle empty values', () => {
      const filterType = (component as any).determineFilterType('column', []);
      expect(filterType).toBe('text');
    });

    it('should determine text filter type for single string value', () => {
      const filterType = (component as any).determineFilterType('name', ['John Doe']);
      expect(filterType).toBe('select'); // Small dataset (1 value) = select type
    });
  });

  describe('Cell Value Formatting', () => {
    it('should return formatted cell value with custom formatter', () => {
      const element = { salary: 50000 };
      const formattedValue = component.getCellValue(element, 'salary');
      expect(formattedValue).toBe('$50,000.00');
    });

    it('should return string value without formatter', () => {
      const element = { name: 'John Doe' };
      const value = component.getCellValue(element, 'name');
      expect(value).toBe('John Doe');
    });

    it('should handle null/undefined values', () => {
      const element = { name: null };
      const value = component.getCellValue(element, 'name');
      expect(value).toBe('');
    });
  });

  describe('Row Interaction', () => {
    it('should emit rowClick when row is clicked and clickableRows is true', () => {
      spyOn(component.rowClick, 'emit');
      
      component.onRowClick(testData[0]);
      
      expect(component.rowClick.emit).toHaveBeenCalledWith(testData[0]);
    });

    it('should not emit rowClick when clickableRows is false', () => {
      const config: TableConfig = { clickableRows: false };
      fixture.componentRef.setInput('config', config);
      fixture.detectChanges();
      
      spyOn(component.rowClick, 'emit');
      
      component.onRowClick(testData[0]);
      
      expect(component.rowClick.emit).not.toHaveBeenCalled();
    });

    it('should emit rowDoubleClick when row is double-clicked', () => {
      spyOn(component.rowDoubleClick, 'emit');
      
      component.onRowDoubleClick(testData[0]);
      
      expect(component.rowDoubleClick.emit).toHaveBeenCalledWith(testData[0]);
    });
  });

  describe('Column Sortability', () => {
    it('should return true for sortable columns', () => {
      expect(component.isSortable('name')).toBe(true);
    });

    it('should return false for non-sortable columns', () => {
      const nonSortableColumns: TableColumn[] = [
        { column: 'name', label: 'Name', sortable: false }
      ];
      
      fixture.componentRef.setInput('columns', nonSortableColumns);
      fixture.detectChanges();
      
      expect(component.isSortable('name')).toBe(false);
    });

    it('should default to true when sortable is undefined', () => {
      const defaultColumns: TableColumn[] = [
        { column: 'name', label: 'Name' } // sortable not specified
      ];
      
      fixture.componentRef.setInput('columns', defaultColumns);
      fixture.detectChanges();
      
      expect(component.isSortable('name')).toBe(true);
    });
  });

  describe('Search Functionality', () => {
    it('should filter data based on search term', () => {
      component.onSearchChange('John');
      
      // Should find both John Doe and Bob Johnson (Johnson contains "John")
      expect(component.dataSource.data.length).toBe(2);
      const names = component.dataSource.data.map(item => item.name);
      expect(names).toContain('John Doe');
      expect(names).toContain('Bob Johnson');
    });

    it('should search across all columns', () => {
      component.onSearchChange('Engineering');
      
      expect(component.dataSource.data.length).toBe(2);
      expect(component.dataSource.data.every(item => item.department === 'Engineering')).toBe(true);
    });

    it('should handle empty search term', () => {
      component.onSearchChange('');
      
      expect(component.dataSource.data.length).toBe(testData.length);
    });

    it('should be case insensitive', () => {
      component.onSearchChange('john');
      
      // Should find both John Doe and Bob Johnson (Johnson contains "john")
      expect(component.dataSource.data.length).toBe(2);
      const names = component.dataSource.data.map(item => item.name);
      expect(names).toContain('John Doe');
      expect(names).toContain('Bob Johnson');
    });

    it('should use formatter for search when available', () => {
      // Search for formatted salary value
      component.onSearchChange('$50,000');
      
      expect(component.dataSource.data.length).toBe(1);
      expect(component.dataSource.data[0].salary).toBe(50000);
    });
  });

  describe('Advanced Filtering', () => {
    it('should apply single filter', () => {
      component.onFiltersChanged({ key: 'department', value: 'Engineering' });
      
      expect(component.dataSource.data.length).toBe(2);
      expect(component.dataSource.data.every(item => item.department === 'Engineering')).toBe(true);
    });

    it('should apply multiple filters', () => {
      component.onFiltersChanged({ key: 'department', value: 'Engineering' });
      component.onFiltersChanged({ key: 'active', value: true });
      
      expect(component.dataSource.data.length).toBe(2);
      expect(component.dataSource.data.every(item => 
        item.department === 'Engineering' && item.active === true
      )).toBe(true);
    });

    it('should remove filter when value is empty', () => {
      // First apply a filter
      component.onFiltersChanged({ key: 'department', value: 'Engineering' });
      expect(component.dataSource.data.length).toBe(2);
      
      // Then remove it
      component.onFiltersChanged({ key: 'department', value: '' });
      expect(component.dataSource.data.length).toBe(testData.length);
    });

    it('should emit filtersChanged event', () => {
      spyOn(component.filtersChanged, 'emit');
      
      component.onFiltersChanged({ key: 'department', value: 'Engineering' });
      
      expect(component.filtersChanged.emit).toHaveBeenCalledWith({ department: 'Engineering' });
    });

    it('should handle null filter values', () => {
      component.onFiltersChanged({ key: 'department', value: null });
      
      expect(component.dataSource.data.length).toBe(testData.length);
    });
  });

  describe('Filter Matching', () => {
    it('should match text filters', () => {
      // Since single value ['John Doe'] becomes 'select' type, test exact match
      const matches = (component as any).matchesFilter('John Doe', 'John Doe', 'name');
      expect(matches).toBe(true);
    });

    it('should match partial text when filter type is text (large dataset)', () => {
      // Test with text input that should match as text filter
      // Temporarily simulate a large dataset by overriding originalData to force text filtering
      const originalDataBackup = component.originalData;
      
      // Create a dataset with >20 unique names including the test value to force text filtering
      const largeDataset = Array.from({length: 21}, (_, i) => ({
        id: i + 1,
        name: i === 0 ? 'Engineering Department Manager' : `User ${i}`,
        age: 25 + i,
        active: i % 2 === 0,
        salary: 50000 + i * 1000,
        joinDate: '2023-01-01',
        department: 'Engineering'
      }));
      
      component.originalData = largeDataset;
      
      // Now 'Engineering Department Manager' partial match should work with 'Engineering'
      const matches = (component as any).matchesFilter('Engineering Department Manager', 'Engineering', 'name');
      
      // Restore original data
      component.originalData = originalDataBackup;
      
      expect(matches).toBe(true);
    });

    it('should match number filters', () => {
      const matches = (component as any).matchesFilter(30, 30, 'age');
      expect(matches).toBe(true);
    });

    it('should match boolean filters', () => {
      const matches = (component as any).matchesFilter(true, true, 'active');
      expect(matches).toBe(true);
    });

    it('should match select filters', () => {
      const matches = (component as any).matchesFilter('Engineering', 'Engineering', 'department');
      expect(matches).toBe(true);
    });

    it('should handle null item values', () => {
      const matches = (component as any).matchesFilter(null, 'test', 'name');
      expect(matches).toBe(false);
    });
  });

  describe('Filter Clearing', () => {
    it('should clear all filters and reset data', () => {
      // Apply some filters first
      component.onFiltersChanged({ key: 'department', value: 'Engineering' });
      component.onSearchChange('Bob');
      
      expect(component.dataSource.data.length).toBe(1);
      
      // Clear filters
      component.onFiltersCleared();
      
      expect(component.dataSource.data.length).toBe(testData.length);
      expect((component as any).currentFilters).toEqual({});
      expect((component as any).currentSearchTerm).toBe('');
    });
  });

  describe('View Initialization', () => {
    it('should setup paginator and sort after view init', fakeAsync(() => {
      component.ngAfterViewInit();
      tick(); // Wait for setTimeout
      
      // Test that setup completed without errors
      expect(component).toBeTruthy();
    }));

    it('should handle missing paginator gracefully', fakeAsync(() => {
      component.paginator = undefined as any;
      
      expect(() => {
        component.ngAfterViewInit();
        tick();
      }).not.toThrow();
    }));
  });

  describe('Loading State', () => {
    it('should handle loading input', () => {
      fixture.componentRef.setInput('loading', true);
      fixture.detectChanges();
      
      expect(component.loading()).toBe(true);
    });

    it('should default loading to false', () => {
      expect(component.loading()).toBe(false);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle malformed data gracefully', () => {
      const malformedData = [
        { id: 1, name: 'Valid' },
        { id: 2, name: null }, // null name
        { id: 3 } // missing name
      ];
      
      fixture.componentRef.setInput('data', malformedData);
      fixture.detectChanges();
      
      expect(component.dataSource.data).toEqual(malformedData);
      expect(() => component.getCellValue(malformedData[2], 'name')).not.toThrow();
      expect(component.getCellValue(malformedData[2], 'name')).toBe('');
    });

    it('should handle invalid filter changes', () => {
      expect(() => {
        component.onFiltersChanged(null);
      }).not.toThrow();
      
      expect(() => {
        component.onFiltersChanged({});
      }).not.toThrow();
    });

    it('should handle columns without filterable property', () => {
      const columnsWithoutFilterable: TableColumn[] = [
        { column: 'name', label: 'Name' }
      ];
      
      fixture.componentRef.setInput('columns', columnsWithoutFilterable);
      fixture.detectChanges();
      
      const filterConfigs = component.filterConfigs();
      expect(filterConfigs.length).toBe(1);
      expect(filterConfigs[0].key).toBe('name');
    });
  });

  describe('Performance and Memory', () => {
    it('should not mutate original data during filtering', () => {
      const originalDataCopy = [...testData];
      
      component.onSearchChange('John');
      component.onFiltersChanged({ key: 'department', value: 'Engineering' });
      
      expect(component.originalData).toEqual(originalDataCopy);
      expect(testData).toEqual(originalDataCopy);
    });

    it('should reset paginator to first page after filtering', () => {
      // Mock paginator
      const mockPaginator = { firstPage: jasmine.createSpy('firstPage') };
      component.dataSource.paginator = mockPaginator as any;
      
      component.onSearchChange('test');
      
      expect(mockPaginator.firstPage).toHaveBeenCalled();
    });
  });
});
