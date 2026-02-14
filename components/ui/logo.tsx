import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
    className?: string;
    showText?: boolean;
}

export function Logo({ className, showText = true }: LogoProps) {
    return (
        <div className={cn("flex items-center gap-2", className)}>
            <div className="relative w-8 h-8 flex items-center justify-center bg-blue-600 rounded-lg shadow-sm overflow-hidden text-white font-bold select-none">
                {/* Abstract "Document + AI" shape */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 relative z-10">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14 2z" />
                    <path d="M14 2v6h6" />
                    <path d="M12 18v-6" />
                    <path d="M9 15h6" />
                </svg>
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-700 to-indigo-500 opacity-50" />
            </div>

            {showText && (
                <span className="font-bold text-xl tracking-tight text-slate-900">
                    <span className="text-blue-600">AP</span>+AI
                </span>
            )}
        </div>
    );
}
