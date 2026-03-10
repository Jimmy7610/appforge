"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

interface Option {
    value: string;
    label: string;
}

interface CustomSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: Option[];
    className?: string;
    minWidth?: string;
}

export function CustomSelect({ value, onChange, options, className = "", minWidth = "160px" }: CustomSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.value === value) || options[0];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div
            ref={containerRef}
            className={`relative ${className}`}
            style={{ minWidth }}
        >
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-zinc-200 outline-none transition-all hover:bg-white/10 focus:border-white/30"
            >
                <span className="truncate">{selectedOption?.label}</span>
                <ChevronDown className={`h-4 w-4 text-zinc-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isOpen && (
                <div className="absolute left-0 right-0 z-50 mt-2 max-h-60 overflow-y-auto rounded-xl border border-zinc-700 bg-zinc-900 p-1 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-100">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                                onChange(option.value);
                                setIsOpen(false);
                            }}
                            className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${option.value === value
                                    ? "bg-zinc-800 text-white font-medium"
                                    : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                                }`}
                        >
                            <span>{option.label}</span>
                            {option.value === value && <Check className="h-4 w-4 text-blue-400" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
