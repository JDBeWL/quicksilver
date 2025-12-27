'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Locale } from '@/i18n-config';
import { authenticate } from '@/app/actions';

interface LoginFormProps {
    dict: any;
    lang: Locale;
    allowRegister?: boolean;
}

export default function LoginForm({ dict, lang, allowRegister = false }: LoginFormProps) {
    const [errorMessage, formAction, isPending] = useActionState(authenticate, undefined);

    return (
        <div className="flex items-center justify-center flex-1 px-4 py-8">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>{dict.auth.login.title}</CardTitle>
                </CardHeader>
                <form action={formAction}>
                    <CardContent className="space-y-4">
                        {errorMessage && (
                            <div className="text-red-500 text-sm font-medium">
                                {errorMessage === 'CredentialsSignin'
                                    ? dict.auth.login.invalid_credentials || 'Invalid credentials'
                                    : dict.auth.login.error || 'Something went wrong'}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="email">{dict.auth.login.email_label}</Label>
                            <Input id="email" name="email" type="email" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">{dict.auth.login.password_label}</Label>
                            <Input id="password" name="password" type="password" required />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4 pt-4">
                        <Button className="w-full" type="submit" disabled={isPending}>
                            {isPending ? dict.auth.login.submitting : dict.auth.login.submit}
                        </Button>

                        {allowRegister && (
                            <div className="text-sm text-center text-gray-500">
                                {dict.auth.login.no_account}{' '}
                                <Link href={`/${lang}/register`} className="underline hover:text-gray-900">
                                    {dict.auth.login.register_link}
                                </Link>
                            </div>
                        )}
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
