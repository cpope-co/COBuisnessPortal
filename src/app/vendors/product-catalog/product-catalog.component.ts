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
import { ProductCategoryService } from './product-category.service';
import { ProductCategory } from '../../models/product-category.model';
import { SelectComponent } from '../../shared/select/select.component';
import { FormGroup } from '@angular/forms';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatSelectionListChange } from '@angular/material/list';

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
    MatInputModule,
    MatSelectModule,
    SelectComponent
  ], 
  templateUrl: './product-catalog.component.html',
  styleUrl: './product-catalog.component.scss'
})

export class ProductCatalogComponent {


  productCatalogService = inject(ProductCatalogService);
  productCategoryService = inject(ProductCategoryService);
  messagesService = inject(MessagesService);

  productsSignal = signal<Product[]>([]);
  products = this.productsSignal.asReadonly();
  productsDataSource = new MatTableDataSource<Product>(this.products());

  productCategoriesSignal = signal<ProductCategory[]>([]);
  productCategories = this.productCategoriesSignal.asReadonly();

  form!: FormGroup<any>;
 
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
    this.loadProducts();
    this.loadProductCategories();
    effect(() => {
      this.productsDataSource.data = this.products();
      this.productsDataSource.sort = this.sort;
      this.productsDataSource.paginator = this.paginator;
    });
    this.productsDataSource.filterPredicate = (data: any, filter: string): boolean => {
      const transformedFilter = String(filter).trim().toLowerCase();
      // Example filter logic: check if any data property contains the filter string
      return Object.values(data).some(value => 
        String(value).toLowerCase().includes(transformedFilter)
      );
    };
  }

  applyFilter(event: Event | MatSelectChange): void {
    if(event instanceof MatSelectChange){
      const selectedCategoryId = event.value;
      console.log(selectedCategoryId);
      this.productsDataSource.filter = selectedCategoryId;
    } else if (event instanceof Event) {
      const filterValue = (event.target as HTMLInputElement).value;
      console.log(filterValue);
      this.productsDataSource.filter = filterValue.trim().toLowerCase();
    }
    
  }

  async loadProducts() {
    try {
      const products = await this.productCatalogService.loadAllProducts();
      this.productsSignal.set(products);
    } catch (error) {
      this.messagesService.showMessage('Failed to load products', 'danger');
    }
  }

  async loadProductCategories() {
    try {
      const productCategories = await this.productCategoryService.loadAllProductCategories();
      this.productCategoriesSignal.set(productCategories);
    } catch (error) {
      this.messagesService.showMessage('Failed to load product categories', 'danger');
    }
  }
}
