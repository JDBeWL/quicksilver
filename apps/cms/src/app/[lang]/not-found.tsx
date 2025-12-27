import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center flex-1 h-full space-y-6 text-center">
            <div className="space-y-2">
                <h1 className="text-8xl font-black text-primary/10 select-none">404</h1>
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Page Not Found</h2>
                <p className="max-w-[500px] text-muted-foreground mx-auto">
                    The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                </p>
            </div>
            <Button asChild size="lg">
                <Link href="/">
                    Back to Home
                </Link>
            </Button>
        </div>
    );
}
