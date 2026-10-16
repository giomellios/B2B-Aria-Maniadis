import * as z from "zod";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function createRegistrationSchema(v: Dictionary["auth"]["validation"]) {
  return z
    .object({
      emailAddress: z.string().email(v.email),
      firstName: z.string().trim().min(1, v.firstNameRequired),
      lastName: z.string().trim().min(1, v.lastNameRequired),
      vatNumber: z.string().trim().min(1, v.vatRequired),
      company: z.string().trim().min(1, v.companyRequired),
      mobileNumber: z.string().trim().min(1, v.mobileRequired),
      password: z.string().min(8, v.passwordMin),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: v.passwordsDontMatch,
      path: ["confirmPassword"],
    });
}

export type RegistrationFormData = z.infer<ReturnType<typeof createRegistrationSchema>>;
