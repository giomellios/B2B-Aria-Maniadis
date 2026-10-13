"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Badge,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/design-system";
import { Plus, MoreVertical, Home, CreditCard, Edit2, Trash2 } from "lucide-react";
import type { ComponentProps } from "react";
import { AddressForm } from "@/features/account/components/address-form";
import {
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultShippingAddress,
  setDefaultBillingAddress,
} from "@/features/account/services/address.actions";
import { useRouter } from "next/navigation";
import { useT } from "@/lib/i18n/provider";

interface Country {
  id: string;
  code: string;
  name: string;
}

interface CustomerAddress {
  id: string;
  fullName?: string | null;
  company?: string | null;
  streetLine1: string;
  streetLine2?: string | null;
  city?: string | null;
  province?: string | null;
  postalCode?: string | null;
  country: { id: string; code: string; name: string };
  phoneNumber?: string | null;
  defaultShippingAddress?: boolean | null;
  defaultBillingAddress?: boolean | null;
}

interface AddressesClientProps {
  addresses: CustomerAddress[];
  countries: Country[];
}

export function AddressesClient({ addresses, countries }: AddressesClientProps) {
  const router = useRouter();
  const { account, common } = useT();
  const t = account.addresses;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [settingDefault, setSettingDefault] = useState<{
    id: string;
    type: "shipping" | "billing";
  } | null>(null);

  const handleAddNew = () => {
    setEditingAddress(null);
    setDialogOpen(true);
  };

  const handleEdit = (address: CustomerAddress) => {
    setEditingAddress(address);
    setDialogOpen(true);
  };

  const handleDelete = (addressId: string) => {
    setAddressToDelete(addressId);
    setDeleteDialogOpen(true);
  };

  const handleSetDefaultShipping = async (addressId: string) => {
    setSettingDefault({ id: addressId, type: "shipping" });
    try {
      await setDefaultShippingAddress(addressId);
      router.refresh();
    } catch (error) {
      console.error("Error setting default shipping address:", error);
      alert(`${t.saveError}: ${error instanceof Error ? error.message : common.unknownError}`);
    } finally {
      setSettingDefault(null);
    }
  };

  const handleSetDefaultBilling = async (addressId: string) => {
    setSettingDefault({ id: addressId, type: "billing" });
    try {
      await setDefaultBillingAddress(addressId);
      router.refresh();
    } catch (error) {
      console.error("Error setting default billing address:", error);
      alert(`${t.saveError}: ${error instanceof Error ? error.message : common.unknownError}`);
    } finally {
      setSettingDefault(null);
    }
  };

  const confirmDelete = async () => {
    if (!addressToDelete) return;

    setIsDeleting(true);
    try {
      await deleteAddress(addressToDelete);
      router.refresh();
      setDeleteDialogOpen(false);
      setAddressToDelete(null);
    } catch (error) {
      console.error("Error deleting address:", error);
      alert(`${t.deleteError}: ${error instanceof Error ? error.message : common.unknownError}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit: ComponentProps<typeof AddressForm>["onSubmit"] = async (data) => {
    setIsSubmitting(true);
    try {
      if (editingAddress) {
        await updateAddress({ ...data, id: data.id ?? editingAddress.id });
      } else {
        await createAddress(data);
      }
      router.refresh();
      setDialogOpen(false);
      setEditingAddress(null);
    } catch (error) {
      console.error("Error saving address:", error);
      alert(`${t.saveError}: ${error instanceof Error ? error.message : common.unknownError}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center">
        <div></div>
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" />
          {t.addNew}
        </Button>
      </div>

      {addresses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">{t.none}</p>
            <Button onClick={handleAddNew}>
              <Plus className="mr-2 h-4 w-4" />
              {t.addFirst}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <Card key={address.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-lg">{address.fullName}</CardTitle>
                    {(address.defaultShippingAddress || address.defaultBillingAddress) && (
                      <div className="flex gap-2">
                        {address.defaultShippingAddress && (
                          <Badge variant="secondary">{t.defaultShipping}</Badge>
                        )}
                        {address.defaultBillingAddress && (
                          <Badge variant="secondary">{t.defaultBilling}</Badge>
                        )}
                      </div>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label={t.actions}>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(address)}>
                        <Edit2 className="mr-2 h-4 w-4" />
                        {common.edit}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleSetDefaultShipping(address.id)}
                        disabled={
                          address.defaultShippingAddress ||
                          (settingDefault?.id === address.id && settingDefault?.type === "shipping")
                        }
                      >
                        <Home className="mr-2 h-4 w-4" />
                        {address.defaultShippingAddress ? t.defaultShipping : t.setShipping}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleSetDefaultBilling(address.id)}
                        disabled={
                          address.defaultBillingAddress ||
                          (settingDefault?.id === address.id && settingDefault?.type === "billing")
                        }
                      >
                        <CreditCard className="mr-2 h-4 w-4" />
                        {address.defaultBillingAddress ? t.defaultBilling : t.setBilling}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(address.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                        {common.delete}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground space-y-1">
                  {address.company && <p>{address.company}</p>}
                  <p>
                    {address.streetLine1}
                    {address.streetLine2 && `, ${address.streetLine2}`}
                  </p>
                  <p>
                    {address.city}, {address.province} {address.postalCode}
                  </p>
                  <p>{address.country.name}</p>
                  <p>{address.phoneNumber}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingAddress ? t.editTitle : t.addNew}</DialogTitle>
            <DialogDescription>{editingAddress ? t.editText : t.addText}</DialogDescription>
          </DialogHeader>
          <AddressForm
            countries={countries}
            address={editingAddress || undefined}
            onSubmit={handleSubmit}
            onCancel={() => {
              setDialogOpen(false);
              setEditingAddress(null);
            }}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.confirmTitle}</AlertDialogTitle>
            <AlertDialogDescription>{t.confirmText}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>{common.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? common.deleting : common.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
