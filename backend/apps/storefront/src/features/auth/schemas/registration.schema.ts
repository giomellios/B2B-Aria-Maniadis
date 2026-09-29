import * as z from "zod";

export const registrationSchema = z
  .object({
    emailAddress: z.string().email("Please enter a valid email address"),
    firstName: z.string().trim().min(1, "First name is required"),
    lastName: z.string().trim().min(1, "Last name is required"),
    vatNumber: z.string().trim().min(1, "VAT number is required"),
    company: z.string().trim().min(1, "Company is required"),
    mobileNumber: z.string().trim().min(1, "Mobile number is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type RegistrationFormData = z.infer<typeof registrationSchema>;
