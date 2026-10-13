"use client";

import { useState } from "react";
import { Button } from "@/design-system";
import { Loader2, MapPin, Truck, CreditCard, Edit, Mail } from "lucide-react";
import { useCheckout } from "@/features/checkout/hooks/use-checkout";
import { placeOrder as placeOrderAction } from "@/features/checkout/services/checkout.actions";
import { Price } from "@/components/shared/price";
import { useT } from "@/lib/i18n/provider";

interface ReviewStepProps {
  onEditStep: (step: "contact" | "shipping" | "delivery" | "payment") => void;
}

export default function ReviewStep({ onEditStep }: ReviewStepProps) {
  const { order, paymentMethods, selectedPaymentMethodCode, isGuest } = useCheckout();
  const [loading, setLoading] = useState(false);
  const t = useT();
  const r = t.checkout.review;

  const selectedPaymentMethod = paymentMethods.find(
    (method) => method.code === selectedPaymentMethodCode
  );

  const handlePlaceOrder = async () => {
    if (!selectedPaymentMethodCode) return;

    setLoading(true);
    try {
      await placeOrderAction(selectedPaymentMethodCode);
    } catch (error) {
      if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
        throw error;
      }
      console.error("Error placing order:", error);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-lg">{r.title}</h3>

      <div
        className={`grid grid-cols-1 gap-6 ${isGuest ? "md:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-3"}`}
      >
        {isGuest && order.customer && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <h4 className="font-medium">{r.contact}</h4>
            </div>
            <div className="text-sm space-y-3">
              <div>
                <p className="font-medium">
                  {order.customer.firstName} {order.customer.lastName}
                </p>
                <p className="text-muted-foreground">{order.customer.emailAddress}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => onEditStep("contact")}>
                <Edit className="h-4 w-4 mr-1" />
                {t.common.edit}
              </Button>
            </div>
          </div>
        )}

        {/* Shipping Address */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <h4 className="font-medium">{r.shippingAddress}</h4>
          </div>
          {order.shippingAddress ? (
            <div className="text-sm space-y-3">
              <div>
                <p className="font-medium">{order.shippingAddress.fullName}</p>
                <p className="text-muted-foreground">
                  {order.shippingAddress.streetLine1}
                  {order.shippingAddress.streetLine2 && `, ${order.shippingAddress.streetLine2}`}
                </p>
                <p className="text-muted-foreground">
                  {order.shippingAddress.city}, {order.shippingAddress.province}{" "}
                  {order.shippingAddress.postalCode}
                </p>
                <p className="text-muted-foreground">{order.shippingAddress.country}</p>
                <p className="text-muted-foreground">{order.shippingAddress.phoneNumber}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => onEditStep("shipping")}>
                <Edit className="h-4 w-4 mr-1" />
                {t.common.edit}
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{r.noShippingAddress}</p>
          )}
        </div>

        {/* Delivery Method */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-muted-foreground" />
            <h4 className="font-medium">{r.deliveryMethod}</h4>
          </div>
          {order.shippingLines && order.shippingLines.length > 0 ? (
            <div className="text-sm space-y-3">
              <div>
                <p className="font-medium">{order.shippingLines[0].shippingMethod.name}</p>
                <p className="text-muted-foreground">
                  {order.shippingLines[0].priceWithTax === 0 ? (
                    t.common.free
                  ) : (
                    <Price
                      value={order.shippingLines[0].priceWithTax}
                      currencyCode={order.currencyCode}
                    />
                  )}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => onEditStep("delivery")}>
                <Edit className="h-4 w-4 mr-1" />
                {t.common.edit}
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{r.noDeliveryMethod}</p>
          )}
        </div>

        {/* Payment Method */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <h4 className="font-medium">{r.paymentMethod}</h4>
          </div>
          {selectedPaymentMethod ? (
            <div className="text-sm space-y-3">
              <div>
                <p className="font-medium">{selectedPaymentMethod.name}</p>
                {selectedPaymentMethod.description && (
                  <p className="text-muted-foreground mt-1">{selectedPaymentMethod.description}</p>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={() => onEditStep("payment")}>
                <Edit className="h-4 w-4 mr-1" />
                {t.common.edit}
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{r.noPaymentMethod}</p>
          )}
        </div>
      </div>

      <Button
        onClick={handlePlaceOrder}
        disabled={
          loading ||
          !order.shippingAddress ||
          !order.shippingLines?.length ||
          !selectedPaymentMethodCode
        }
        size="lg"
        className="w-full"
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {r.placeOrder}
      </Button>

      {(!order.shippingAddress || !order.shippingLines?.length || !selectedPaymentMethodCode) && (
        <p className="text-sm text-destructive text-center">{r.incomplete}</p>
      )}
    </div>
  );
}
