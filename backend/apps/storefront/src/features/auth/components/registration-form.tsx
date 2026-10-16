"use client";

import { useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createRegistrationSchema,
  type RegistrationFormData,
} from "@/features/auth/schemas/registration.schema";
import { registerAction } from "@/features/auth/services/register.actions";
import {
  Button,
  Input,
  Card,
  CardContent,
  CardFooter,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/design-system";
import { Link } from "@/lib/i18n/navigation";
import { useT } from "@/lib/i18n/provider";

interface RegistrationFormProps {
  redirectTo?: string;
}

export function RegistrationForm({ redirectTo }: RegistrationFormProps) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const t = useT().auth;
  const registrationSchema = useMemo(() => createRegistrationSchema(t.validation), [t]);

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
                  <FormLabel>{t.email}</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder={t.emailPlaceholder}
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
                    <FormLabel>{t.firstName}</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder={t.firstNamePlaceholder}
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
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.lastName}</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder={t.lastNamePlaceholder}
                        disabled={isPending}
                        {...field}
                      />
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
                  <FormLabel>{t.company}</FormLabel>
                  <FormControl>
                    <Input type="text" disabled={isPending} {...field} />
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
                  <FormLabel>{t.vatNumber}</FormLabel>
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
                  <FormLabel>{t.mobileNumber}</FormLabel>
                  <FormControl>
                    <Input type="tel" disabled={isPending} {...field} />
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
                  <FormLabel>{t.password}</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" disabled={isPending} {...field} />
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
                  <FormLabel>{t.confirmPassword}</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" disabled={isPending} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {serverError && <div className="text-sm text-destructive">{serverError}</div>}

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? t.register.submitting : t.register.submit}
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 mt-4">
            <div className="text-sm text-center text-muted-foreground">
              {t.register.haveAccount}{" "}
              <Link href={signInHref} className="hover:text-primary underline">
                {t.register.signIn}
              </Link>
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
