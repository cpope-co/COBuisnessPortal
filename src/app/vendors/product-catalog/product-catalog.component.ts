import { JsonPipe, TitleCasePipe } from '@angular/common';
import { Component, computed, effect, inject, signal, ViewChild } from '@angular/core';
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
import { MatSelectModule } from '@angular/material/select';
import { FilterService } from '../../services/filter.service';
import { FiltersComponent } from "../../shared/filters/filters.component";
import { FilterConfig, TableColumn, TableConfig } from '../../shared/table/table.component';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { MatDialog } from '@angular/material/dialog';
import { openProductDialog } from '../product-dialog/product-dialog.component';
import { TableComponent } from '../../shared/table/table.component';

@Component({
    selector: 'app-product-catalog',
    animations: [],
    imports: [
        RouterModule,
        MatCardModule,
        MatIconModule,
        MatButtonModule,
        TableComponent,
    ],
    templateUrl: './product-catalog.component.html',
    styleUrl: './product-catalog.component.scss'
})

export class ProductCatalogComponent {

  productCatalogService = inject(ProductCatalogService);
  productCategoryService = inject(ProductCategoryService);
  messagesService = inject(MessagesService);
  dialog = inject(MatDialog);

  productsSignal = signal<Product[]>([]);
  products = this.productsSignal.asReadonly();

  productCategoriesSignal = signal<ProductCategory[]>([]);
  productCategories = this.productCategoriesSignal.asReadonly();

  // Table configuration
  tableColumns: TableColumn[] = [
    {
      column: 'SKU', 
      label: 'SKU',
      sortable: true,
      filterable: true
    },
    {
      column: 'manufacturerSKU', 
      label: 'Manufacturer SKU',
      sortable: true,
      filterable: true
    },
    {
      column: 'categoryID', 
      label: 'Category',
      sortable: true,
      filterable: true,
      formatter: (value: any) => this.getCategoryName(value)
    },
    {
      column: 'description', 
      label: 'Description',
      sortable: true,
      filterable: true
    },
    {
      column: 'size', 
      label: 'Size',
      sortable: true,
      filterable: true
    },
    {
      column: 'unitOfMeasurement', 
      label: 'Unit',
      sortable: true,
      filterable: true
    },
    {
      column: 'supplierID', 
      label: 'Supplier',
      sortable: true,
      filterable: true
    },
    {
      column: 'cost', 
      label: 'Cost',
      sortable: true,
      filterable: true
    },
  ];

  tableConfig: TableConfig = {
    showFilter: true,
    showAdvancedFilters: true,
    showPagination: true,
    pageSize: 10,
    pageSizeOptions: [10, 25, 50, 100],
    showFirstLastButtons: true,
    clickableRows: true
  };
  productCatalogFilters: any;

  getCategoryName(categoryID: string): string {
    const category = this.productCategories().find(cat => cat.id === categoryID);
    return category ? category.name : 'Unknown';
  }

  constructor() {
    this.loadProducts();
    this.loadProductCategories();
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

  async onViewProduct(product: Product) {
    const dialogRef = await openProductDialog(
      this.dialog,
      {
        mode: 'view',
        title: 'View Product',
        product: product
      }
    );
    if (!dialogRef) {
      return;
    }
  }
}
