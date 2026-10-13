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
      <div className="relative aspect-square overflow-hidden rounded-md border border-border bg-white transition-colors duration-300 group-hover:border-primary/40">
        {productImageUrl ? (
          <Image
            src={productImageUrl}
            alt={product.productName}
            fill
            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-secondary text-xs uppercase tracking-[0.14em] text-muted-foreground">
            <Msg k="common.noImage" />
          </div>
        )}
        {!product.inStock && (
          <span className="absolute left-3 top-3 rounded-sm bg-background/90 px-2 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            <Msg k="catalog.outOfStock" />
          </span>
        )}
      </div>
      <div className="space-y-1.5 pt-4">
        <div className="flex items-center justify-between gap-3">
          <p className="font-mono text-[0.6875rem] tracking-wide text-muted-foreground">
            {product.sku}
          </p>
          {product.inStock && (
            <span className="flex items-center gap-1.5 text-[0.6875rem] text-muted-foreground">
              <span className="size-1.5 rounded-full bg-success" aria-hidden />
              <Msg k="catalog.inStock" />
            </span>
          )}
        </div>
        <h3 className="line-clamp-2 font-medium leading-snug text-foreground">
          <span className="underline decoration-transparent decoration-1 underline-offset-4 transition-[color,text-decoration-color] duration-300 group-hover:text-primary group-hover:decoration-primary/40">
            {product.productName}
          </span>
        </h3>
        {product.productVariantName && product.productVariantName !== product.productName ? (
          <p className="line-clamp-1 text-xs text-muted-foreground">{product.productVariantName}</p>
        ) : null}
        <Suspense fallback={<div className="h-6 w-24 rounded bg-muted"></div>}>
          <p className="pt-1 text-base font-semibold tabular-nums text-foreground">
            {product.priceWithTax.__typename === "PriceRange" ? (
              product.priceWithTax.min !== product.priceWithTax.max ? (
                <>
                  <span className="text-xs font-normal text-muted-foreground">
                    <Msg k="catalog.from" />{" "}
                  </span>
                  <Price value={product.priceWithTax.min} />
                </>
              ) : (
                <Price value={product.priceWithTax.min} />
              )
            ) : product.priceWithTax.__typename === "SinglePrice" ? (
              <Price value={product.priceWithTax.value} />
            ) : null}
          </p>
        </Suspense>
      </div>
    </Link>
  );
}
