import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { TableComponent, TableConfig } from '../../shared/table/table.component';
import { SampleData, SAMPLE_DATA_COLUMN_CONFIG, SAMPLE_DATA_TABLE_CONFIG, SampleDataColumnConfig } from './customer.model';
import { SampleApplicationService } from './customers.service';
import { MessagesService } from '../../messages/messages.service';

@Component({
  selector: 'app-customers',
  imports: [
    MatCardModule,
    TableComponent
  ],
  templateUrl: './customers.html',
  styleUrl: './customers.scss',
})
export class Customers {
  sampleApplicationService = inject(SampleApplicationService);
  messagesService = inject(MessagesService);
  router = inject(Router);

  // Signal for sample data
  #sampleDataSignal = signal<SampleData[]>([]);
  sampleData = this.#sampleDataSignal.asReadonly();

  // Table configuration from model
  tableColumns: SampleDataColumnConfig[] = SAMPLE_DATA_COLUMN_CONFIG;
  tableConfig: TableConfig = SAMPLE_DATA_TABLE_CONFIG;

  constructor() {
    this.loadSampleData();
    this.loadUDCOptions();
  }

  /**
   * Load all sample data from service
   */
  async loadSampleData() {
    try {
      const data = await this.sampleApplicationService.loadAllSampleData();
      this.#sampleDataSignal.set(data);
      this.messagesService.showMessage('Sample data loaded successfully.', 'success', 3000);
    } catch (error) {
      console.error('Failed to load sample data:', error);
      this.messagesService.showMessage('Failed to load sample data.', 'danger');
    }
  }

  /**
   * Load UDC options for customer type dropdown
   */
  async loadUDCOptions() {
    try {
      await this.sampleApplicationService.loadUDCOptions();
    } catch (error) {
      console.error('Failed to load UDC options:', error);
    }
  }

  /**
   * Handle row click - navigate to detail page
   */
  onRowClick(row: SampleData) {
    this.router.navigate(['/sample/customer', row.CustNumber]);
  }
}
