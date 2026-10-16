"use client";

import { useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createLoginSchema, type LoginFormData } from "@/features/auth/schemas/login.schema";
import { loginAction } from "@/features/auth/services/sign-in.actions";
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

interface LoginFormProps {
  redirectTo?: string;
}

export function LoginForm({ redirectTo }: LoginFormProps) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const t = useT().auth;
  const loginSchema = useMemo(() => createLoginSchema(t.validation), [t]);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginFormData) => {
    setServerError(null);

    startTransition(async () => {
      const formData = new FormData();
      formData.append("username", data.username);
      formData.append("password", data.password);
      if (redirectTo) {
        formData.append("redirectTo", redirectTo);
      }

      const result = await loginAction(undefined, formData);
      if (result?.error) {
        setServerError(result.error);
      }
    });
  };

  const registerHref = redirectTo
    ? `/register?redirectTo=${encodeURIComponent(redirectTo)}`
    : "/register";

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="username"
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

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>{t.password}</FormLabel>
                    <Link
                      href="/forgot-password"
                      className="text-muted-foreground hover:text-primary text-sm"
                    >
                      {t.signIn.forgot}
                    </Link>
                  </div>

                  <FormControl>
                    <Input type="password" placeholder="••••••••" disabled={isPending} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {serverError && <div className="text-sm text-destructive">{serverError}</div>}
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? t.signIn.submitting : t.signIn.submit}
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 mt-2">
            <div className="text-muted-foreground text-sm text-center">
              {t.signIn.noAccount}{" "}
              <Link href={registerHref} className="hover:text-primary underline">
                {t.signIn.register}
              </Link>
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
