// Image for an order line: the chosen variant's own image (e.g. its colour), else the product's image
export function getOrderLineImagePreview(variant: {
  featuredAsset?: { preview: string } | null;
  product: { featuredAsset?: { preview: string } | null };
}) {
  return variant.featuredAsset?.preview ?? variant.product.featuredAsset?.preview;
}
