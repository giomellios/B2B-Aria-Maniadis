import { LanguageCode, PaymentMethodHandler } from "@vendure/core";

/**
 * Offline payments: the payment is recorded as Authorized (order → PaymentAuthorized) and the admin
 * settles it in the Dashboard once the money has arrived (deposit seen / courier paid).
 */
function offlinePaymentHandler(code: string, en: string, el: string) {
  return new PaymentMethodHandler({
    code,
    description: [
      { languageCode: LanguageCode.en, value: en },
      { languageCode: LanguageCode.el, value: el },
    ],
    args: {},
    createPayment: (_ctx, _order, amount) => ({
      amount,
      state: "Authorized" as const,
      metadata: {},
    }),
    settlePayment: () => ({ success: true }),
    cancelPayment: () => ({ success: true }),
  });
}

export const bankTransferPaymentHandler = offlinePaymentHandler(
  "bank-transfer-payment-handler",
  "Bank deposit (settled manually when the deposit arrives)",
  "Κατάθεση σε τράπεζα (εξόφληση χειροκίνητα όταν φτάσει η κατάθεση)"
);

export const cashOnDeliveryPaymentHandler = offlinePaymentHandler(
  "cash-on-delivery-payment-handler",
  "Cash on delivery (settled manually when the courier pays)",
  "Αντικαταβολή (εξόφληση χειροκίνητα όταν αποδοθεί το ποσό)"
);
