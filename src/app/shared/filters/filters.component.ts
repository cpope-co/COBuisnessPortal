import { JsonPipe } from '@angular/common';
import { Component, effect, EventEmitter, input, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormField, MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FilterConfig } from '../table/table.component';

@Component({
    selector: 'co-filters',
    imports: [
        MatButtonModule,
        MatIconModule,
        FormsModule,
        MatInputModule,
        MatSelectModule,
        MatFormField,
    ],
    templateUrl: './filters.component.html',
    styleUrl: './filters.component.scss'
})
export class FiltersComponent {

  // Inputs
  filterConfigs = input<FilterConfig[]>([]);

  // Outputs
  search = output<string>({
    alias: 'searchOutput'
  });
  filter = output<string>({
    alias: 'filterOutput'
  });
  filtersChanged = output<any>();
  
  selected: string = '';

  constructor() {
    
  }

  updateSearch($event: KeyboardEvent): void {
    const inputElement = $event.target as HTMLInputElement;
    if (inputElement && inputElement.value !== undefined) {
      if (inputElement.value.length > 2 || inputElement.value.length === 0) {
        this.search.emit(inputElement.value);
      } else {
        this.search.emit(inputElement.value);
      }
    }
  }
  
  onFilterChange(key: string, $event: any): void {
    const filterValue = {
      key: key,
      value: $event.value
    };
    this.filter.emit($event);
    this.filtersChanged.emit(filterValue);
  }

  onTextFilterChange(key: string, $event: KeyboardEvent): void {
    const inputElement = $event.target as HTMLInputElement;
    if (inputElement && inputElement.value !== undefined) {
      const filterValue = {
        key: key,
        value: inputElement.value
      };
      this.filtersChanged.emit(filterValue);
    }
  }

}
