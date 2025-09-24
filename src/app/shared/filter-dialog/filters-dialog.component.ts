import { Component, inject, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FilterConfig } from '../table/table.component';
import { InputComponent } from '../input/input.component';
import { SelectComponent } from '../select/select.component';

@Component({
  selector: 'co-filters-dialog',
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    InputComponent,
    SelectComponent,
  ],
  templateUrl: './filters-dialog.component.html',
  styleUrl: './filters-dialog.component.scss'
})
export class FiltersDialogComponent {
  filtersForm!: FormGroup;
  private fb = inject(FormBuilder);

  constructor(
    public dialogRef: MatDialogRef<FiltersDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { 
      filterConfigs: FilterConfig[], 
      currentFilters: any
    }
  ) {
    this.initializeForm();
  }

  private initializeForm(): void {
    const formControls: { [key: string]: any } = {};
    
    this.data.filterConfigs.forEach(config => {
      formControls[config.key] = [this.data.currentFilters[config.key] || ''];
    });

    this.filtersForm = this.fb.group(formControls);
  }

  apply(): void {
    this.dialogRef.close({
      action: 'apply',
      filters: this.filtersForm.value
    });
  }

  clearFilters(): void {
    this.filtersForm.reset();
    // Apply the cleared filters immediately
    this.dialogRef.close({
      action: 'clear'
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  // Helper method to get options in the format expected by co-select
  getSelectOptions(options: any[]): Array<{id: any, name: string}> {
    return [
      { id: '', name: 'All' },
      ...options.map(option => ({
        id: option,
        name: option.toString()
      }))
    ];
  }

  // Dummy model for form components (they expect this but we don't use validation here)
  get dummyModel() {
    return {};
  }
}