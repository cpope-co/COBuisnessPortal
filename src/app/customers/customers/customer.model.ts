import { FormHandling } from "../../models/form-handling.model";
import { ColumnConfig, TableConfig } from "../../shared/table/table.component";
import { Validators } from "@angular/forms";

/**
 * Sample Data Model - represents customer data from multiple DB2 tables
 * Used for list view and detail view
 */
export type SampleData = {
    /** Customer Number (F0101.ABAN8) */
    CustNumber: number;
    /** Customer Name (F0102.ABALPH) */
    CustName: string;
    /** Customer Address - concatenated from F0116 (ALADD2|ALCTY1|ALADDS|ALADDS) */
    CustAddress: string;
    /** Customer Type Code (FSAMPLE.$S$CTY) - single character code */
    CustTypeCode: string | FormHandling;
    /** Customer Type Description - lookup from F0005 where DRSY='55' and DRRT='SP' */
    CustTypeDesc: string;
    /** Candy Liker flag (FSAMPLE.$S$CAN) - Y/N converted to boolean */
    CandyLiker: boolean | FormHandling;
}

/**
 * Payload for POST (create) and PUT (update) requests
 * CustNum is null for create (server generates), populated for update
 */
export type SampleDataPayload = {
    /** Customer Number (F55SAMPLE.$SAN8) - null for create, required for update */
    CustNum: number | null;
    /** Customer Type Code (F55SAMPLE.$S$CTY) - Valid values: A, B, C, D */
    CustTypeCode: string;
    /** Candy Liker (F55SAMPLE.$S$CAN) - boolean sent to API, stored as Y/N in DB */
    CandyLiker: boolean;
}

/**
 * User Defined Code (UDC) option from F0005 table
 * Retrieved from GET /SampleData/udc/55/SP
 */
export type UDCOption = {
    /** Type Code (F0005.DRKY) */
    TypeCodeList: string;
    /** Type Description (F0005.DRDL01) */
    TypeDescList: string;
}

/**
 * Lookup array for customer type options
 * Populated dynamically from GET /SampleData/udc/55/SP endpoint
 * Used by table formatter and detail form dropdown
 */
export let custTypeOptions: UDCOption[] = [];

/**
 * Helper function to get customer type description from code
 * @param code - Customer type code (A, B, C, D)
 * @param options - Array of UDC options
 * @returns Customer type description or empty string if not found
 */
function getCustTypeDesc(code: string, options: UDCOption[]): string {
    const option = options.find(opt => opt.TypeCodeList === code);
    return option ? option.TypeDescList : '';
}

/**
 * Helper function to format boolean as Yes/No
 * @param value - Boolean value
 * @returns 'Yes' or 'No'
 */
function formatYesNo(value: boolean): string {
    return value ? 'Yes' : 'No';
}

/**
 * Column configuration interface for SampleData table
 * Extends base ColumnConfig with type-safe column names
 */
export interface SampleDataColumnConfig extends ColumnConfig {
    column: keyof SampleData;
}

/**
 * Table column configuration for SampleData list view
 */
export const SAMPLE_DATA_COLUMN_CONFIG: SampleDataColumnConfig[] = [
    {
        column: 'CustNumber',
        label: 'Customer Number',
        filterable: true,
        sortable: true
    },
    {
        column: 'CustName',
        label: 'Customer Name',
        filterable: true,
        sortable: true
    },
    {
        column: 'CustAddress',
        label: 'Address',
        filterable: true,
        sortable: true
    },
    {
        column: 'CustTypeCode',
        label: 'Customer Type',
        filterable: true,
        sortable: true,
        formatter: (value: string) => getCustTypeDesc(value, custTypeOptions)
    },
    {
        column: 'CustTypeDesc',
        label: 'Type Description',
        filterable: true,
        sortable: true
    },
    {
        column: 'CandyLiker',
        label: 'Likes Candy',
        filterable: true,
        sortable: true,
        formatter: (value: boolean) => formatYesNo(value)
    }
];

/**
 * Table configuration for SampleData list view
 */
export const SAMPLE_DATA_TABLE_CONFIG: TableConfig = {
    showSearch: true,
    showAdvancedFilters: true,
    showPagination: true,
    pageSize: 10,
    pageSizeOptions: [10, 25, 50, 100],
    showFirstLastButtons: true,
    clickableRows: true
};

/**
 * FormHandling configuration for SampleData detail form
 * Only includes editable fields (CustTypeCode and CandyLiker)
 * Read-only fields (CustNumber, CustName, CustAddress, CustTypeDesc) are in signal but not in form
 */
export const sampleDataForm: Partial<SampleData> = {
    CustTypeCode: {
        Validators: [Validators.required],
        ErrorMessages: {
            'required': 'Please select a customer type.'
        },
        value: ''
    },
    CandyLiker: {
        Validators: [],
        ErrorMessages: {},
        value: false
    }
};
