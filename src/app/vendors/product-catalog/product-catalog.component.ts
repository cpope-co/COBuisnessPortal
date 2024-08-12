import { JsonPipe, TitleCasePipe } from '@angular/common';
import { Component, effect, inject, signal, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { Product } from '../../models/product.model';
import { ProductCatalogService } from './product-catalog.service';
import { MessagesService } from '../../messages/messages.service';

@Component({
  selector: 'app-product-catalog',
  standalone: true,
  imports: [
    RouterModule,
    JsonPipe,
    TitleCasePipe,
    MatTableModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule
  ], 
  templateUrl: './product-catalog.component.html',
  styleUrl: './product-catalog.component.scss'
})

export class ProductCatalogComponent {

  productCatalogService = inject(ProductCatalogService);
  messagesService = inject(MessagesService);

  productsSignal = signal<Product[]>([]);
  products = this.productsSignal.asReadonly();
  productsDataSource = new MatTableDataSource<Product>(this.products());

  displayedColumns: string[] = [
    'SKU',
    'manufacturerSKU',
    'categoryID',
    'description',
    'size',
    'unitOfMeasurement',
    'supplierID',
    'cost'
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  constructor() {
    // this.loadProducts();
    effect(() => {
      this.productsDataSource.data = this.products();
      this.productsDataSource.sort = this.sort;
      this.productsDataSource.paginator = this.paginator;
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.productsDataSource.filter = filterValue.trim().toLowerCase();
  }

  async loadProducts() {
    try {
      const products = await this.productCatalogService.loadAllProducts();
      this.productsSignal.set(products);
    } catch (error) {
      this.messagesService.showMessage('Failed to load products', 'danger');
    }
  }
}
