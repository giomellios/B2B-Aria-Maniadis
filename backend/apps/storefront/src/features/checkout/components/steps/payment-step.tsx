"use client";

import { Button, RadioGroup, RadioGroupItem, Label, Card } from "@/design-system";
import { CreditCard } from "lucide-react";
import { useCheckout } from "@/features/checkout/hooks/use-checkout";
import { useT } from "@/lib/i18n/provider";

interface PaymentStepProps {
  onComplete: () => void;
}

export default function PaymentStep({ onComplete }: PaymentStepProps) {
  const { paymentMethods, selectedPaymentMethodCode, setSelectedPaymentMethodCode } = useCheckout();
  const t = useT().checkout.payment;

  const handleContinue = () => {
    if (!selectedPaymentMethodCode) return;
    onComplete();
  };

  if (paymentMethods.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">{t.none}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="font-semibold">{t.select}</h3>

      <RadioGroup
        value={selectedPaymentMethodCode || ""}
        onValueChange={setSelectedPaymentMethodCode}
      >
        {paymentMethods.map((method) => (
          <Label key={method.code} htmlFor={method.code} className="cursor-pointer">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <RadioGroupItem value={method.code} id={method.code} />
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="font-medium">{method.name}</p>
                  {method.description && (
                    <p className="text-sm text-muted-foreground mt-1">{method.description}</p>
                  )}
                </div>
              </div>
            </Card>
          </Label>
        ))}
      </RadioGroup>

      <Button onClick={handleContinue} disabled={!selectedPaymentMethodCode} className="w-full">
        {t.continue}
      </Button>
    </div>
  );
}
