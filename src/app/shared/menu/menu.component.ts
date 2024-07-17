import { Component, inject, input, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { RouterLink } from '@angular/router';
import { MenuItem } from './menu.model';

@Component({
  selector: 'co-menu',
  standalone: true,
  imports: [
    JsonPipe,
    MatListModule,
    RouterLink
  ],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent {

  menuItems = input<MenuItem[]>([]);

  constructor() {
  }


}
