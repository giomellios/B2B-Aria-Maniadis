"use server";

import { mutate } from "@/lib/api/client";
import { RegisterCustomerAccountMutation } from "@/features/auth/services/mutations";
import { getRequestT } from "@/lib/i18n/server";
import { localeRedirect } from "@/lib/i18n/redirect";
import { DEFAULT_VIES_COUNTRY, isViesCountry, normalizeVatNumber } from "@/features/auth/vies";

export async function registerAction(
  prevState: { error?: string } | undefined,
  formData: FormData
) {
  const emailAddress = (formData.get("emailAddress") as string | null)?.trim() ?? "";
  const firstName = (formData.get("firstName") as string | null)?.trim() ?? "";
  const lastName = (formData.get("lastName") as string | null)?.trim() ?? "";
  const countryInput = formData.get("country");
  const country = isViesCountry(countryInput) ? countryInput : DEFAULT_VIES_COUNTRY;
  const vatInput = (formData.get("vatNumber") as string | null)?.trim() ?? "";
  // Greek ΑΦΜ are stored as the bare 9 digits (like every existing customer); other EU numbers
  // keep their country prefix ("DE123456789") so the admin can tell which country they are from.
  const vatDigits = normalizeVatNumber(vatInput, country);
  const vatNumber = !vatDigits
    ? ""
    : country === DEFAULT_VIES_COUNTRY
      ? vatDigits
      : `${country}${vatDigits}`;
  const company = (formData.get("company") as string | null)?.trim() ?? "";
  const address = (formData.get("address") as string | null)?.trim() ?? "";
  const mobileNumber = (formData.get("mobileNumber") as string | null)?.trim() ?? "";
  const password = (formData.get("password") as string | null) ?? "";
  const t = await getRequestT();

  if (
    !emailAddress ||
    !firstName ||
    !lastName ||
    !vatNumber ||
    !company ||
    !address ||
    !mobileNumber
  ) {
    return {
      error: t.auth.validation.registrationFieldsRequired,
    };
  }

  if (!password) {
    return { error: t.auth.validation.passwordRequired };
  }

  if (password.length < 8) {
    return { error: t.auth.validation.passwordMin };
  }

  const registrationInput = {
    emailAddress,
    firstName,
    lastName,
    phoneNumber: mobileNumber,
    password,
    customFields: {
      vatNumber,
      company,
      address,
    },
  };

  const result = await mutate(RegisterCustomerAccountMutation, {
    input: registrationInput,
  });

  const registerResult = result.data.registerCustomerAccount;

  if (registerResult.__typename !== "Success") {
    return { error: registerResult.message };
  }

  await localeRedirect("/verify-pending");
}
