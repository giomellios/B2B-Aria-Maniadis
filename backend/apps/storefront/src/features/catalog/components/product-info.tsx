"use client";

import { useState, useMemo, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button, Input, Label, RadioGroup, RadioGroupItem } from "@/design-system";
import { ShoppingBag, Check, Spinner, Minus, Plus } from "@/design-system/icons";
import { addToCart } from "@/features/cart";
import { toast } from "sonner";
import { Price } from "@/components/shared/price";
import { useT } from "@/lib/i18n/provider";
import { format } from "@/lib/i18n/dictionaries";
import { OrderMatrix } from "@/features/catalog/components/order-matrix";

interface ProductInfoProps {
  product: {
    id: string;
    name: string;
    description: string;
    variants: Array<{
      id: string;
      name: string;
      sku: string;
      currencyCode: string;
      priceWithTax: number;
      stockLevel: string;
      options: Array<{
        id: string;
        code: string;
        name: string;
        groupId: string;
        group: {
          id: string;
          code: string;
          name: string;
        };
      }>;
    }>;
    optionGroups: Array<{
      id: string;
      code: string;
      name: string;
      options: Array<{
        id: string;
        code: string;
        name: string;
      }>;
    }>;
  };
  searchParams: { [key: string]: string | string[] | undefined };
  /** "split": header and description beside the order matrix (used when there is no photograph). */
  layout?: "stack" | "split";
}

export function ProductInfo({ product, searchParams, layout = "stack" }: ProductInfoProps) {
  const pathname = usePathname();
  const router = useRouter();
  const currentSearchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isAdded, setIsAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const t = useT();

  // Initialize selected options from URL
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const initialOptions: Record<string, string> = {};

    // Load from URL search params
    product.optionGroups.forEach((group) => {
      const paramValue = searchParams[group.code];
      if (typeof paramValue === "string") {
        // Find the option by code
        const option = group.options.find((opt) => opt.code === paramValue);
        if (option) {
          initialOptions[group.id] = option.id;
        }
      }
    });

    return initialOptions;
  });

  // Follow option changes made elsewhere in the URL (e.g. picking an image selects its colour).
  // Adjusted during render when the URL changes, as React recommends instead of an effect.
  const [lastSearchParams, setLastSearchParams] = useState(currentSearchParams);
  if (currentSearchParams !== lastSearchParams) {
    setLastSearchParams(currentSearchParams);
    const fromUrl: Record<string, string> = {};
    product.optionGroups.forEach((group) => {
      const option = group.options.find((opt) => opt.code === currentSearchParams.get(group.code));
      if (option) {
        fromUrl[group.id] = option.id;
      }
    });
    const next = { ...selectedOptions, ...fromUrl };
    if (Object.keys(next).some((groupId) => next[groupId] !== selectedOptions[groupId])) {
      setSelectedOptions(next);
    }
  }

  // Find the matching variant based on selected options
  const selectedVariant = useMemo(() => {
    if (product.variants.length === 1) {
      return product.variants[0];
    }

    // If not all option groups have a selection, return null
    if (Object.keys(selectedOptions).length !== product.optionGroups.length) {
      return null;
    }

    // Find variant that matches all selected options
    return product.variants.find((variant) => {
      const variantOptionIds = variant.options.map((opt) => opt.id);
      const selectedOptionIds = Object.values(selectedOptions);
      return selectedOptionIds.every((optId) => variantOptionIds.includes(optId));
    });
  }, [selectedOptions, product.variants, product.optionGroups]);

  const handleOptionChange = (groupId: string, optionId: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [groupId]: optionId,
    }));

    // Find the option group and option to get their codes
    const group = product.optionGroups.find((g) => g.id === groupId);
    const option = group?.options.find((opt) => opt.id === optionId);

    if (group && option) {
      // Update URL with option code
      const params = new URLSearchParams(currentSearchParams);
      params.set(group.code, option.code);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }
  };

  const handleAddToCart = async () => {
    if (!selectedVariant || quantity < 1) return;

    startTransition(async () => {
      const result = await addToCart(selectedVariant.id, quantity);

      if (result.success) {
        setIsAdded(true);
        toast.success(t.product.added, {
          description: format(t.product.addedDescription, { qty: quantity, name: product.name }),
        });
        setQuantity(1);

        // Reset the added state after 2 seconds
        setTimeout(() => setIsAdded(false), 2000);
      } else {
        toast.error(t.product.addError, {
          description: result.error,
        });
      }
    });
  };

  const isInStock = selectedVariant && selectedVariant.stockLevel !== "OUT_OF_STOCK";
  // Catalogue code: the part of the SKU before the colour and finish (A1034-ΜΑΥΡΟ-ΚΕΝΤΗΜΑ → A1034).
  const productCode = product.variants[0]?.sku.split("-")[0] ?? "";
  const useMatrix =
    product.variants.length > 1 &&
    product.optionGroups.length >= 1 &&
    product.optionGroups.length <= 2;
  const canAddToCart = selectedVariant && isInStock;

  return (
    <div className={layout === "split" ? "grid gap-10 lg:grid-cols-12 lg:gap-5" : "space-y-8"}>
      <div className={layout === "split" ? "space-y-8 lg:col-span-5 lg:pr-8" : "space-y-8"}>
        {/* Product Title */}
        <div className="space-y-3">
          <h1 className="text-[1.75rem] font-semibold leading-[1.1] tracking-[-0.02em] md:text-[2rem]">
            {product.name}
          </h1>
          <p className="text-base text-muted-foreground">
            {t.product.matrix.code} <span className="font-medium text-gold">{productCode}</span>
            {" · "}
            {t.product.matrix.skus(product.variants.length)}
          </p>
        </div>

        {/* Product Description */}
        <div className="max-w-[60ch] text-base leading-relaxed [&_p+p]:mt-3">
          <div dangerouslySetInnerHTML={{ __html: product.description }} />
        </div>

        {layout === "split" && (
          <div className="flex h-36 flex-col justify-between rounded-xl bg-card p-5">
            <span className="text-[2.5rem] font-semibold leading-none tracking-[-0.02em]">
              {productCode}
            </span>
            <span className="text-base text-muted-foreground">{t.product.noImages}</span>
          </div>
        )}
      </div>
      <div className={layout === "split" ? "lg:col-span-7" : undefined}>
        {useMatrix ? (
          <OrderMatrix
            rows={product.optionGroups[0]}
            columns={product.optionGroups[1]}
            variants={product.variants}
          />
        ) : (
          renderSingleVariantOrder()
        )}
      </div>
    </div>
  );

  // A render function, not a component: defined in render, a component would remount (and lose
  // focus) on every keystroke.
  function renderSingleVariantOrder() {
    return (
      <div className="space-y-8">
        {selectedVariant && (
          <p className="text-2xl font-semibold tabular-nums">
            <Price
              value={selectedVariant.priceWithTax}
              currencyCode={selectedVariant.currencyCode}
            />
          </p>
        )}
        {/* Option Groups */}
        {product.optionGroups.length > 0 && (
          <div className="space-y-6">
            {product.optionGroups.map((group) => {
              const selectedName = group.options.find(
                (option) => option.id === selectedOptions[group.id]
              )?.name;
              return (
                <div key={group.id} className="space-y-3">
                  <Label className="text-sm font-semibold text-muted-foreground">
                    {group.name}
                    {selectedName && (
                      <span className="normal-case tracking-normal text-foreground">
                        &nbsp;· {selectedName}
                      </span>
                    )}
                  </Label>
                  <RadioGroup
                    value={selectedOptions[group.id] || ""}
                    onValueChange={(value) => handleOptionChange(group.id, value)}
                  >
                    <div className="flex flex-wrap gap-2">
                      {group.options.map((option) => (
                        <div key={option.id}>
                          <RadioGroupItem
                            value={option.id}
                            id={option.id}
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor={option.id}
                            className="flex h-10 min-w-12 cursor-pointer items-center justify-center rounded-md border border-input bg-card px-4 text-sm font-medium transition-[color,background-color,border-color,transform] duration-200 hover:border-foreground/40 active:scale-[0.97] peer-focus-visible:ring-4 peer-focus-visible:ring-primary/15 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground"
                          >
                            {option.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>
              );
            })}
          </div>
        )}

        {/* Quantity Selector + Add to Cart Button */}
        <div className="flex items-center gap-3 pt-2">
          <div className="flex shrink-0 items-center rounded-md border border-input bg-card">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-12 w-11 rounded-none rounded-l-md"
              aria-label={t.product.decrease}
              disabled={!canAddToCart || isPending || quantity <= 1}
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            >
              <Minus className="h-4 w-4" />
            </Button>

            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              aria-label={t.product.quantity}
              value={quantity}
              disabled={!canAddToCart || isPending}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, "");
                setQuantity(digits === "" ? 0 : Number(digits));
              }}
              onBlur={() => {
                if (!quantity || quantity < 1) setQuantity(1);
              }}
              className="h-12 w-14 rounded-none border-y-0 border-x bg-transparent text-center font-semibold tabular-nums shadow-none hover:border-input focus-visible:ring-0"
            />

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-12 w-11 rounded-none rounded-r-md"
              aria-label={t.product.increase}
              disabled={!canAddToCart || isPending}
              onClick={() => setQuantity((q) => q + 1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <Button
            size="lg"
            className="h-12 flex-1"
            disabled={!canAddToCart || isPending}
            onClick={handleAddToCart}
          >
            {isAdded ? (
              <span
                key="added"
                className="flex items-center gap-2 animate-in fade-in-0 zoom-in-95 duration-300"
              >
                <Check className="h-5 w-5" />
                {t.product.added}
              </span>
            ) : (
              <span key="add" className="flex items-center gap-2 animate-in fade-in-0 duration-300">
                {isPending ? (
                  <Spinner className="h-5 w-5 animate-spin" />
                ) : (
                  <ShoppingBag className="h-5 w-5" />
                )}
                {isPending
                  ? t.product.adding
                  : !selectedVariant && product.optionGroups.length > 0
                    ? t.product.selectOptions
                    : !isInStock
                      ? t.catalog.outOfStock
                      : t.product.addToCart}
              </span>
            )}
          </Button>
        </div>

        {/* SKU */}
        {selectedVariant && (
          <p className="font-mono text-xs tracking-wide text-muted-foreground">
            {t.common.sku} {selectedVariant.sku}
          </p>
        )}
      </div>
    );
  }
}
