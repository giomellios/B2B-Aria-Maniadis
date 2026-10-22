import Image from "next/image";
import { FragmentOf, readFragment } from "@/lib/api/graphql";
import { ProductCardFragment } from "@/features/catalog/services/fragments";
import { Price } from "@/components/shared/price";
import { Suspense } from "react";
import { Link } from "@/lib/i18n/navigation";
import { Msg } from "@/lib/i18n/msg";
import { resolveVendureAssetUrl } from "@/lib/utils";

interface ProductCardProps {
  product: FragmentOf<typeof ProductCardFragment>;
  fallbackImageUrl?: string | null;
}

export function ProductCard({ product: productProp, fallbackImageUrl }: ProductCardProps) {
  const product = readFragment(ProductCardFragment, productProp);
  const productImageUrl = resolveVendureAssetUrl(
    product.productAsset?.preview || product.productVariantAsset?.preview || fallbackImageUrl
  );

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-white">
        {productImageUrl ? (
          <Image
            src={productImageUrl}
            alt={product.productName}
            fill
            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          // No photograph yet: the catalogue code, as it is printed in the catalogue.
          <div className="flex h-full w-full flex-col justify-between bg-card p-4 transition-colors duration-300 group-hover:bg-accent">
            <span className="text-[clamp(1.75rem,3.2vw,2.5rem)] font-semibold leading-none tracking-[-0.02em]">
              {product.sku.split("-")[0]}
            </span>
            <span className="text-sm text-muted-foreground">
              <Msg k="common.noImage" />
            </span>
          </div>
        )}
        {!product.inStock && (
          <span className="absolute left-0 top-3 bg-foreground px-2 py-1 text-sm font-medium text-background">
            <Msg k="catalog.outOfStock" />
          </span>
        )}
      </div>
      <div className="space-y-1.5 pt-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm tabular-nums text-muted-foreground">{product.sku}</p>
          {product.inStock && (
            <span className="flex shrink-0 items-center gap-1.5 text-sm text-muted-foreground">
              <span className="size-1.5 rounded-full bg-success" aria-hidden />
              <Msg k="catalog.inStock" />
            </span>
          )}
        </div>
        <h3 className="line-clamp-2 text-base font-medium leading-snug text-foreground">
          <span className="underline decoration-transparent decoration-2 underline-offset-4 transition-[text-decoration-color] duration-300 group-hover:decoration-gold">
            {product.productName}
          </span>
        </h3>
        {product.productVariantName && product.productVariantName !== product.productName ? (
          <p className="line-clamp-1 text-sm text-muted-foreground">{product.productVariantName}</p>
        ) : null}
        <Suspense fallback={<div className="h-6 w-24 rounded bg-muted"></div>}>
          <p className="pt-1 text-base font-semibold tabular-nums text-foreground">
            {product.priceWithTax.__typename === "PriceRange" ? (
              product.priceWithTax.min !== product.priceWithTax.max ? (
                <>
                  <span className="text-sm font-normal text-muted-foreground">
                    <Msg k="catalog.from" />{" "}
                  </span>
                  <Price value={product.priceWithTax.min} currencyCode={product.currencyCode} />
                </>
              ) : (
                <Price value={product.priceWithTax.min} currencyCode={product.currencyCode} />
              )
            ) : product.priceWithTax.__typename === "SinglePrice" ? (
              <Price value={product.priceWithTax.value} currencyCode={product.currencyCode} />
            ) : null}
          </p>
        </Suspense>
      </div>
    </Link>
  );
}
