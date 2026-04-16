import { NextConfig } from "next";

function parseRemotePattern(urlValue?: string) {
  if (!urlValue) {
    return null;
  }

  try {
    const parsed = new URL(urlValue);
    return {
      protocol: parsed.protocol.replace(":", ""),
      hostname: parsed.hostname,
      port: parsed.port || "",
    };
  } catch {
    return null;
  }
}

const envRemotePatterns = [
  parseRemotePattern(process.env.NEXT_PUBLIC_VENDURE_SHOP_API_URL),
  parseRemotePattern(process.env.VENDURE_SHOP_API_URL),
  parseRemotePattern(process.env.NEXT_PUBLIC_VENDURE_API_URL),
  parseRemotePattern(process.env.ASSET_URL_PREFIX),
].filter((pattern) => pattern !== null);

const baseRemotePatterns = [
  {
    hostname: "readonlydemo.vendure.io",
  },
  {
    hostname: "demo.vendure.io",
  },
  {
    hostname: "localhost",
  },
  {
    hostname: "b2b-aria-maniadis.onrender.com",
  },
];

const remotePatterns = [...baseRemotePatterns, ...envRemotePatterns];

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    // This is necessary to display images from your local Vendure instance
    dangerouslyAllowLocalIP: true,
    remotePatterns,
  },
  experimental: {
    rootParams: true,
  },
};

export default nextConfig;
