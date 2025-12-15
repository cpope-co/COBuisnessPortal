import { ColumnConfig, TableConfig, DEFAULT_FORMATTERS } from '../shared/table/table.component';

export type Product = {
    SKU: number;
    manufacturerSKU: number;
    categoryID: number;
    description: string;
    size: string;
    unitOfMeasurement: number;
    supplierID: number;
    cost: number;
    UPCCodes: UPCCode[];
}

export type UPCCode = {
    retailUPC: string;
    wholesaleUPC: string;
}

// Product-specific column configuration
export interface ProductColumnConfig extends ColumnConfig {
    column: keyof Product;
}

// Column configuration for product catalog
export const PRODUCT_CATALOG_COLUMN_CONFIG: ProductColumnConfig[] = [
    {
        column: 'SKU',
        label: 'SKU',
        sortable: true,
        filterable: false,
        formatter: DEFAULT_FORMATTERS.get('text')
    },
    {
        column: 'manufacturerSKU',
        label: 'Manufacturer SKU', 
        sortable: true,
        filterable: false,
        formatter: DEFAULT_FORMATTERS.get('text')
    },
    {
        column: 'categoryID',
        label: 'Category',
        sortable: true,
        filterable: false,
        formatter: DEFAULT_FORMATTERS.get('number') // Note: This will need custom formatting for category names
    },
    {
        column: 'description',
        label: 'Description',
        sortable: true,
        filterable: false,
        formatter: DEFAULT_FORMATTERS.get('text')
    },
    {
        column: 'size',
        label: 'Size',
        sortable: true,
        filterable: false,
        formatter: DEFAULT_FORMATTERS.get('text')
    },
    {
        column: 'unitOfMeasurement',
        label: 'Unit',
        sortable: true,
        filterable: false,
        formatter: DEFAULT_FORMATTERS.get('number')
    },
    {
        column: 'supplierID',
        label: 'Supplier',
        sortable: true,
        filterable: false,
        formatter: DEFAULT_FORMATTERS.get('number')
    },
    {
        column: 'cost',
        label: 'Cost',
        sortable: true,
        filterable: false,
        formatter: DEFAULT_FORMATTERS.get('currency')
    }
];

// Table configuration for product catalog
export const PRODUCT_CATALOG_TABLE_CONFIG: TableConfig = {
    showSearch: false,
    showAdvancedFilters: false,
    showPagination: true,
    pageSize: 10,
    pageSizeOptions: [10, 25, 50, 100],
    showFirstLastButtons: true,
    clickableRows: true
};

export const AddProduct: Partial<Product> = {
}