import { Component, effect, EventEmitter, input, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormField, MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-filters',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    FormsModule,
    MatInputModule,
    MatSelectModule,
    MatFormField
  ],
  templateUrl: './filters.component.html',
  styleUrl: './filters.component.scss'
})
export class FiltersComponent {

  search = output<string>({
    alias: 'searchOutput'
  });
  filter = output<string>({
    alias: 'filterOutput'
  });
  selected: string = '';
  filters = input<any>([]);

  constructor() {

  }

  updateSearch($event: KeyboardEvent): void {
    const inputElement = $event.target as HTMLInputElement;
    if (inputElement) {
      if (inputElement.value.length > 2 || inputElement.value.length === 0) { this.search.emit(inputElement.value); }
    }
  }
  onFilterChange($event: any): void {
    this.filter.emit($event);
  }

}
