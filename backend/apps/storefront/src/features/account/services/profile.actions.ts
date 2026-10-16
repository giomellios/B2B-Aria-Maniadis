"use server";

import { mutate } from "@/lib/api/client";
import {
  UpdateCustomerPasswordMutation,
  UpdateCustomerMutation,
  RequestUpdateCustomerEmailAddressMutation,
} from "@/features/account/services/mutations";
import { revalidatePath } from "next/cache";
import { getRequestT } from "@/lib/i18n/server";

export async function updatePasswordAction(
  prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
) {
  const t = await getRequestT();
  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: t.auth.validation.allFieldsRequired };
  }

  if (newPassword !== confirmPassword) {
    return { error: t.account.profile.newPasswordsDontMatch };
  }

  if (currentPassword === newPassword) {
    return { error: t.account.profile.passwordMustDiffer };
  }

  try {
    const result = await mutate(
      UpdateCustomerPasswordMutation,
      {
        currentPassword,
        newPassword,
      },
      { useAuthToken: true }
    );

    const updateResult = result.data.updateCustomerPassword;

    if (updateResult.__typename !== "Success") {
      return { error: updateResult.message };
    }

    return { success: true };
  } catch {
    return { error: t.common.unexpectedError };
  }
}

export async function updateCustomerAction(
  prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
) {
  const t = await getRequestT();
  const firstName = (formData.get("firstName") as string | null)?.trim() ?? "";
  const lastName = (formData.get("lastName") as string | null)?.trim() ?? "";
  const vatNumber = (formData.get("vatNumber") as string | null)?.trim() ?? "";
  const company = (formData.get("company") as string | null)?.trim() ?? "";

  if (!firstName || !lastName || !vatNumber || !company) {
    return { error: t.account.profile.profileFieldsRequired };
  }

  try {
    const result = await mutate(
      UpdateCustomerMutation,
      {
        input: {
          firstName,
          lastName,
          customFields: {
            vatNumber,
            company,
          },
        },
      },
      { useAuthToken: true }
    );

    const updateResult = result.data.updateCustomer;

    if (!updateResult || !updateResult.id) {
      return { error: t.account.profile.profileUpdateFailed };
    }

    revalidatePath("/[locale]/account/profile", "page");
    return { success: true };
  } catch {
    return { error: t.common.unexpectedError };
  }
}

export async function requestEmailUpdateAction(
  prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
) {
  const t = await getRequestT();
  const password = formData.get("password") as string;
  const newEmailAddress = formData.get("newEmailAddress") as string;

  if (!password || !newEmailAddress) {
    return { error: t.account.profile.emailFieldsRequired };
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(newEmailAddress)) {
    return { error: t.auth.validation.email };
  }

  try {
    const result = await mutate(
      RequestUpdateCustomerEmailAddressMutation,
      {
        password,
        newEmailAddress,
      },
      { useAuthToken: true }
    );

    const updateResult = result.data.requestUpdateCustomerEmailAddress;

    if (updateResult.__typename !== "Success") {
      return { error: updateResult.message };
    }

    return { success: true };
  } catch {
    return { error: t.common.unexpectedError };
  }
}
