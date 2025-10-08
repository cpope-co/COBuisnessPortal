import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { PriceBookComponent } from './price-book.component';
import { PriceBookService } from './price-book.service';
import { PriceBookItem } from './price-book.model';
import { MessagesService } from '../../messages/messages.service';
import { FilterService } from '../../services/filter.service';
import { TableComponent } from '../../shared/table/table.component';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('PriceBookComponent', () => {
  let component: PriceBookComponent;
  let fixture: ComponentFixture<PriceBookComponent>;
  let mockPriceBookService: jasmine.SpyObj<PriceBookService>;
  let mockMessagesService: jasmine.SpyObj<MessagesService>;
  let mockFilterService: jasmine.SpyObj<FilterService>;

  // Mock data that matches the actual PriceBookItem interface
  const mockPriceBookData: PriceBookItem = {
    category: 'Electronics',
    item: 'ITEM001',
    description: 'Test Product Description',
    size: 'Medium',
    um: 'EA',
    retailUnits: '1',
    wholesaleCost: 49.99,
    unitRetail: 99.99,
    margin: 50.0,
    rank: 1
  };

  const mockPriceBookList: PriceBookItem[] = [
    mockPriceBookData,
    {
      category: 'Clothing',
      item: 'ITEM002',
      description: 'Another Test Product',
      size: 'Large',
      um: 'EA',
      retailUnits: '1',
      wholesaleCost: 29.99,
      unitRetail: 59.99,
      margin: 50.0,
      rank: 2
    }
  ];

  beforeEach(async () => {
    const priceBookServiceSpy = jasmine.createSpyObj('PriceBookService', [
      'loadAllPriceBookItems'
    ]);
    
    const messagesServiceSpy = jasmine.createSpyObj('MessagesService', [
      'showMessage'
    ]);

    const filterServiceSpy = jasmine.createSpyObj('FilterService', [
      'applyFilter'
    ]);

    await TestBed.configureTestingModule({
      imports: [
        PriceBookComponent, // Standalone component should be in imports
        MatTableModule,
        MatPaginatorModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatCardModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: PriceBookService, useValue: priceBookServiceSpy },
        { provide: MessagesService, useValue: messagesServiceSpy },
        { provide: FilterService, useValue: filterServiceSpy },
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    })
    .overrideComponent(PriceBookComponent, {
      remove: { imports: [TableComponent] },
      add: { 
        schemas: [NO_ERRORS_SCHEMA]
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(PriceBookComponent);
    component = fixture.componentInstance;
    mockPriceBookService = TestBed.inject(PriceBookService) as jasmine.SpyObj<PriceBookService>;
    mockMessagesService = TestBed.inject(MessagesService) as jasmine.SpyObj<MessagesService>;
    mockFilterService = TestBed.inject(FilterService) as jasmine.SpyObj<FilterService>;
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.tableConfig).toBeDefined();
      expect(component.tableColumns).toBeDefined();
      expect(component.priceBookItems).toBeDefined();
    });

    it('should load price book items on initialization', async () => {
      mockPriceBookService.loadAllPriceBookItems.and.returnValue(Promise.resolve(mockPriceBookList));
      
      await component.loadPriceBook();
      
      expect(mockPriceBookService.loadAllPriceBookItems).toHaveBeenCalled();
      expect(component.priceBookItems()).toEqual(mockPriceBookList);
      expect(mockMessagesService.showMessage).toHaveBeenCalledWith('Price Book items loaded successfully.', 'success', 3000);
    });
  });

  describe('Row Interaction', () => {
    it('should handle row click', () => {
      component.onRowClick(mockPriceBookData);
      
      expect(mockMessagesService.showMessage).toHaveBeenCalledWith(
        `Selected item: ${mockPriceBookData.description}`, 
        'info'
      );
    });

    it('should handle row double click', () => {
      component.onRowDoubleClick(mockPriceBookData);
      
      expect(mockMessagesService.showMessage).toHaveBeenCalledWith(
        `Opening item details: ${mockPriceBookData.description}`, 
        'info'
      );
    });

    it('should handle view price book item', () => {
      component.onViewPriceBookItem(mockPriceBookData);
      
      expect(mockMessagesService.showMessage).toHaveBeenCalledWith(
        `Viewing item: ${mockPriceBookData.description}`, 
        'info'
      );
    });
  });

  describe('Data Loading', () => {
    it('should load price book successfully', async () => {
      mockPriceBookService.loadAllPriceBookItems.and.returnValue(Promise.resolve(mockPriceBookList));
      
      await component.loadPriceBook();
      
      expect(mockPriceBookService.loadAllPriceBookItems).toHaveBeenCalled();
      expect(component.priceBookItems()).toEqual(mockPriceBookList);
      expect(mockMessagesService.showMessage).toHaveBeenCalledWith(
        'Price Book items loaded successfully.', 
        'success', 
        3000
      );
    });

    it('should handle load error gracefully', async () => {
      const error = new Error('Failed to load data');
      mockPriceBookService.loadAllPriceBookItems.and.returnValue(Promise.reject(error));
      spyOn(console, 'error');
      
      await component.loadPriceBook();
      
      expect(console.error).toHaveBeenCalledWith('Failed to load Price Book items:', error);
      expect(mockMessagesService.showMessage).toHaveBeenCalledWith(
        'Failed to load Price Book items.', 
        'danger'
      );
    });
  });

  describe('Table Configuration', () => {
    it('should have correct table configuration', () => {
      expect(component.tableConfig.showSearch).toBe(true);
      expect(component.tableConfig.showAdvancedFilters).toBe(true);
      expect(component.tableConfig.showPagination).toBe(true);
      expect(component.tableConfig.pageSize).toBe(10);
      expect(component.tableConfig.clickableRows).toBe(true);
    });

    it('should have correct column configuration', () => {
      expect(component.tableColumns).toBeDefined();
      expect(component.tableColumns.length).toBeGreaterThan(0);
      
      // Check for required columns
      const columnNames = component.tableColumns.map(col => col.column);
      expect(columnNames).toContain('category');
      expect(columnNames).toContain('item');
      expect(columnNames).toContain('description');
      expect(columnNames).toContain('wholesaleCost');
      expect(columnNames).toContain('unitRetail');
      expect(columnNames).toContain('margin');
    });
  });

  describe('Signal Updates', () => {
    it('should update price book items signal', async () => {
      mockPriceBookService.loadAllPriceBookItems.and.returnValue(Promise.resolve(mockPriceBookList));
      
      // The signal starts as undefined before the component is fully initialized
      // After calling loadPriceBook, it should have the data
      await component.loadPriceBook();
      
      expect(component.priceBookItems()).toEqual(mockPriceBookList);
    });
  });

  describe('Component Dependencies', () => {
    it('should inject required services', () => {
      expect(component.messagesService).toBeDefined();
      expect(component.filterService).toBeDefined();
      expect(component.priceBookService).toBeDefined();
    });
  });
});
