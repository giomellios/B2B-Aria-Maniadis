import { ASSET_API_URL } from "@/lib/config/env";

function getVendureAssetOrigins() {
  if (!ASSET_API_URL) {
    return { origin: "", assetsBase: "" };
  }

  try {
    const parsed = new URL(ASSET_API_URL);
    const origin = parsed.origin;
    return {
      origin,
      assetsBase: `${origin}/assets/`,
    };
  } catch {
    return { origin: "", assetsBase: "" };
  }
}

const vendureAssetOrigins = getVendureAssetOrigins();

export function resolveVendureAssetUrl(assetPath?: string | null): string {
  if (!assetPath) {
    return "";
  }

  if (/^https?:\/\//i.test(assetPath)) {
    return assetPath;
  }

  const normalizedPath = assetPath.replace(/^\/+/, "");

  if (assetPath.startsWith("/")) {
    if (vendureAssetOrigins.origin) {
      return `${vendureAssetOrigins.origin}/${normalizedPath}`;
    }
    return assetPath;
  }

  if (normalizedPath.startsWith("assets/")) {
    if (vendureAssetOrigins.origin) {
      return `${vendureAssetOrigins.origin}/${normalizedPath}`;
    }
    return `/${normalizedPath}`;
  }

  if (vendureAssetOrigins.assetsBase) {
    return `${vendureAssetOrigins.assetsBase}${normalizedPath}`;
  }

  return `/assets/${normalizedPath}`;
}

// Image for an order line: the chosen variant's own image (e.g. its colour), else the product's image
export function getOrderLineImagePreview(variant: {
  featuredAsset?: { preview: string } | null;
  product: { featuredAsset?: { preview: string } | null };
}) {
  return variant.featuredAsset?.preview ?? variant.product.featuredAsset?.preview;
}
