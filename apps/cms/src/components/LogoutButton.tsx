'use client';

import { ComponentProps } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { logoutAction } from '@/app/actions';

interface LogoutButtonProps extends ComponentProps<'div'> {
    text: string;
}

export default function LogoutButton({ text, className, onClick, ...props }: LogoutButtonProps) {
    const router = useRouter();

    async function handleLogout() {
        await logoutAction(); // Server action
    }

    return (
        <div
            onClick={(e) => {
                handleLogout();
                onClick?.(e);
            }}
            className={cn("flex items-center gap-2 cursor-pointer w-full", className)}
            {...props}
        >
            <LogOut className="h-4 w-4" />
            <span>{text}</span>
        </div>
    );
}
