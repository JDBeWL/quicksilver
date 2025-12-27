import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Authentication - MyBlog",
    description: "Login or register to access your account",
};

export default function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex-1 flex flex-col">
            {children}
        </div>
    );
}
