"use client";

import { useState } from "react";
import { Button, RadioGroup, RadioGroupItem, Label, Card, Textarea } from "@/design-system";
import { toast } from "sonner";
import { Spinner, Truck } from "@/design-system/icons";
import { useRouter } from "next/navigation";
import { useCheckout } from "@/features/checkout/hooks/use-checkout";
import { useT } from "@/lib/i18n/provider";
import { Price } from "@/components/shared/price";
import { setShippingMethod as setShippingMethodAction } from "@/features/checkout/services/checkout.actions";

interface DeliveryStepProps {
  onComplete: () => void;
}

export default function DeliveryStep({ onComplete }: DeliveryStepProps) {
  const router = useRouter();
  const t = useT();
  const { shippingMethods, order } = useCheckout();
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(() => {
    // If order already has a shipping method selected, pre-select it
    if (order.shippingLines && order.shippingLines.length > 0) {
      return order.shippingLines[0].shippingMethod.id;
    }
    // Otherwise default to first method if there's only one
    return shippingMethods.length === 1 ? shippingMethods[0].id : null;
  });
  const [submitting, setSubmitting] = useState(false);
  // "Μεταφορική": the customer's own transport company (Order.customFields.carrierDetails).
  const [carrierDetails, setCarrierDetails] = useState(order.customFields?.carrierDetails ?? "");

  const selectedMethod = shippingMethods.find((method) => method.id === selectedMethodId);
  const needsCarrier = Boolean(selectedMethod?.customFields?.requiresCarrierDetails);
  const missingCarrier = needsCarrier && !carrierDetails.trim();

  const handleContinue = async () => {
    if (!selectedMethodId || missingCarrier) return;

    setSubmitting(true);
    try {
      const result = await setShippingMethodAction(
        selectedMethodId,
        needsCarrier ? carrierDetails : null
      );
      if (!result.success) {
        toast.error(t.checkout.errors.delivery, { description: result.error });
        return;
      }
      router.refresh();
      onComplete();
    } finally {
      setSubmitting(false);
    }
  };

  if (shippingMethods.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">{t.checkout.delivery.none}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="font-semibold">{t.checkout.delivery.select}</h3>

      <RadioGroup value={selectedMethodId || ""} onValueChange={setSelectedMethodId}>
        {shippingMethods.map((method) => (
          <Label key={method.id} htmlFor={method.id} className="cursor-pointer">
            <Card className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <RadioGroupItem value={method.id} id={method.id} />
                  <Truck className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{method.name}</p>
                    {method.description && (
                      <p className="text-sm text-muted-foreground mt-1">{method.description}</p>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-semibold">
                    {method.priceWithTax === 0 ? (
                      t.common.free
                    ) : (
                      <Price value={method.priceWithTax} currencyCode={order.currencyCode} />
                    )}
                  </p>
                </div>
              </div>
            </Card>
          </Label>
        ))}
      </RadioGroup>

      {needsCarrier && (
        <div className="space-y-2">
          <Label htmlFor="carrier-details" className="font-semibold">
            {t.checkout.delivery.carrier}
          </Label>
          <Textarea
            id="carrier-details"
            value={carrierDetails}
            placeholder={t.checkout.delivery.carrierPlaceholder}
            maxLength={500}
            required
            aria-invalid={missingCarrier || undefined}
            onChange={(e) => setCarrierDetails(e.target.value)}
          />
          {missingCarrier && (
            <p className="text-sm text-muted-foreground">{t.checkout.delivery.carrierRequired}</p>
          )}
        </div>
      )}

      <Button
        onClick={handleContinue}
        disabled={!selectedMethodId || missingCarrier || submitting}
        className="w-full"
      >
        {submitting && <Spinner className="mr-2 h-4 w-4 animate-spin" />}
        {t.checkout.delivery.continue}
      </Button>
    </div>
  );
}
