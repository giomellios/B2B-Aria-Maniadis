"use client";

import { useState } from "react";
import {
  Button,
  Input,
  Label,
  RadioGroup,
  RadioGroupItem,
  Card,
  Checkbox,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from "@/design-system";
import { useForm, Controller } from "react-hook-form";
import { Spinner } from "@/design-system/icons";
import { useRouter } from "next/navigation";
import { useCheckout } from "@/features/checkout/hooks/use-checkout";
import {
  setShippingAddress,
  createCustomerAddress,
} from "@/features/checkout/services/checkout.actions";
import { CountrySelect } from "@/components/shared/country-select";
import { useT } from "@/lib/i18n/provider";

interface ShippingAddressStepProps {
  onComplete: () => void;
}

interface AddressFormData {
  fullName: string;
  streetLine1: string;
  streetLine2?: string;
  city: string;
  province: string;
  postalCode: string;
  countryCode: string;
  phoneNumber: string;
  company?: string;
}

export default function ShippingAddressStep({ onComplete }: ShippingAddressStepProps) {
  const router = useRouter();
  const t = useT();
  const a = t.checkout.address;
  const { addresses, countries, order, isGuest } = useCheckout();
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(() => {
    if (order.shippingAddress) {
      const matchingAddress = addresses.find(
        (a) =>
          a.streetLine1 === order.shippingAddress?.streetLine1 &&
          a.postalCode === order.shippingAddress?.postalCode
      );
      if (matchingAddress) return matchingAddress.id;
    }
    const defaultAddress = addresses.find((a) => a.defaultShippingAddress);
    return defaultAddress?.id || null;
  });
  const [dialogOpen, setDialogOpen] = useState(addresses.length === 0 && !isGuest);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [useSameForBilling, setUseSameForBilling] = useState(true);

  const getDefaultFormValues = (): Partial<AddressFormData> => {
    const customerFullName = order.customer
      ? `${order.customer.firstName} ${order.customer.lastName}`.trim()
      : "";

    if (isGuest && order.shippingAddress?.streetLine1) {
      return {
        fullName: order.shippingAddress.fullName || customerFullName,
        streetLine1: order.shippingAddress.streetLine1 || "",
        streetLine2: order.shippingAddress.streetLine2 || "",
        city: order.shippingAddress.city || "",
        province: order.shippingAddress.province || "",
        postalCode: order.shippingAddress.postalCode || "",
        countryCode:
          countries.find((c) => c.name === order.shippingAddress?.country)?.code ||
          countries[0]?.code ||
          "US",
        phoneNumber: order.shippingAddress.phoneNumber || order.customer?.phoneNumber || "",
        company: order.shippingAddress.company || "",
      };
    }
    return {
      fullName: customerFullName,
      countryCode: countries[0]?.code || "US",
      phoneNumber: order.customer?.phoneNumber || "",
    };
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<AddressFormData>({
    defaultValues: getDefaultFormValues(),
  });

  const handleSelectExistingAddress = async () => {
    if (!selectedAddressId) return;

    setLoading(true);
    try {
      const selectedAddress = addresses.find((a) => a.id === selectedAddressId);
      if (!selectedAddress) return;

      await setShippingAddress(
        {
          fullName: selectedAddress.fullName || "",
          company: selectedAddress.company || "",
          streetLine1: selectedAddress.streetLine1,
          streetLine2: selectedAddress.streetLine2 || "",
          city: selectedAddress.city || "",
          province: selectedAddress.province || "",
          postalCode: selectedAddress.postalCode || "",
          countryCode: selectedAddress.country.code,
          phoneNumber: selectedAddress.phoneNumber || "",
        },
        useSameForBilling
      );

      router.refresh();
      onComplete();
    } catch (error) {
      console.error("Error setting address:", error);
    } finally {
      setLoading(false);
    }
  };

  const onSaveNewAddress = async (data: AddressFormData) => {
    setSaving(true);
    try {
      const newAddress = await createCustomerAddress(data);
      setDialogOpen(false);
      reset();
      router.refresh();
      setSelectedAddressId(newAddress.id);
    } catch (error) {
      console.error("Error creating address:", error);
      alert(`${a.createError}: ${error instanceof Error ? error.message : t.common.unknownError}`);
    } finally {
      setSaving(false);
    }
  };

  const onSubmitGuestAddress = async (data: AddressFormData) => {
    setLoading(true);
    try {
      await setShippingAddress(data, useSameForBilling);
      router.refresh();
      onComplete();
    } catch (error) {
      console.error("Error setting address:", error);
    } finally {
      setLoading(false);
    }
  };

  if (isGuest) {
    return (
      <div className="space-y-6">
        <form onSubmit={handleSubmit(onSubmitGuestAddress)}>
          <FieldGroup>
            <div className="grid grid-cols-2 gap-4">
              <Field className="col-span-2">
                <FieldLabel htmlFor="fullName">{t.address.fullName} *</FieldLabel>
                <Input
                  id="fullName"
                  {...register("fullName", { required: t.address.fullNameRequired })}
                />
                <FieldError>{errors.fullName?.message}</FieldError>
              </Field>

              <Field className="col-span-2">
                <FieldLabel htmlFor="company">{t.address.company}</FieldLabel>
                <Input id="company" {...register("company")} />
              </Field>

              <Field className="col-span-2">
                <FieldLabel htmlFor="streetLine1">{t.address.streetLine1} *</FieldLabel>
                <Input
                  id="streetLine1"
                  {...register("streetLine1", { required: t.address.streetRequired })}
                />
                <FieldError>{errors.streetLine1?.message}</FieldError>
              </Field>

              <Field className="col-span-2">
                <FieldLabel htmlFor="streetLine2">{t.address.streetLine2}</FieldLabel>
                <Input id="streetLine2" {...register("streetLine2")} />
              </Field>

              <Field>
                <FieldLabel htmlFor="city">{t.address.city} *</FieldLabel>
                <Input id="city" {...register("city", { required: t.address.cityRequired })} />
                <FieldError>{errors.city?.message}</FieldError>
              </Field>

              <Field>
                <FieldLabel htmlFor="province">{t.address.province}</FieldLabel>
                <Input id="province" {...register("province")} />
                <FieldError>{errors.province?.message}</FieldError>
              </Field>

              <Field>
                <FieldLabel htmlFor="postalCode">{t.address.postalCode} *</FieldLabel>
                <Input
                  id="postalCode"
                  {...register("postalCode", { required: t.address.postalCodeRequired })}
                />
                <FieldError>{errors.postalCode?.message}</FieldError>
              </Field>

              <Field>
                <FieldLabel htmlFor="countryCode">{t.address.country} *</FieldLabel>
                <Controller
                  name="countryCode"
                  control={control}
                  rules={{ required: t.address.countryRequired }}
                  render={({ field }) => (
                    <CountrySelect
                      countries={countries}
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={loading}
                    />
                  )}
                />
                <FieldError>{errors.countryCode?.message}</FieldError>
              </Field>

              <Field className="col-span-2">
                <FieldLabel htmlFor="phoneNumber">{t.address.phoneNumber} *</FieldLabel>
                <Input
                  id="phoneNumber"
                  type="tel"
                  {...register("phoneNumber", { required: t.address.phoneRequired })}
                />
                <FieldError>{errors.phoneNumber?.message}</FieldError>
              </Field>
            </div>

            <div className="flex items-center space-x-2 mt-4">
              <Checkbox
                id="same-billing-guest"
                checked={useSameForBilling}
                onCheckedChange={(checked) => setUseSameForBilling(checked === true)}
              />
              <label
                htmlFor="same-billing-guest"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {a.sameForBilling}
              </label>
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

  return (
    <div className="space-y-6">
      {addresses.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold">{a.selectSaved}</h3>
          <RadioGroup value={selectedAddressId || ""} onValueChange={setSelectedAddressId}>
            {addresses.map((address) => (
              <div key={address.id} className="flex items-start space-x-3">
                <RadioGroupItem value={address.id} id={address.id} className="mt-1" />
                <Label htmlFor={address.id} className="flex-1 cursor-pointer">
                  <Card className="p-4">
                    <div className="leading-tight space-y-0">
                      <p className="font-medium">{address.fullName}</p>
                      {address.company && (
                        <p className="text-sm text-muted-foreground">{address.company}</p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {address.streetLine1}
                        {address.streetLine2 && `, ${address.streetLine2}`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {address.city}, {address.province} {address.postalCode}
                      </p>
                      <p className="text-sm text-muted-foreground">{address.country.name}</p>
                      <p className="text-sm text-muted-foreground">{address.phoneNumber}</p>
                    </div>
                  </Card>
                </Label>
              </div>
            ))}
          </RadioGroup>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="same-billing"
              checked={useSameForBilling}
              onCheckedChange={(checked) => setUseSameForBilling(checked === true)}
            />
            <label
              htmlFor="same-billing"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {a.sameForBilling}
            </label>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleSelectExistingAddress}
              disabled={!selectedAddressId || loading}
              className="flex-1"
            >
              {loading && <Spinner className="mr-2 h-4 w-4 animate-spin" />}
              {a.continueWithSelected}
            </Button>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button type="button" variant="outline">
                  {a.addNew}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit(onSaveNewAddress)}>
                  <DialogHeader>
                    <DialogTitle>{a.addNew}</DialogTitle>
                    <DialogDescription>{a.addNewText}</DialogDescription>
                  </DialogHeader>

                  <FieldGroup className="my-6">
                    <div className="grid grid-cols-2 gap-4">
                      <Field className="col-span-2">
                        <FieldLabel htmlFor="fullName">{t.address.fullName}</FieldLabel>
                        <Input id="fullName" {...register("fullName")} />
                        <FieldError>{errors.fullName?.message}</FieldError>
                      </Field>

                      <Field className="col-span-2">
                        <FieldLabel htmlFor="company">{t.address.company}</FieldLabel>
                        <Input id="company" {...register("company")} />
                      </Field>

                      <Field className="col-span-2">
                        <FieldLabel htmlFor="streetLine1">{t.address.streetLine1} *</FieldLabel>
                        <Input
                          id="streetLine1"
                          {...register("streetLine1", { required: t.address.streetRequired })}
                        />
                        <FieldError>{errors.streetLine1?.message}</FieldError>
                      </Field>

                      <Field className="col-span-2">
                        <FieldLabel htmlFor="streetLine2">{t.address.streetLine2}</FieldLabel>
                        <Input id="streetLine2" {...register("streetLine2")} />
                      </Field>

                      <Field>
                        <FieldLabel htmlFor="city">{t.address.city}</FieldLabel>
                        <Input id="city" {...register("city")} />
                        <FieldError>{errors.city?.message}</FieldError>
                      </Field>

                      <Field>
                        <FieldLabel htmlFor="province">{t.address.province}</FieldLabel>
                        <Input id="province" {...register("province")} />
                        <FieldError>{errors.province?.message}</FieldError>
                      </Field>

                      <Field>
                        <FieldLabel htmlFor="postalCode">{t.address.postalCode}</FieldLabel>
                        <Input id="postalCode" {...register("postalCode")} />
                        <FieldError>{errors.postalCode?.message}</FieldError>
                      </Field>

                      <Field>
                        <FieldLabel htmlFor="countryCode">{t.address.country} *</FieldLabel>
                        <Controller
                          name="countryCode"
                          control={control}
                          rules={{ required: t.address.countryRequired }}
                          render={({ field }) => (
                            <CountrySelect
                              countries={countries}
                              value={field.value}
                              onValueChange={field.onChange}
                              disabled={saving}
                            />
                          )}
                        />
                        <FieldError>{errors.countryCode?.message}</FieldError>
                      </Field>

                      <Field className="col-span-2">
                        <FieldLabel htmlFor="phoneNumber">{t.address.phoneNumber}</FieldLabel>
                        <Input id="phoneNumber" type="tel" {...register("phoneNumber")} />
                        <FieldError>{errors.phoneNumber?.message}</FieldError>
                      </Field>
                    </div>
                  </FieldGroup>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setDialogOpen(false)}
                      disabled={saving}
                    >
                      {t.common.cancel}
                    </Button>
                    <Button type="submit" disabled={saving}>
                      {saving && <Spinner className="mr-2 h-4 w-4 animate-spin" />}
                      {t.address.save}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      )}

      {addresses.length === 0 && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit(onSaveNewAddress)}>
              <DialogHeader>
                <DialogTitle>{a.addShipping}</DialogTitle>
                <DialogDescription>{a.addShippingText}</DialogDescription>
              </DialogHeader>

              <FieldGroup className="my-6">
                <div className="grid grid-cols-2 gap-4">
                  <Field className="col-span-2">
                    <FieldLabel htmlFor="fullName">{t.address.fullName}</FieldLabel>
                    <Input id="fullName" {...register("fullName")} />
                    <FieldError>{errors.fullName?.message}</FieldError>
                  </Field>

                  <Field className="col-span-2">
                    <FieldLabel htmlFor="company">{t.address.company}</FieldLabel>
                    <Input id="company" {...register("company")} />
                  </Field>

                  <Field className="col-span-2">
                    <FieldLabel htmlFor="streetLine1">{t.address.streetLine1} *</FieldLabel>
                    <Input
                      id="streetLine1"
                      {...register("streetLine1", { required: t.address.streetRequired })}
                    />
                    <FieldError>{errors.streetLine1?.message}</FieldError>
                  </Field>

                  <Field className="col-span-2">
                    <FieldLabel htmlFor="streetLine2">{t.address.streetLine2}</FieldLabel>
                    <Input id="streetLine2" {...register("streetLine2")} />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="city">{t.address.city}</FieldLabel>
                    <Input id="city" {...register("city")} />
                    <FieldError>{errors.city?.message}</FieldError>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="province">{t.address.province}</FieldLabel>
                    <Input id="province" {...register("province")} />
                    <FieldError>{errors.province?.message}</FieldError>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="postalCode">{t.address.postalCode}</FieldLabel>
                    <Input id="postalCode" {...register("postalCode")} />
                    <FieldError>{errors.postalCode?.message}</FieldError>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="countryCode">{t.address.country} *</FieldLabel>
                    <Controller
                      name="countryCode"
                      control={control}
                      rules={{ required: t.address.countryRequired }}
                      render={({ field }) => (
                        <CountrySelect
                          countries={countries}
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={saving}
                        />
                      )}
                    />
                    <FieldError>{errors.countryCode?.message}</FieldError>
                  </Field>

                  <Field className="col-span-2">
                    <FieldLabel htmlFor="phoneNumber">{t.address.phoneNumber}</FieldLabel>
                    <Input id="phoneNumber" type="tel" {...register("phoneNumber")} />
                    <FieldError>{errors.phoneNumber?.message}</FieldError>
                  </Field>
                </div>
              </FieldGroup>

              <DialogFooter>
                <Button type="submit" disabled={saving} className="w-full">
                  {saving && <Spinner className="mr-2 h-4 w-4 animate-spin" />}
                  {t.address.save}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
