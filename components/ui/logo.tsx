import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
    className?: string;
    showText?: boolean;
}

export function Logo({ className, showText = true }: LogoProps) {
    return (
        <div className={cn("flex items-center gap-2", className)}>
            <div className="relative h-10 w-auto aspect-[3/1]">
                <Image
                    src="/logo.png"
                    alt="AP + AI Logo"
                    fill
                    className="object-contain object-left"
                    priority
                />
            </div>
        </div>
    );
}
