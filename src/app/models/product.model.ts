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