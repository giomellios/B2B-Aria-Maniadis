'use server';

import {mutate} from '@/lib/vendure/api';
import {RegisterCustomerAccountMutation} from '@/lib/vendure/mutations';
import {redirect} from 'next/navigation';

export async function registerAction(prevState: { error?: string } | undefined, formData: FormData) {
    const emailAddress = formData.get('emailAddress') as string;
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const phoneNumber = formData.get('phoneNumber') as string;
    const password = formData.get('password') as string;
    const redirectTo = formData.get('redirectTo') as string | null;

    if (!emailAddress || !password) {
        return {error: 'Email address and password are required'};
    }


    const result = await mutate(RegisterCustomerAccountMutation, {
        input: {
            emailAddress,
            firstName: firstName || undefined,
            lastName: lastName || undefined,
            phoneNumber: phoneNumber || undefined,
            password,
        }
    });

    const registerResult = result.data.registerCustomerAccount;

    if (registerResult.__typename !== 'Success') {
        return {error: registerResult.message};
    }

    // EMAIL VERIFICATION DISABLED 
    // const verifyUrl = redirectTo
    //     ? `/verify-pending?redirectTo=${encodeURIComponent(redirectTo)}`
    //     : '/verify-pending';
    // redirect(verifyUrl);

    // Redirect to sign-in page after successful registration
    const signInUrl = redirectTo
        ? `/sign-in?redirectTo=${encodeURIComponent(redirectTo)}`
        : '/sign-in';

    redirect(signInUrl);
}
