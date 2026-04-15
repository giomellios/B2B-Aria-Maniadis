import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const vendureShopApiUrl =
  process.env.NEXT_PUBLIC_VENDURE_SHOP_API_URL ||
  process.env.VENDURE_SHOP_API_URL ||
  process.env.NEXT_PUBLIC_VENDURE_API_URL;

function getVendureAssetOrigins() {
  if (!vendureShopApiUrl) {
    return { origin: "", assetsBase: "" };
  }

  try {
    const parsed = new URL(vendureShopApiUrl);
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
