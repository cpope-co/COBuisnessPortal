import { Component, effect, inject, signal, ViewChild } from '@angular/core';
import { PriceBookItem, PriceBookColumnConfig, PRICE_BOOK_COLUMN_CONFIG, PRICE_BOOK_TABLE_CONFIG } from './price-book.model';
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
import { TableColumn, TableComponent, TableConfig, FormatterType } from '../../shared/table/table.component';

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

  // Use table configuration from model
  tableConfig: TableConfig = PRICE_BOOK_TABLE_CONFIG;
  
  // Use column configuration directly from model
  tableColumns: TableColumn[] = PRICE_BOOK_COLUMN_CONFIG;

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