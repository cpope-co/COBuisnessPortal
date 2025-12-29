import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { SampleData } from '../customer.model';
import { SampleApplicationService } from '../customers.service';
import { MessagesService } from '../../../messages/messages.service';
import { FormHandling } from '../../../models/form-handling.model';

@Component({
  selector: 'app-customer',
  imports: [
    MatCardModule,
    MatButtonModule
  ],
  templateUrl: './customer.html',
  styleUrl: './customer.scss',
})
export class Customer {
  sampleApplicationService = inject(SampleApplicationService);
  messagesService = inject(MessagesService);
  router = inject(Router);
  activatedRoute = inject(ActivatedRoute);
  dialog = inject(MatDialog);

  // Signal for customer data
  #customerSignal = signal<SampleData | null>(null);
  customer = this.#customerSignal.asReadonly();

  constructor() {
    this.loadCustomer();
  }

  /**
   * Load customer data by ID from route params
   */
  async loadCustomer() {
    try {
      const id = +this.activatedRoute.snapshot.paramMap.get('id')!;
      const data = await this.sampleApplicationService.getSampleDataById(id);
      this.#customerSignal.set(data);
    } catch (error) {
      console.error('Failed to load customer:', error);
      this.messagesService.showMessage('Failed to load customer.', 'danger');
      this.router.navigate(['/sample/customers']);
    }
  }

  /**
   * Navigate back to customer list
   */
  onBack() {
    this.router.navigate(['/sample/customers']);
  }

  /**
   * Navigate to edit page
   */
  onEdit() {
    const id = this.customer()?.CustNumber;
    if (id) {
      this.router.navigate(['/sample/customer', id, 'edit']);
    }
  }

  /**
   * Delete customer with confirmation
   */
  async onDelete() {
    const customer = this.customer();
    if (!customer) return;

    const confirmed = confirm(
      `Are you sure you want to delete customer ${customer.CustNumber} - ${customer.CustName}? This action cannot be undone.`
    );

    if (confirmed) {
      try {
        await this.sampleApplicationService.deleteSampleData(customer.CustNumber);
        this.messagesService.showMessage('Customer deleted successfully.', 'success');
        this.router.navigate(['/sample/customers']);
      } catch (error) {
        console.error('Failed to delete customer:', error);
        this.messagesService.showMessage('Failed to delete customer.', 'danger');
      }
    }
  }

  /**
   * Format boolean as Yes/No for display
   */
  formatYesNo(value: boolean | FormHandling | undefined): string {
    // Handle FormHandling object (extract the value)
    if (value && typeof value === 'object' && 'value' in value) {
      return value.value ? 'Yes' : 'No';
    }
    // Handle plain boolean
    return value ? 'Yes' : 'No';
  }
}
