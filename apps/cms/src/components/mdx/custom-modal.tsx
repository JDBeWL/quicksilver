'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

interface CustomModalProps {
    title: string;
    triggerText: string;
    children: React.ReactNode;
    dict?: any; // Dictionary for i18n
}

export default function CustomModal({ title, triggerText, children, dict }: CustomModalProps) {
    // Get the close button text based on the dictionary or default
    const getCloseButtonText = () => {
        // Use dictionary if available, otherwise default to English
        if (dict && dict.modal) {
            return dict.modal.close || 'Close';
        }
        return 'Close';
    };
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">{triggerText}</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    {children}
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={() => setOpen(false)}>{getCloseButtonText()}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
