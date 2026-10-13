import type { Metadata } from "next";
import { ProductImageCarousel, ProductInfo } from "@/features/catalog";
import { RelatedProducts, getProductData } from "@/features/catalog/server";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/design-system";
import { notFound } from "next/navigation";
import { getLocale, getT } from "@/lib/i18n/server";
import { format } from "@/lib/i18n/dictionaries";
import { Link } from "@/lib/i18n/navigation";
import { Award, Leaf, ShieldCheck, ChevronRight } from "lucide-react";
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
  const locale = await getLocale();
  const t = await getT();
  const result = await getProductData(slug, locale);
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

  const [result, t] = await Promise.all([getProductData(slug, await getLocale()), getT()]);

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
      <div className="container mx-auto mt-16 px-4 pt-6 pb-16 md:pb-24">
        {/* Breadcrumb */}
        <nav
          aria-label={t.product.breadcrumb}
          className="mb-8 flex items-center gap-1.5 text-xs text-muted-foreground"
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

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          {/* Left Column: Image Carousel */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <ProductImageCarousel images={productImages} variantImages={variantImages} />
          </div>

          {/* Right Column: Product Info */}
          <div>
            <ProductInfo product={product} searchParams={searchParamsResolved} />
          </div>
        </div>
      </div>

      {/* Product Benefits Section */}
      {/* TODO: Placeholder copy from the starter template — replace with Maniadis's real terms */}
      <section className="border-y border-border bg-secondary">
        <div className="container mx-auto grid grid-cols-1 px-4 md:grid-cols-3">
          {[
            {
              icon: Award,
              title: t.product.benefits.quality,
              text: t.product.benefits.qualityText,
            },
            {
              icon: Leaf,
              title: t.product.benefits.eco,
              text: t.product.benefits.ecoText,
            },
            {
              icon: ShieldCheck,
              title: t.product.benefits.guarantee,
              text: t.product.benefits.guaranteeText,
            },
          ].map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="flex items-start gap-4 border-b border-border py-8 last:border-b-0 md:border-b-0 md:border-l md:px-8 md:first:border-l-0 md:first:pl-0"
            >
              <Icon className="mt-0.5 size-5 shrink-0 text-primary" strokeWidth={1.5} />
              <div className="space-y-1">
                <h3 className="font-serif text-lg text-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Store FAQ Section */}
      {/* TODO: Placeholder copy from the starter template — replace with Maniadis's real terms */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto grid gap-10 px-4 md:grid-cols-[0.8fr_1.2fr] md:gap-16">
          <div className="space-y-3">
            <p className="eyebrow">{t.product.faq.eyebrow}</p>
            <h2 className="display text-4xl">{t.product.faq.title}</h2>
          </div>
          <Accordion type="single" collapsible className="w-full border-t border-border">
            {(
              [
                ["shipping", t.product.faq.shippingQ, t.product.faq.shippingA],
                ["returns", t.product.faq.returnsQ, t.product.faq.returnsA],
                ["tracking", t.product.faq.trackingQ, t.product.faq.trackingA],
                ["international", t.product.faq.internationalQ, t.product.faq.internationalA],
              ] as const
            ).map(([value, question, answer]) => (
              <AccordionItem key={value} value={value}>
                <AccordionTrigger>{question}</AccordionTrigger>
                <AccordionContent>{answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {primaryCollection && (
        <RelatedProducts collectionSlug={primaryCollection.slug} currentProductId={product.id} />
      )}
    </>
  );
}
