import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { Product, PRODUCT_CATALOG_COLUMN_CONFIG, PRODUCT_CATALOG_TABLE_CONFIG } from '../../models/product.model';
import { ProductCatalogService } from './product-catalog.service';
import { MessagesService } from '../../messages/messages.service';
import { ProductCategoryService } from './product-category.service';
import { ProductCategory } from '../../models/product-category.model';
import { TableColumn, TableConfig } from '../../shared/table/table.component';
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

  // Use table configuration from model  
  tableColumns: TableColumn[] = PRODUCT_CATALOG_COLUMN_CONFIG.map(config => ({
    ...config,
    // Override the categoryID formatter to show category names
    formatter: config.column === 'categoryID' ? 
      (value: any) => this.getCategoryName(value) : 
      config.formatter
  }));

  tableConfig: TableConfig = PRODUCT_CATALOG_TABLE_CONFIG;
  
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
