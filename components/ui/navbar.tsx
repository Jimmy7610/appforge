"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutTemplate, BookOpen, LayoutDashboard, Settings } from "lucide-react";

export function Navbar() {
    const pathname = usePathname();

    const links = [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/library", label: "Library", icon: LayoutTemplate },
        { href: "/docs", label: "Docs", icon: BookOpen },
        { href: "/settings", label: "Settings", icon: Settings },
    ];

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Logo / Brand */}
                <div className="flex items-center">
                    <Link href="/dashboard" className="flex items-center gap-2 transition-opacity hover:opacity-80">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 shadow-sm">
                            <LayoutTemplate className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-lg font-bold tracking-tight text-white">
                            AppForge
                        </span>
                    </Link>
                </div>

                {/* Navigation Links */}
                <div className="hidden md:flex items-center gap-1">
                    {links.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href || pathname?.startsWith(link.href + "/");

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${isActive
                                        ? "bg-zinc-800 text-white shadow-sm"
                                        : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
                                    }`}
                            >
                                <Icon className="h-4 w-4" />
                                {link.label}
                            </Link>
                        );
                    })}
                </div>

                {/* Mobile Menu Button - Optional, could add a drawer later but keeping it minimal for now */}
                <div className="flex md:hidden items-center">
                    <Link href="/dashboard" className="text-sm font-medium text-zinc-400 hover:text-zinc-200">
                        Menu
                    </Link>
                </div>
            </div>
        </nav>
    );
}
