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

export type FormatterType = 'text' | 'currency' | 'percentage' | 'number';

export interface ColumnConfig {
    column: keyof PriceBookItem;
    label: string;
    formatter: FormatterType;
    formatOptions?: Intl.NumberFormatOptions;
    filterable?: boolean; // Add filterable flag - defaults to true if not specified
    sortable?: boolean; // Add sortable flag - defaults to true if not specified
}
// Column configuration - co-located with the model
export const PRICE_BOOK_COLUMN_CONFIG: ColumnConfig[] = [
    { column: 'category', label: 'Category', formatter: 'text', filterable: true },
    { column: 'item', label: 'Item Number', formatter: 'text', filterable: false },
    { column: 'description', label: 'Description', formatter: 'text', filterable: false },
    { column: 'size', label: 'Size', formatter: 'text', filterable: false },
    { column: 'um', label: 'UM', formatter: 'text', filterable: false },
    { column: 'retailUnits', label: 'Retail Units', formatter: 'text', filterable: false }, // Not typically filtered
    {
        column: 'wholesaleCost',
        label: 'Wholesale Cost',
        formatter: 'currency',
        formatOptions: { minimumFractionDigits: 2, maximumFractionDigits: 2 },
        filterable: false // Currency values better handled with range filters
    },
    {
        column: 'unitRetail',
        label: 'Unit Retail',
        formatter: 'currency',
        formatOptions: { minimumFractionDigits: 2, maximumFractionDigits: 2 },
        filterable: false // Currency values better handled with range filters
    },
    {
        column: 'margin',
        label: 'Margin',
        formatter: 'percentage',
        formatOptions: { minimumFractionDigits: 1, maximumFractionDigits: 1 },
        filterable: false // Percentage values better handled with range filters
    },
    { column: 'rank', label: 'Rank', formatter: 'number', filterable: false } // Rank typically not filtered
];