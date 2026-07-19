"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { registerAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Link from "next/link";

const registrationSchema = z
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

type RegistrationFormData = z.infer<typeof registrationSchema>;

interface RegistrationFormProps {
  redirectTo?: string;
}

export function RegistrationForm({ redirectTo }: RegistrationFormProps) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      emailAddress: "",
      firstName: "",
      lastName: "",
      vatNumber: "",
      company: "",
      mobileNumber: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: RegistrationFormData) => {
    setServerError(null);

    startTransition(async () => {
      const formData = new FormData();
      formData.append("emailAddress", data.emailAddress.trim());
      formData.append("firstName", data.firstName.trim());
      formData.append("lastName", data.lastName.trim());
      formData.append("vatNumber", data.vatNumber.trim());
      formData.append("company", data.company.trim());
      formData.append("mobileNumber", data.mobileNumber.trim());
      formData.append("password", data.password);
      if (redirectTo) {
        formData.append("redirectTo", redirectTo);
      }

      const result = await registerAction(undefined, formData);
      if (result?.error) {
        setServerError(result.error);
      }
    });
  };

  const signInHref = redirectTo
    ? `/sign-in?redirectTo=${encodeURIComponent(redirectTo)}`
    : "/sign-in";

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="emailAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mail</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="John" disabled={isPending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Doe" disabled={isPending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="vatNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>VAT Number</FormLabel>
                  <FormControl>
                    <Input type="text" disabled={isPending} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mobileNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mobile Number</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder="••••••••" disabled={isPending} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder="••••••••" disabled={isPending} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {serverError && <div className="text-sm text-destructive">{serverError}</div>}

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Creating account..." : "Create Account"}
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 mt-4">
            <div className="text-sm text-center text-muted-foreground">
              Already have an account?{" "}
              <Link href={signInHref} className="hover:text-primary underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
