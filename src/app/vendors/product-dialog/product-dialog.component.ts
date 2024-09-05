import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Product } from '../../models/product.model';
import { ProductDialogDataModel } from './product-dialog.data.model';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [
    MatDialogModule,
    CurrencyPipe
  ],
  templateUrl: './product-dialog.component.html',
  styleUrl: './product-dialog.component.scss'
})
export class ProductDialogComponent {
  dialogRef = inject(MatDialogRef);

  data: {mode: string; title: string; product: Product} = inject(MAT_DIALOG_DATA);

  constructor() {
  }
}

function createDefaultDialogConfig() {
  const config = new MatDialogConfig();
  config.disableClose = false;
  config.autoFocus = true;
  config.width = '400px';
  return config;
}

export function openProductDialog(dialog: MatDialog, data: ProductDialogDataModel) {
  const config = createDefaultDialogConfig();
  config.data = data;
  return dialog.open(ProductDialogComponent, config);
} 
