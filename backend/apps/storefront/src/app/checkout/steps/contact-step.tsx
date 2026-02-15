'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel, FieldError, FieldGroup } from '@/components/ui/field';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useForm } from 'react-hook-form';
import { Loader2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { setCustomerForOrder, SetCustomerForOrderResult } from '../actions';

interface ContactStepProps {
  onComplete: () => void;
}

interface ContactFormData {
  emailAddress: string;
  firstName: string;
  lastName: string;
}

function getErrorMessage(error: SetCustomerForOrderResult) {
  if (error.success) return null;

  switch (error.errorCode) {
    case 'EMAIL_CONFLICT':
      return (
        <>
          An account already exists with this email.{' '}
          <Link href="/sign-in?redirectTo=/checkout" className="underline hover:no-underline">
            Sign in
          </Link>{' '}
          to continue.
        </>
      );
    case 'GUEST_CHECKOUT_DISABLED':
      return 'Guest checkout is not enabled. Please sign in or create an account.';
    case 'NO_ACTIVE_ORDER':
      return (
        <>
          Your cart is empty.{' '}
          <Link href="/" className="underline hover:no-underline">
            Continue shopping
          </Link>
        </>
      );
    default:
      return error.message;
  }
}

export default function ContactStep({ onComplete }: ContactStepProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<SetCustomerForOrderResult | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormData>();

  const onSubmit = async (data: ContactFormData) => {
    setLoading(true);
    setError(null);

    try {
      const result = await setCustomerForOrder(data);

      if (result.success) {
        router.refresh();
        onComplete();
      } else {
        setError(result);
      }
    } catch (err) {
      console.error('Error setting customer:', err);
      setError({ success: false, errorCode: 'UNKNOWN', message: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/sign-in?redirectTo=/checkout" className="text-primary underline hover:no-underline">
          Sign in
        </Link>
      </p>

      {error && !error.success && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{getErrorMessage(error)}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
          <div className="grid grid-cols-2 gap-4">
            <Field className="col-span-2">
              <FieldLabel htmlFor="emailAddress">Email Address *</FieldLabel>
              <Input
                id="emailAddress"
                type="email"
                {...register('emailAddress', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
              />
              <FieldError>{errors.emailAddress?.message}</FieldError>
            </Field>

            <Field>
              <FieldLabel htmlFor="firstName">First Name *</FieldLabel>
              <Input
                id="firstName"
                {...register('firstName', { required: 'First name is required' })}
              />
              <FieldError>{errors.firstName?.message}</FieldError>
            </Field>

            <Field>
              <FieldLabel htmlFor="lastName">Last Name *</FieldLabel>
              <Input
                id="lastName"
                {...register('lastName', { required: 'Last name is required' })}
              />
              <FieldError>{errors.lastName?.message}</FieldError>
            </Field>
          </div>

          <Button type="submit" disabled={loading} className="w-full mt-4">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Continue
          </Button>
        </FieldGroup>
      </form>
    </div>
  );
}
