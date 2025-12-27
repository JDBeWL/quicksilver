import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import Credentials from 'next-auth/providers/credentials';
import GitHub from 'next-auth/providers/github';
import { authConfig } from './auth.config';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const { auth, handlers, signIn, signOut } = NextAuth({
    ...authConfig,
    adapter: PrismaAdapter(prisma),
    session: { strategy: 'jwt' },
    trustHost: true,
    providers: [
        GitHub,
        Credentials({
            credentials: {
                email: {},
                password: {},
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const email = credentials.email as string;
                const password = credentials.password as string;

                const user = await prisma.user.findUnique({
                    where: { email },
                });

                if (!user || !user.password) {
                    return null;
                }

                const passwordsMatch = await bcrypt.compare(password, user.password);

                if (passwordsMatch) {
                    return user;
                }

                return null;
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.name = user.name;
                token.email = user.email;
            }
            return token;
        },
        async session({ session, token }) {
            if (token?.id) {
                session.user.id = token.id as string;
            }
            if (token?.name) {
                session.user.name = token.name as string;
            }
            if (token?.email) {
                session.user.email = token.email as string;
            }
            return session;
        },
    },
});
