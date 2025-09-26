import { FormatterType, TableConfig, ColumnConfig } from '../../shared/table/table.component';

export type PriceBookItem = {
    category: string;
    item: string;
    description: string;
    size: string;
    um: string;
    retailUnits: string;
    wholesaleCost: number;
    unitRetail: number;
    margin: number;
    rank: number;
}

// Use the shared formatter functions map from table.component.ts
import { DEFAULT_FORMATTERS } from '../../shared/table/table.component';

// Price book specific column configuration type
export interface PriceBookColumnConfig extends ColumnConfig {
    column: keyof PriceBookItem;
}

// Column configuration - co-located with the model
export const PRICE_BOOK_COLUMN_CONFIG: PriceBookColumnConfig[] = [
    { column: 'category', label: 'Category', formatter: DEFAULT_FORMATTERS.get('text'), filterable: true },
    { column: 'item', label: 'Item Number', formatter: DEFAULT_FORMATTERS.get('text'), filterable: false },
    { column: 'description', label: 'Description', formatter: DEFAULT_FORMATTERS.get('text'), filterable: false },
    { column: 'size', label: 'Size', formatter: DEFAULT_FORMATTERS.get('text'), filterable: true },
    { column: 'um', label: 'UM', formatter: DEFAULT_FORMATTERS.get('text'), filterable: true },
    { column: 'retailUnits', label: 'Retail Units', formatter: DEFAULT_FORMATTERS.get('text'), filterable: false }, // Not typically filtered
    {
        column: 'wholesaleCost',
        label: 'Wholesale Cost',
        formatter: DEFAULT_FORMATTERS.get('currency'),
        formatOptions: { minimumFractionDigits: 2, maximumFractionDigits: 2 },
        filterable: false // Currency values better handled with range filters
    },
    {
        column: 'unitRetail',
        label: 'Unit Retail',
        formatter: DEFAULT_FORMATTERS.get('currency'),
        formatOptions: { minimumFractionDigits: 2, maximumFractionDigits: 2 },
        filterable: false // Currency values better handled with range filters
    },
    {
        column: 'margin',
        label: 'Margin',
        formatter: DEFAULT_FORMATTERS.get('percentage'),
        formatOptions: { minimumFractionDigits: 1, maximumFractionDigits: 1 },
        filterable: false // Percentage values better handled with range filters
    },
    { column: 'rank', label: 'Rank', formatter: DEFAULT_FORMATTERS.get('number'), filterable: false } // Rank typically not filtered
];

// Table configuration for price book
export const PRICE_BOOK_TABLE_CONFIG: TableConfig = {
    showAdvancedFilters: true, // Enable advanced filters
    showPagination: true,
    pageSize: 10,
    pageSizeOptions: [10, 25, 50, 100],
    showFirstLastButtons: true,
    clickableRows: true
};