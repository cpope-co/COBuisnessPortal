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
import { trigger, state, style, transition, animate } from '@angular/animations';
import { MatDialog } from '@angular/material/dialog';
import { openProductDialog } from '../product-dialog/product-dialog.component';
import { TableComponent } from '../../shared/table/table.component';

@Component({
    selector: 'app-product-catalog',
    animations: [],
    imports: [
        RouterModule,
        MatTableModule,
        MatCardModule,
        MatIconModule,
        MatButtonModule,
        MatPaginatorModule,
        MatSortModule,
        MatInputModule,
        MatSelectModule,
        FiltersComponent,
        TableComponent
    ],
    templateUrl: './product-catalog.component.html',
    styleUrl: './product-catalog.component.scss'
})

export class ProductCatalogComponent {


  productCatalogService = inject(ProductCatalogService);
  productCategoryService = inject(ProductCategoryService);
  messagesService = inject(MessagesService);
  filterService = inject(FilterService);
  dialog = inject(MatDialog);

  productsSignal = signal<Product[]>([]);
  products = this.productsSignal.asReadonly();
  productsDataSource = new MatTableDataSource<Product>(this.products());

  productCategoriesSignal = signal<ProductCategory[]>([]);
  productCategories = this.productCategoriesSignal.asReadonly();

  productCatalogFilters: any[] = [];

  form!: FormGroup<any>;

  displayedColumns: {column: string, label: string}[] = [
    {column: 'SKU', label: 'SKU'},
    {column: 'manufacturerSKU' , label: 'Manufacturer SKU'},
    {column: 'categoryID', label: 'Category'},
    {column: 'description', label: 'Description'},
    {column: 'size', label: 'Size'},
    {column: 'unitOfMeasurement', label: 'Unit'},
    {column: 'supplierID', label: 'Supplier'},
    {column: 'cost', label: 'Cost'},
  ];

  get displayedColumnNames() {
    return this.displayedColumns.map(col => col.column);
  }

  getMappedValue(column: string, value: any): string {
    if (column === 'categoryID') {
      return this.getCategoryName(value);
    }
    // Add more mappings if needed
    return value;
  }

  getCategoryName(categoryID: string): string {
    const category = this.productCategories().find(cat => cat.id === categoryID);
    return category ? category.name : 'Unknown';
  }

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
    effect(() => {
      this.productCatalogFilters = [
        {
          name: 'categoryID',
          label: 'Category',
          options: this.productCategories().map(category => {
            return {
              value: category.id,
              label: category.name
            };
          })
        },
        {
          name: 'manufacturerSKU',
          label: 'Manufacturer SKU',
          options: Array.from(new Set(this.products().map(product => product.manufacturerSKU)))
            .map(uniqueSKU => {
              return {
                value: uniqueSKU,
                label: uniqueSKU
              };
            })
        }
      ];
    });

    this.configFilterPredicate();
  }

  configFilterPredicate() {
    this.productsDataSource.filterPredicate = (data: Product, filter: string) => {
      const filters = JSON.parse(filter);

      let matchesCategory = true;
      let matchesManufacturerSKU = true;
      let matchesSearch = true;

      if (filters.search !== undefined) {
        const searchTerm = filters.search.toLowerCase();
        matchesSearch = this.displayedColumns.some(column => {
          const value = data[column as unknown as keyof Product]?.toString().toLowerCase() || '';
          return value.includes(searchTerm);
        });
      }

      if (filters.categoryID !== undefined) {
        matchesCategory = data.categoryID === Number(filters.categoryID) || filters.categoryID === -1;
      }

      if (filters.manufacturerSKU !== undefined) {
        matchesManufacturerSKU = data.manufacturerSKU === Number(filters.manufacturerSKU) || filters.manufacturerSKU === -1;
      }

      return matchesCategory && matchesManufacturerSKU && matchesSearch;
    };
  }
  setSearch(search: string) {
    const currentFilter = JSON.parse(this.productsDataSource.filter || '{}');
    currentFilter.search = search;
    this.productsDataSource.filter = JSON.stringify(currentFilter);
  }

  setFilter($event: any) {
    const currentFilter = JSON.parse(this.productsDataSource.filter || '{}');
    const filterType = $event.source.ariaLabel
    currentFilter[filterType] = filterType === 'categoryID' ? Number($event.value) : $event.value;
    this.productsDataSource.filter = JSON.stringify(currentFilter);
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
