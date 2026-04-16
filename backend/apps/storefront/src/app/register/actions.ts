"use server";

import { mutate } from "@/lib/vendure/api";
import { RegisterCustomerAccountMutation } from "@/lib/vendure/mutations";
import { redirect } from "next/navigation";

export async function registerAction(
  prevState: { error?: string } | undefined,
  formData: FormData
) {
  const emailAddress = (formData.get("emailAddress") as string | null)?.trim() ?? "";
  const firstName = (formData.get("firstName") as string | null)?.trim() ?? "";
  const lastName = (formData.get("lastName") as string | null)?.trim() ?? "";
  const vatNumber = (formData.get("vatNumber") as string | null)?.trim() ?? "";
  const company = (formData.get("company") as string | null)?.trim() ?? "";
  const mobileNumber = (formData.get("mobileNumber") as string | null)?.trim() ?? "";
  const password = (formData.get("password") as string | null) ?? "";
  const redirectTo = formData.get("redirectTo") as string | null;

  if (!emailAddress || !firstName || !lastName || !vatNumber || !company || !mobileNumber) {
    return {
      error:
        "First name, last name, VAT number, company, mail, mobile number, and password are required",
    };
  }

  if (!password) {
    return { error: "Password is required" };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters" };
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
    },
  };

  const result = await mutate(RegisterCustomerAccountMutation, {

    input: registrationInput,
  } as never);

  const registerResult = result.data.registerCustomerAccount;

  if (registerResult.__typename !== "Success") {
    return { error: registerResult.message };
  }

  redirect("/verify-pending");
}
