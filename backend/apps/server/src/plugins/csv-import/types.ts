export interface CsvRow {
    code: string;
    name: string;
    color: string;
    characteristic: string;
    priceWithTax: number;
    quantity: number;
}

export interface ImportResult {
    productsCreated: number;
    productsUpdated: number;
    variantsCreated: number;
    errors: string[];
}
