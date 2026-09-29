import { SerializedRequestContext } from '@vendure/core';

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
    variantsUpdated: number;
    errors: string[];
}

export interface CsvImportJobData {
    ctx: SerializedRequestContext;
    fileName: string;
    /** Raw file bytes, base64-encoded (job data must be JSON-serialisable). */
    csvBase64: string;
}
