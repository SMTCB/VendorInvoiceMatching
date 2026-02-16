import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
    className?: string;
    showText?: boolean;
    width?: number;
    height?: number;
}

export function Logo({ className, showText = true, width = 120, height = 40 }: LogoProps) {
    return (
        <div className={cn("flex items-center gap-2", className)}>
            <div className="relative overflow-hidden" style={{ width, height }}>
                <Image
                    src="/logo.png"
                    alt="AP + AI Logo"
                    fill
                    className="object-contain"
                    priority
                />
            </div>
        </div>
    );
}
