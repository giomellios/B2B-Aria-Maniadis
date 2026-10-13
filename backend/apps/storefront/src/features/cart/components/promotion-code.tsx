import {
  Button,
  Input,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/design-system";
import { Tag } from "lucide-react";
import { applyPromotionCode, removePromotionCode } from "@/features/cart/services/cart.actions";
import { getT } from "@/lib/i18n/server";

type ActiveOrder = {
  id: string;
  couponCodes?: string[] | null;
};

export async function PromotionCode({ activeOrder }: { activeOrder: ActiveOrder }) {
  const t = await getT();
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Tag className="h-5 w-5" />
          {t.cart.promoTitle}
        </CardTitle>
        <CardDescription>{t.cart.promoText}</CardDescription>
      </CardHeader>
      <CardContent>
        {activeOrder.couponCodes && activeOrder.couponCodes.length > 0 ? (
          <div className="space-y-2">
            {activeOrder.couponCodes.map((code) => (
              <div
                key={code}
                className="flex items-center justify-between p-3 border rounded-md bg-success/10"
              >
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-success" />
                  <span className="font-medium text-sm">{code}</span>
                </div>
                <form action={removePromotionCode}>
                  <input type="hidden" name="code" value={code} />
                  <Button
                    type="submit"
                    variant="ghost"
                    size="sm"
                    className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    {t.cart.remove}
                  </Button>
                </form>
              </div>
            ))}
          </div>
        ) : (
          <form action={applyPromotionCode} className="flex gap-2">
            <Input
              type="text"
              name="code"
              placeholder={t.cart.promoPlaceholder}
              className="flex-1"
              required
            />
            <Button type="submit">{t.cart.apply}</Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
