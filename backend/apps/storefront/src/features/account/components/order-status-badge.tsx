"use client";

import { Badge } from "@/design-system";
import { useT } from "@/lib/i18n/provider";
import {
  ShoppingCart,
  CreditCard,
  Clock,
  CheckCircle,
  Truck,
  PackageCheck,
  Package,
  XCircle,
  type LucideIcon,
} from "lucide-react";

const STATUS_CONFIG: Record<string, { color: string; icon: LucideIcon }> = {
  AddingItems: {
    color: "border-border bg-secondary text-muted-foreground",
    icon: ShoppingCart,
  },
  ArrangingPayment: {
    color: "border-primary/20 bg-accent text-primary",
    icon: CreditCard,
  },
  PaymentAuthorized: {
    color: "border-primary/20 bg-accent text-primary",
    icon: Clock,
  },
  PaymentSettled: {
    color: "border-success/25 bg-success/10 text-success",
    icon: CheckCircle,
  },
  PartiallyShipped: {
    color: "border-primary/20 bg-accent text-primary",
    icon: Package,
  },
  Shipped: { color: "border-primary/20 bg-accent text-primary", icon: Truck },
  PartiallyDelivered: {
    color: "border-success/25 bg-success/10 text-success",
    icon: PackageCheck,
  },
  Delivered: {
    color: "border-success/25 bg-success/10 text-success",
    icon: PackageCheck,
  },
  Cancelled: {
    color: "border-destructive/25 bg-destructive/10 text-destructive",
    icon: XCircle,
  },
};

interface OrderStatusBadgeProps {
  state: string;
}

export function OrderStatusBadge({ state }: OrderStatusBadgeProps) {
  const t = useT();
  const config = STATUS_CONFIG[state] || {
    color: "border-border bg-secondary text-muted-foreground",
    icon: Clock,
  };
  const Icon = config.icon;

  return (
    <Badge className={config.color} variant="outline">
      <Icon className="h-3 w-3 mr-1" />
      {t.orderStatus[state] ?? state}
    </Badge>
  );
}
