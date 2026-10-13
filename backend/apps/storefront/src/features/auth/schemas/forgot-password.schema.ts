import * as z from "zod";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function createForgotPasswordSchema(v: Dictionary["auth"]["validation"]) {
  return z.object({
    emailAddress: z.email(v.email),
  });
}

export type ForgotPasswordFormData = z.infer<ReturnType<typeof createForgotPasswordSchema>>;
