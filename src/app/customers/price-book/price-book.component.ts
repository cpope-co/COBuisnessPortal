import { Component, effect, inject, signal, ViewChild } from '@angular/core';
import { PriceBookItem, ColumnConfig, FormatterType, PRICE_BOOK_COLUMN_CONFIG } from './price-book.model';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MessagesService } from '../../messages/messages.service';
import { FilterService } from '../../services/filter.service';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { PriceBookService } from './price-book.service';
import { MatCardModule } from '@angular/material/card';
import { TableColumn, TableComponent, TableConfig } from '../../shared/table/table.component';

@Component({
  selector: 'app-price-book',
  imports: [
    MatTableModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatPaginatorModule,
    TableComponent
  ],
  templateUrl: './price-book.component.html',
  styleUrl: './price-book.component.scss'
})
export class PriceBookComponent {
  messagesService = inject(MessagesService);
  filterService = inject(FilterService);
  priceBookService = inject(PriceBookService);

  priceBookItemsSignal = signal<PriceBookItem[]>([]);
  priceBookItems = this.priceBookItemsSignal.asReadonly();
  
  private formatters = new Map<FormatterType, (value: any, options?: Intl.NumberFormatOptions) => string>([
    ['text', (value) => String(value || '')],
    ['number', (value) => String(value || 0)],
    ['currency', (value, options) => new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      ...options
    }).format(Number(value || 0))],
    ['percentage', (value, options) => new Intl.NumberFormat('en-US', {
      style: 'percent',
      ...options
    }).format(Number(value || 0) / 100)]
  ]);

  // Add to tableConfig:
  tableConfig: TableConfig = {
    showFilter: true,
    showAdvancedFilters: true, // Enable advanced filters
    showPagination: true,
    pageSize: 25,
    pageSizeOptions: [10, 25, 50, 100],
    showFirstLastButtons: true,
    clickableRows: true
  };
  
  // Add to tableColumns mapping to use config from model:
  tableColumns: TableColumn[] = PRICE_BOOK_COLUMN_CONFIG.map(config => ({
    column: config.column as string,
    label: config.label,
    sortable: config.sortable ?? true, // Use config value, default to true if not specified
    filterable: config.filterable ?? true, // Use config value, default to true if not specified
    formatter: this.getFormatter(config.formatter),
    formatOptions: config.formatOptions
  }));

  private getFormatter(formatterType: FormatterType) {
    return this.formatters.get(formatterType) || this.formatters.get('text')!;
  }

  onRowClick(item: PriceBookItem) {
    this.messagesService.showMessage(`Selected item: ${item.description}`, 'info');
  }

  onRowDoubleClick(item: PriceBookItem) {
    this.messagesService.showMessage(`Opening item details: ${item.description}`, 'info');
    // TODO: Navigate to item details or open modal
  }



  constructor() {
    this.loadPriceBook();
    
  }


  onViewPriceBookItem(item: PriceBookItem): void {
    this.messagesService.showMessage(`Viewing item: ${item.description}`, 'info');
  }

  async loadPriceBook() {
    try {
      const priceBookItems = await this.priceBookService.loadAllPriceBookItems();
      this.priceBookItemsSignal.set(priceBookItems);
      this.messagesService.showMessage('Price Book items loaded successfully.', 'success', 3000);
    } catch (error) {
      console.error('Failed to load Price Book items:', error);
      this.messagesService.showMessage('Failed to load Price Book items.', 'danger');
    }
  }
}