'use server';

import { signIn, signOut } from '@/auth';
import { AuthError } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth'; // Keeping this helper for now if only hashing is needed
// Note: hashPassword in lib/auth uses bcryptjs, which is fine.

export async function authenticate(prevState: string | undefined, formData: FormData) {
    try {
        await signIn('credentials', formData);
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'CredentialsSignin';
                default:
                    return 'Something went wrong.';
            }
        }
        // Re-throw NEXT_REDIRECT and other errors so Next.js can handle redirects
        throw error;
    }
}

export async function register(prevState: any, formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;
    const inviteCode = formData.get('inviteCode') as string;
    const blogMode = process.env.BLOG_MODE || 'personal';

    if (!email || !password) {
        return { error: 'Missing required fields' };
    }

    if (blogMode === 'personal') {
        const userCount = await prisma.user.count();
        if (userCount > 0) { // Assuming first user is admin or created via script
            // Actually, if personal mode, maybe registration is disabled entirely or checked?
            // Original logic: "Public registration is disabled"
            // But we might want to allow it if no users exist?
            // Sticking to original logic:
            return { error: 'Public registration is disabled.' };
        }
    }

    if (blogMode === 'multi_user') {
        if (!inviteCode) return { error: 'Invite code is required' };

        const invite = await prisma.inviteCode.findUnique({
            where: { code: inviteCode },
        });

        if (!invite || invite.used || new Date() > invite.expiresAt) {
            return { error: 'Invalid or expired invite code' };
        }

        await prisma.inviteCode.update({
            where: { id: invite.id },
            data: { used: true },
        });
    }

    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        return { error: 'Registration failed. Please try again.' };
    }

    const hashedPassword = await hashPassword(password);

    await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            name,
        },
    });

    // Auto login
    try {
        await signIn('credentials', formData);
    } catch (error) {
        if (error instanceof AuthError) {
            // Should not happen with just-created valid credentials but safety check
            return { error: 'Registration successful but auto-login failed.' };
        }
        throw error;
    }
}

export async function logoutAction() {
    await signOut({ redirectTo: '/' });
}