'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2 } from 'lucide-react';

export default function DeletePostButton({ postId }: { postId: string }) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);

    async function handleDelete() {
        if (!confirm('Are you sure you want to delete this post?')) return;

        setIsDeleting(true);
        try {
            await fetch(`/api/posts/${postId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            });
            router.refresh();
        } catch (error) {
            console.error('Failed to delete', error);
            setIsDeleting(false);
        }
    }

    return (
        <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        </Button>
    );
}
