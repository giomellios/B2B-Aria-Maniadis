import { query } from "./api";
import { GetProductCardImageFallbackQuery } from "./queries";

function getFallbackPreview(product: {
  featuredAsset?: { preview: string } | null;
  assets?: Array<{ preview: string }> | null;
  variants?: Array<{ featuredAsset?: { preview: string } | null }> | null;
}) {
  if (product.featuredAsset?.preview) {
    return product.featuredAsset.preview;
  }

  const firstAsset = product.assets?.find((asset) => Boolean(asset.preview));
  if (firstAsset?.preview) {
    return firstAsset.preview;
  }

  const firstVariantAsset = product.variants?.find((variant) =>
    Boolean(variant.featuredAsset?.preview)
  );

  return firstVariantAsset?.featuredAsset?.preview;
}

export async function getProductCardImageFallbacks(slugs: string[]) {
  const uniqueSlugs = Array.from(new Set(slugs.filter(Boolean)));

  if (uniqueSlugs.length === 0) {
    return new Map<string, string>();
  }

  const entries = await Promise.all(
    uniqueSlugs.map(async (slug) => {
      try {
        const result = await query(GetProductCardImageFallbackQuery, { slug });
        const product = result.data.product;
        if (!product) {
          return [slug, null] as const;
        }

        const preview = getFallbackPreview(product);
        return [slug, preview ?? null] as const;
      } catch {
        return [slug, null] as const;
      }
    })
  );

  const fallbackMap = new Map<string, string>();

  for (const [slug, preview] of entries) {
    if (preview) {
      fallbackMap.set(slug, preview);
    }
  }

  return fallbackMap;
}
