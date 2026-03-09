import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function BackToDashboard() {
    return (
        <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors mb-6 group"
        >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to Dashboard
        </Link>
    );
}
