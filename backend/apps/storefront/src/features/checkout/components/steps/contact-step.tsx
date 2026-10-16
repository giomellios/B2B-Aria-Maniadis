"use client";

import { useState } from "react";
import {
  Button,
  Input,
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
  Alert,
  AlertDescription,
} from "@/design-system";
import { useForm } from "react-hook-form";
import { Spinner, AlertCircle } from "@/design-system/icons";
import { useRouter } from "next/navigation";
import { Link } from "@/lib/i18n/navigation";
import { useT } from "@/lib/i18n/provider";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import {
  setCustomerForOrder,
  SetCustomerForOrderResult,
} from "@/features/checkout/services/checkout.actions";

interface ContactStepProps {
  onComplete: () => void;
}

interface ContactFormData {
  emailAddress: string;
  firstName: string;
  lastName: string;
}

function getErrorMessage(error: SetCustomerForOrderResult, t: Dictionary["checkout"]["contact"]) {
  if (error.success) return null;

  switch (error.errorCode) {
    case "EMAIL_CONFLICT":
      return (
        <>
          {t.emailConflict}{" "}
          <Link href="/sign-in?redirectTo=/checkout" className="underline hover:no-underline">
            {t.signIn}
          </Link>{" "}
          {t.toContinue}
        </>
      );
    case "GUEST_CHECKOUT_DISABLED":
      return t.guestDisabled;
    case "NO_ACTIVE_ORDER":
      return (
        <>
          {t.cartEmpty}{" "}
          <Link href="/" className="underline hover:no-underline">
            {t.continueShopping}
          </Link>
        </>
      );
    default:
      return error.message;
  }
}

export default function ContactStep({ onComplete }: ContactStepProps) {
  const router = useRouter();
  const t = useT();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<SetCustomerForOrderResult | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormData>();

  const onSubmit = async (data: ContactFormData) => {
    setLoading(true);
    setError(null);

    try {
      const result = await setCustomerForOrder(data);

      if (result.success) {
        router.refresh();
        onComplete();
      } else {
        setError(result);
      }
    } catch (err) {
      console.error("Error setting customer:", err);
      setError({ success: false, errorCode: "UNKNOWN", message: t.common.unexpectedError });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        {t.checkout.contact.haveAccount}{" "}
        <Link
          href="/sign-in?redirectTo=/checkout"
          className="text-primary underline hover:no-underline"
        >
          {t.checkout.contact.signIn}
        </Link>
      </p>

      {error && !error.success && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{getErrorMessage(error, t.checkout.contact)}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
          <div className="grid grid-cols-2 gap-4">
            <Field className="col-span-2">
              <FieldLabel htmlFor="emailAddress">{t.auth.email} *</FieldLabel>
              <Input
                id="emailAddress"
                type="email"
                {...register("emailAddress", {
                  required: t.auth.validation.emailRequired,
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: t.auth.validation.email,
                  },
                })}
              />
              <FieldError>{errors.emailAddress?.message}</FieldError>
            </Field>

            <Field>
              <FieldLabel htmlFor="firstName">{t.auth.firstName} *</FieldLabel>
              <Input
                id="firstName"
                {...register("firstName", { required: t.auth.validation.firstNameRequired })}
              />
              <FieldError>{errors.firstName?.message}</FieldError>
            </Field>

            <Field>
              <FieldLabel htmlFor="lastName">{t.auth.lastName} *</FieldLabel>
              <Input
                id="lastName"
                {...register("lastName", { required: t.auth.validation.lastNameRequired })}
              />
              <FieldError>{errors.lastName?.message}</FieldError>
            </Field>
          </div>

          <Button type="submit" disabled={loading} className="w-full mt-4">
            {loading && <Spinner className="mr-2 h-4 w-4 animate-spin" />}
            {t.common.continue}
          </Button>
        </FieldGroup>
      </form>
    </div>
  );
}
