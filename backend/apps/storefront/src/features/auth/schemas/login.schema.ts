import * as z from "zod";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function createLoginSchema(v: Dictionary["auth"]["validation"]) {
  return z.object({
    username: z.email(v.email),
    password: z.string().min(1, v.passwordRequired),
  });
}

export type LoginFormData = z.infer<ReturnType<typeof createLoginSchema>>;
