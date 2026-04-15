export type AssetVariantMappingStatus = 'MAPPED' | 'UNMATCHED' | 'FAILED';

export interface AssetVariantMappingItem {
    assetId: string;
    assetName: string;
    filenameToken: string;
    status: AssetVariantMappingStatus;
    variantId?: string;
    variantSku?: string;
    reason?: string;
}

export interface AssetVariantMappingResult {
    totalAssets: number;
    mappedAssets: number;
    unmatchedAssets: number;
    failedAssets: number;
    updatedVariants: number;
    messages: string[];
    items: AssetVariantMappingItem[];
}
