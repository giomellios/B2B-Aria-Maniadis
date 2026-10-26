import type { Metadata } from "next";
import { ProductImageCarousel, ProductInfo } from "@/features/catalog";
import { RelatedProducts, getProductData } from "@/features/catalog/server";
import { getActiveCustomer, requireActiveCustomer } from "@/features/auth/server";
import { getAuthToken } from "@/lib/api/auth-token";
import { notFound } from "next/navigation";
import { getLocale, getT } from "@/lib/i18n/server";
import { format } from "@/lib/i18n/dictionaries";
import { Link } from "@/lib/i18n/navigation";
import { ChevronRight } from "@/design-system/icons";
import { TradeFaq } from "@/features/home/server";
import {
  SITE_NAME,
  truncateDescription,
  buildAlternates,
  buildCanonicalUrl,
  buildOgImages,
} from "@/lib/utils";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  // Products are for signed-in customers only, including their name and image in the page head
  if (!(await getActiveCustomer())) return {};
  const locale = await getLocale();
  const t = await getT();
  const result = await getProductData(slug, locale, await getAuthToken());
  const product = result.data.product;

  if (!product) {
    return {
      title: t.meta.productNotFound,
    };
  }

  const fallbackDescription = format(t.meta.shopProduct, { name: product.name, site: SITE_NAME });

  const description = truncateDescription(product.description);
  const ogImage = product.assets?.[0]?.preview;

  return {
    title: product.name,
    description: description || fallbackDescription,
    alternates: buildAlternates(`/product/${product.slug}`, locale),
    openGraph: {
      title: product.name,
      description: description || fallbackDescription,
      type: "website",
      url: buildCanonicalUrl(`/product/${product.slug}`, locale),
      images: buildOgImages(ogImage, product.name || t.meta.productImage),
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: description || fallbackDescription,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function ProductDetailPage({
  params,
  searchParams,
}: PageProps<"/[locale]/product/[slug]">) {
  const { slug } = await params;
  const searchParamsResolved = await searchParams;
  await requireActiveCustomer(`/product/${slug}`);

  const [result, t] = await Promise.all([
    getProductData(slug, await getLocale(), await getAuthToken()),
    getT(),
  ]);

  const product = result.data.product;

  if (!product) {
    notFound();
  }

  // Product gallery first, then any variant image that isn't in it, so every variant's image can be shown
  const productImages = [
    ...(product.assets.length > 0
      ? product.assets
      : product.featuredAsset
        ? [product.featuredAsset]
        : []),
    ...product.variants
      .map((variant) => variant.featuredAsset)
      .filter((asset): asset is NonNullable<typeof asset> => Boolean(asset)),
  ].filter((asset, index, list) => list.findIndex((item) => item.id === asset.id) === index);

  const variantImages = product.variants.flatMap((variant) =>
    variant.featuredAsset
      ? [
          {
            assetId: variant.featuredAsset.id,
            options: variant.options.map((option) => ({
              groupCode: option.group.code,
              optionCode: option.code,
            })),
          },
        ]
      : []
  );

  // Get the primary collection (prefer deepest nested / most specific)
  const primaryCollection =
    product.collections?.find((c) => c.parent?.id) ?? product.collections?.[0];

  return (
    <>
      <div className="frame mt-header pt-6 pb-16 md:pb-24">
        {/* Breadcrumb */}
        <nav
          aria-label={t.product.breadcrumb}
          className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground"
        >
          <Link href="/" className="transition-colors hover:text-primary">
            {t.nav.home}
          </Link>
          {primaryCollection && (
            <>
              <ChevronRight className="size-3" />
              <Link
                href={`/collection/${primaryCollection.slug}`}
                className="transition-colors hover:text-primary"
              >
                {primaryCollection.name}
              </Link>
            </>
          )}
          <ChevronRight className="size-3" />
          <span className="line-clamp-1 text-foreground">{product.name}</span>
        </nav>

        {productImages.length > 0 ? (
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-5">
            <div className="lg:sticky lg:top-sticky lg:col-span-6 lg:self-start">
              <ProductImageCarousel
                images={productImages}
                variantImages={variantImages}
                code={product.variants[0]?.sku.split("-")[0]}
              />
            </div>
            <div className="lg:col-span-6 lg:pl-8">
              <ProductInfo product={product} searchParams={searchParamsResolved} />
            </div>
          </div>
        ) : (
          <ProductInfo product={product} searchParams={searchParamsResolved} layout="split" />
        )}
      </div>

      <TradeFaq compact />

      {primaryCollection && (
        <RelatedProducts collectionSlug={primaryCollection.slug} currentProductId={product.id} />
      )}
    </>
  );
}
