"use client";

import { useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createForgotPasswordSchema,
  type ForgotPasswordFormData,
} from "@/features/auth/schemas/forgot-password.schema";
import { requestPasswordResetAction } from "@/features/auth/services/forgot-password.actions";
import {
  Button,
  Input,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/design-system";
import { Link } from "@/lib/i18n/navigation";
import { useT } from "@/lib/i18n/provider";

export function ForgotPasswordForm() {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { auth: t, common } = useT();
  const forgotPasswordSchema = useMemo(() => createForgotPasswordSchema(t.validation), [t]);

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      emailAddress: "",
    },
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    setServerError(null);

    startTransition(async () => {
      const formData = new FormData();
      formData.append("emailAddress", data.emailAddress);

      const result = await requestPasswordResetAction(undefined, formData);
      if (result?.error) {
        setServerError(result.error);
      } else if (result?.success) {
        setSuccess(true);
      }
    });
  };

  if (success) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t.forgot.checkEmail}</CardTitle>
          <CardDescription>{t.forgot.checkEmailText}</CardDescription>
        </CardHeader>
        <CardFooter>
          <Link href="/sign-in">
            <Button variant="outline" className="w-full">
              {t.backToSignIn}
            </Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.forgot.title}</CardTitle>
        <CardDescription>{t.forgot.text}</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent>
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

            {serverError && <div className="text-sm text-destructive mt-4">{serverError}</div>}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 mt-4">
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? common.sending : t.forgot.submit}
            </Button>
            <Link
              href="/sign-in"
              className="text-sm text-center text-muted-foreground hover:text-primary"
            >
              {t.backToSignIn}
            </Link>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
