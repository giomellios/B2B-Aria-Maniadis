"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createRegistrationSchema,
  type RegistrationFormData,
} from "@/features/auth/schemas/registration.schema";
import { registerAction } from "@/features/auth/services/register.actions";
import { lookupVatNumber } from "@/features/auth/services/vies.actions";
import {
  DEFAULT_VIES_COUNTRY,
  VIES_COUNTRIES,
  isoRegion,
  normalizeVatNumber,
  type ViesCountry,
  type ViesLookupResult,
} from "@/features/auth/vies";
import {
  Button,
  Input,
  PasswordInput,
  Card,
  CardContent,
  CardFooter,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/design-system";
import { Lock, Spinner } from "@/design-system/icons";
import { Link } from "@/lib/i18n/navigation";
import { useLocale, useT } from "@/lib/i18n/provider";
import { INTL_LOCALE } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

interface RegistrationFormProps {
  redirectTo?: string;
  /** Prefill from the home page's "Open a trade account" bar. */
  initial?: { company?: string; emailAddress?: string };
}

type VatLookupState = { status: "idle" | "loading" } | ViesLookupResult;

/** A VAT number VIES confirmed, and which fields it filled in. */
type VerifiedVat = { key: string; company: boolean; address: boolean };

function vatKey(country: ViesCountry, vatNumber: string): string {
  return `${country}:${normalizeVatNumber(vatNumber, country)}`;
}

/** Company name / address taken from VIES: shown read-only, with a lock. */
const lockedInputClass =
  "cursor-default pr-11 text-muted-foreground hover:bg-field focus-visible:bg-field";
const lockIconClass =
  "pointer-events-none absolute top-1/2 right-3 size-5 -translate-y-1/2 text-muted-foreground";

export function RegistrationForm({ redirectTo, initial }: RegistrationFormProps) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const t = useT().auth;
  const locale = useLocale();
  const registrationSchema = useMemo(() => createRegistrationSchema(t.validation), [t]);
  const [vatLookup, setVatLookup] = useState<VatLookupState>({ status: "idle" });
  /** The country + number last sent to VIES, so blurring an unchanged field doesn't ask again. */
  const lastLookup = useRef("");
  /**
   * Set when VIES confirmed the VAT number: which fields it filled (those are read-only, since they
   * are the official register data) and for which country + number.
   */
  const [verified, setVerified] = useState<VerifiedVat | null>(null);

  // Greece first (almost every customer), then the other member states by name.
  const countries = useMemo(() => {
    const names = new Intl.DisplayNames([INTL_LOCALE[locale]], { type: "region" });
    const all = VIES_COUNTRIES.map((code) => ({ code, name: names.of(isoRegion(code)) ?? code }));
    const [greece, ...rest] = all;
    return [greece, ...rest.sort((a, b) => a.name.localeCompare(b.name, INTL_LOCALE[locale]))];
  }, [locale]);

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      emailAddress: initial?.emailAddress ?? "",
      firstName: "",
      lastName: "",
      country: DEFAULT_VIES_COUNTRY,
      vatNumber: "",
      company: initial?.company ?? "",
      address: "",
      mobileNumber: "",
      password: "",
      confirmPassword: "",
    },
  });

  const currentVatKey = () => {
    const { country, vatNumber } = form.getValues();
    return vatKey(country, vatNumber);
  };

  /**
   * The VAT number or country changed after VIES confirmed the old one: its company name and
   * address no longer apply, so clear them and make them editable again.
   */
  const releaseIfVatChanged = () => {
    if (!verified || currentVatKey() === verified.key) {
      return;
    }
    const clear = { shouldDirty: true } as const;
    if (verified.company) form.setValue("company", "", clear);
    if (verified.address) form.setValue("address", "", clear);
    setVerified(null);
    setVatLookup({ status: "idle" });
    lastLookup.current = "";
  };

  /** Asks VIES about the VAT number and fills in the company name and address it returns. */
  const lookUpVat = async () => {
    const { country, vatNumber } = form.getValues();
    const number = normalizeVatNumber(vatNumber, country);
    const key = vatKey(country, vatNumber);
    if (number.length < 2 || key === lastLookup.current) {
      return;
    }
    lastLookup.current = key;
    setVatLookup({ status: "loading" });

    const result = await lookupVatNumber(country, number);
    // A newer lookup wins; and if the field changed meanwhile, this answer is for an old number.
    if (lastLookup.current !== key) {
      return;
    }
    if (currentVatKey() !== key) {
      lastLookup.current = "";
      setVatLookup({ status: "idle" });
      return;
    }
    if (result.status === "valid") {
      const fill = { shouldValidate: true, shouldDirty: true } as const;
      if (result.name) form.setValue("company", result.name, fill);
      if (result.address) form.setValue("address", result.address, fill);
      setVerified({ key, company: Boolean(result.name), address: Boolean(result.address) });
    } else {
      // Let the customer retry the same number (e.g. after VIES was down).
      lastLookup.current = "";
    }
    setVatLookup(result);
  };

  const vatMessage =
    vatLookup.status === "loading"
      ? t.register.vatLookup
      : vatLookup.status === "valid" && (vatLookup.name || vatLookup.address)
        ? t.register.vatFound
        : vatLookup.status === "invalid"
          ? t.register.vatNotFound
          : vatLookup.status === "unavailable"
            ? t.register.vatUnavailable
            : t.register.vatHint;

  const onSubmit = (data: RegistrationFormData) => {
    setServerError(null);

    startTransition(async () => {
      const formData = new FormData();
      formData.append("emailAddress", data.emailAddress.trim());
      formData.append("firstName", data.firstName.trim());
      formData.append("lastName", data.lastName.trim());
      formData.append("country", data.country);
      formData.append("vatNumber", data.vatNumber.trim());
      formData.append("company", data.company.trim());
      formData.append("address", data.address.trim());
      formData.append("mobileNumber", data.mobileNumber.trim());
      formData.append("password", data.password);

      const result = await registerAction(undefined, formData);
      if (result?.error) {
        setServerError(result.error);
      }
    });
  };

  const signInHref = redirectTo
    ? `/sign-in?redirectTo=${encodeURIComponent(redirectTo)}`
    : "/sign-in";

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-8 px-5 sm:px-6">
            <fieldset className="space-y-4">
              <legend className="mb-4 text-base font-semibold">{t.register.business}</legend>
              <div className="grid gap-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.country}</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          releaseIfVatChanged();
                          void lookUpVat();
                        }}
                        disabled={isPending}
                      >
                        <FormControl>
                          <SelectTrigger className="h-11 w-full bg-field text-base">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {countries.map((c) => (
                            <SelectItem key={c.code} value={c.code}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vatNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.vatNumber}</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            type="text"
                            inputMode="text"
                            autoComplete="off"
                            disabled={isPending}
                            aria-busy={vatLookup.status === "loading"}
                            className="pr-11"
                            {...field}
                            onChange={(event) => {
                              field.onChange(event);
                              releaseIfVatChanged();
                            }}
                            onBlur={() => {
                              field.onBlur();
                              void lookUpVat();
                            }}
                          />
                        </FormControl>
                        {vatLookup.status === "loading" && (
                          <Spinner className="pointer-events-none absolute top-1/2 right-3 size-5 -translate-y-1/2 animate-spin text-muted-foreground" />
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <p
                aria-live="polite"
                className={cn(
                  "text-sm",
                  vatLookup.status === "invalid" || vatLookup.status === "unavailable"
                    ? "text-destructive"
                    : "text-muted-foreground"
                )}
              >
                {vatMessage}
              </p>
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.company}</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          type="text"
                          autoComplete="organization"
                          disabled={isPending}
                          readOnly={verified?.company}
                          className={cn(verified?.company && lockedInputClass)}
                          {...field}
                        />
                      </FormControl>
                      {verified?.company && <Lock aria-hidden className={lockIconClass} />}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.address}</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          type="text"
                          autoComplete="street-address"
                          disabled={isPending}
                          readOnly={verified?.address}
                          className={cn(verified?.address && lockedInputClass)}
                          {...field}
                        />
                      </FormControl>
                      {verified?.address && <Lock aria-hidden className={lockIconClass} />}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </fieldset>
            <fieldset className="space-y-4">
              <legend className="mb-4 text-base font-semibold">{t.register.person}</legend>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.firstName}</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder={t.firstNamePlaceholder}
                          disabled={isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.lastName}</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder={t.lastNamePlaceholder}
                          disabled={isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="mobileNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.mobileNumber}</FormLabel>
                    <FormControl>
                      <Input type="tel" disabled={isPending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </fieldset>
            <fieldset className="space-y-4">
              <legend className="mb-4 text-base font-semibold">{t.register.login}</legend>
              <FormField
                control={form.control}
                name="emailAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.email}</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder={t.emailPlaceholder}
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.password}</FormLabel>
                      <FormControl>
                        <PasswordInput
                          autoComplete="new-password"
                          placeholder="••••••••"
                          disabled={isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.confirmPassword}</FormLabel>
                      <FormControl>
                        <PasswordInput
                          autoComplete="new-password"
                          placeholder="••••••••"
                          disabled={isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </fieldset>

            {serverError && <div className="text-sm text-destructive">{serverError}</div>}

            <Button type="submit" variant="gold" size="lg" className="w-full" disabled={isPending}>
              {isPending ? t.register.submitting : t.register.submit}
            </Button>
          </CardContent>
          <CardFooter className="px-5 pt-2 sm:px-6">
            <div className="text-sm text-muted-foreground">
              {t.register.haveAccount}{" "}
              <Link
                href={signInHref}
                className="text-foreground underline underline-offset-4 hover:decoration-gold"
              >
                {t.register.signIn}
              </Link>
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
