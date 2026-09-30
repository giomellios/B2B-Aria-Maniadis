import * as z from "zod";

export const forgotPasswordSchema = z.object({
  emailAddress: z.email("Please enter a valid email address"),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
