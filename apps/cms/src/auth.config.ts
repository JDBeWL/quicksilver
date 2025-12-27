import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            // Skip dynamic routing checks during build time to avoid static generation errors
            if (process.env.NODE_ENV === 'production' && typeof window === 'undefined') {
                // During build, allow all routes to be statically generated
                return true;
            }
            
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
            const isOnAdmin = nextUrl.pathname.startsWith('/admin');

            if (isOnDashboard || isOnAdmin) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login page
            } else if (isLoggedIn) {
                // Determine where to redirect logged in users if they visit login/register?
                const isAuthPage = nextUrl.pathname.endsWith('/login') || nextUrl.pathname.endsWith('/register');
                if (isAuthPage) {
                    return Response.redirect(new URL('/dashboard', nextUrl));
                }
            }
            return true;
        },
    },
    providers: [], // Configured in auth.ts
} satisfies NextAuthConfig;
