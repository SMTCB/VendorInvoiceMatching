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
        <div className={cn("flex items-center", className)}>
            <img
                src="/logo.png"
                alt="AP + AI Logo"
                style={{ width: `${width}px`, height: 'auto', maxHeight: `${height}px` }}
                className="object-contain block"
            />
        </div>
    );
}
