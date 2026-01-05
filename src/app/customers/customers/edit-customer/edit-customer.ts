import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { SampleData, SampleDataPayload, sampleDataForm, UDCOption } from '../customer.model';
import { SampleApplicationService } from '../customers.service';
import { MessagesService } from '../../../messages/messages.service';
import { FormHandlingService } from '../../../services/form-handling.service';
import { SelectComponent } from '../../../shared/select/select.component';
import { CheckboxComponent } from '../../../shared/checkbox/checkbox.component';
import { LoseChangesDialogData } from '../../../shared/lose-changes-dialog/lose-changes-dialog.data.model';
import { LoseChangesDialogComponent } from '../../../shared/lose-changes-dialog/lose-changes-dialog.component';

@Component({
  selector: 'app-edit-customer',
  imports: [
    MatCardModule,
    MatButtonModule,
    ReactiveFormsModule,
    SelectComponent,
    CheckboxComponent
  ],
  templateUrl: './edit-customer.html',
  styleUrl: './edit-customer.scss',
})
export class EditCustomer {
  sampleApplicationService = inject(SampleApplicationService);
  formHandlerService = inject(FormHandlingService);
  messagesService = inject(MessagesService);
  router = inject(Router);
  activatedRoute = inject(ActivatedRoute);
  dialog = inject(MatDialog);

  // Form and model
  form!: FormGroup;
  customerForm: { [key: string]: any } = sampleDataForm;

  // Signal for customer data
  #customerSignal = signal<SampleData | null>(null);
  customer = this.#customerSignal.asReadonly();

  // UDC options for dropdown
  custTypeOptions: { id: string; name: string }[] = [];

  constructor() {
    this.loadCustomer();
    this.loadUDCOptions();
  }

  /**
   * Load customer data by ID from route params
   */
  async loadCustomer() {
    try {
      const id = +this.activatedRoute.snapshot.paramMap.get('id')!;
      const data = await this.sampleApplicationService.getSampleDataById(id);
      
      if (!data) {
        this.messagesService.showMessage('Customer not found.', 'danger');
        this.router.navigate(['/sample/customers']);
        return;
      }
      
      this.#customerSignal.set(data);
      
      // Build form after loading data
      this.form = this.formHandlerService.createFormGroup(this.customerForm);
      this.form.patchValue({
        CustTypeCode: data.CustTypeCode,
        CandyLiker: data.CandyLiker
      });
      this.form.markAsPristine();
      this.form.markAsUntouched();
    } catch (error) {
      console.error('Failed to load customer:', error);
      this.messagesService.showMessage('Failed to load customer.', 'danger');
      this.router.navigate(['/sample/customers']);
    }
  }

  /**
   * Load UDC options for customer type dropdown
   */
  async loadUDCOptions() {
    try {
      const options = await this.sampleApplicationService.loadUDCOptions();
      this.custTypeOptions = options.map(opt => ({
        id: opt.TypeCodeList,
        name: opt.TypeDescList
      }));
    } catch (error) {
      console.error('Failed to load UDC options:', error);
    }
  }

  /**
   * Save customer changes
   */
  async onSave() {
    try {
      if (this.form.invalid) {
        this.form.markAllAsTouched();
        this.messagesService.showMessage('Please correct the errors on the form.', 'danger');
        return;
      }

      const customer = this.customer();
      if (!customer) return;

      const payload: SampleDataPayload = {
        CustNum: customer.CustNumber,
        CustTypeCode: this.form.value.CustTypeCode,
        CandyLiker: this.form.value.CandyLiker
      };

      await this.sampleApplicationService.updateSampleData(payload);
      this.messagesService.showMessage('Customer updated successfully.', 'success');
      this.router.navigate(['/sample/customer', customer.CustNumber]);
    } catch (error) {
      console.error('Failed to save customer:', error);
      this.messagesService.showMessage('Failed to save customer.', 'danger');
    }
  }

  /**
   * Cancel editing and return to detail view
   */
  onCancel(event: MouseEvent) {
    event.stopPropagation();
    const customer = this.customer();
    if (!customer) return;

    if (this.form.touched || this.form.dirty) {
      const dialogRef = this.dialog.open(LoseChangesDialogComponent, {
        data: {
          title: 'Unsaved changes',
          message: 'Leaving this page will discard your changes. Do you want to continue?'
        }
      });
      
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.router.navigate(['/sample/customer', customer.CustNumber]);
        }
      });
      this.form.markAllAsTouched();
    } else {
      this.router.navigate(['/sample/customer', customer.CustNumber]);
    }
  }
}
