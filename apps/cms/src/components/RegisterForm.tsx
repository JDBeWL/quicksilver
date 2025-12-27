'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Locale } from '@/i18n-config';
import { register } from '@/app/actions';

interface RegisterFormProps {
    dict: any;
    lang: Locale;
    inviteCodeRequired?: boolean;
}

export default function RegisterForm({ dict, lang, inviteCodeRequired = false }: RegisterFormProps) {
    const [state, formAction, isPending] = useActionState(register, undefined);

    // Client-side validation for password match could still be done, 
    // but for simplicity in Server Actions, better to check on server or use controlled inputs + onSubmit wrapper 
    // if strictly needed. Here we rely on server returning error or simple client-side check if we wrap it.
    // However, `useActionState` takes a formData directly.
    // To do password match check on client before submission using `formAction`, we can wrap the action prop.

    return (
        <div className="flex items-center justify-center flex-1 px-4 py-8">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>{dict.auth.register.title}</CardTitle>
                    <CardDescription>{dict.auth.register.subtitle}</CardDescription>
                </CardHeader>
                <form action={formAction}>
                    <CardContent className="space-y-4">
                        {state?.error && <div className="text-red-500 text-sm font-medium">{state.error}</div>}

                        {inviteCodeRequired && (
                            <div className="space-y-2">
                                <Label htmlFor="inviteCode">Invite Code</Label>
                                <Input id="inviteCode" name="inviteCode" placeholder="INV-XXXX-XXXX" required />
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="name">{dict.auth.register.name_label}</Label>
                            <Input id="name" name="name" placeholder="John Doe" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">{dict.auth.register.email_label}</Label>
                            <Input id="email" name="email" type="email" placeholder="m@example.com" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">{dict.auth.register.password_label}</Label>
                            <Input id="password" name="password" type="password" required />
                        </div>
                        {/* Note: Server action should check confirmPassword if passed, or we assume users know how to type. 
                            If we want client check, we need controlled state or JS validation.
                            For now adding pattern or similar could help, but keeping simple.
                        */}
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4 pt-4">
                        <Button className="w-full" type="submit" disabled={isPending}>
                            {isPending ? dict.auth.register.submitting : dict.auth.register.submit}
                        </Button>
                        <div className="text-sm text-center text-gray-500">
                            {dict.auth.register.has_account}{' '}
                            <Link href={`/${lang}/login`} className="underline hover:text-gray-900">
                                {dict.auth.register.login_link}
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
