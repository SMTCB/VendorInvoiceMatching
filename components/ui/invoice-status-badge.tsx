'use client'

import { cn } from "@/lib/utils"
import {
    Clock,
    CheckCircle,
    AlertCircle,
    Layers,
    HelpCircle,
    PauseCircle,
    Copy,
    Database,
    XCircle,
    Info
} from 'lucide-react'
import React from "react"

export const STATUS_DESCRIPTIONS: Record<string, string> = {
    PROCESSING: 'AI is currently extracting data and running matching logic.',
    READY_TO_POST: '3-way match successful or variance within rules. Ready for SAP.',
    BLOCKED_PRICE: 'Unit price mismatch detected beyond defined tolerance.',
    BLOCKED_QTY: 'Quantity mismatch detected against Purchase Order or Goods Receipt.',
    BLOCKED_DUPLICATE: 'An invoice with this number and vendor already exists in the system.',
    BLOCKED_DATA: 'Fundamental data missing (e.g., invalid PO number or OCR failure).',
    POSTED: 'Invoice has been successfully posted to SAP ERP.',
    REJECTED: 'Invoice has been rejected and will not be processed further.',
    AWAITING_INFO: 'Pending external clarification (e.g., short delivery or buyer review).',
    PARKED: 'Manual hold by user for later review.'
}

export function StatusBadge({ status, showTooltip = true }: { status: string, showTooltip?: boolean }) {
    const styles: Record<string, string> = {
        PROCESSING: 'bg-indigo-50 text-indigo-700 border-indigo-100 shadow-indigo-100/20',
        READY_TO_POST: 'bg-emerald-50 text-emerald-700 border-emerald-100 shadow-emerald-100/20',
        BLOCKED_PRICE: 'bg-rose-50 text-rose-700 border-rose-100 shadow-rose-100/20',
        BLOCKED_QTY: 'bg-orange-50 text-orange-700 border-orange-100 shadow-orange-100/20',
        BLOCKED_DUPLICATE: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100 shadow-fuchsia-100/20',
        BLOCKED_DATA: 'bg-stone-50 text-stone-700 border-stone-200 shadow-stone-100/20',
        POSTED: 'bg-slate-50 text-slate-600 border-slate-200',
        REJECTED: 'bg-red-50 text-red-700 border-red-100 shadow-red-100/20',
        AWAITING_INFO: 'bg-purple-50 text-purple-700 border-purple-100 shadow-purple-100/20',
        PARKED: 'bg-cyan-50 text-cyan-700 border-cyan-100 shadow-cyan-100/20'
    }

    const icons: Record<string, React.ReactNode> = {
        PROCESSING: <Clock size={12} className="animate-spin-slow" />,
        READY_TO_POST: <CheckCircle size={12} />,
        BLOCKED_PRICE: <AlertCircle size={12} />,
        BLOCKED_QTY: <AlertCircle size={12} />,
        BLOCKED_DUPLICATE: <Copy size={12} />,
        BLOCKED_DATA: <Database size={12} />,
        POSTED: <CheckCircle size={12} />,
        REJECTED: <XCircle size={12} />,
        AWAITING_INFO: <Info size={12} />,
        PARKED: <PauseCircle size={12} />
    }

    const description = STATUS_DESCRIPTIONS[status] || 'Unknown status status'

    return (
        <div className="flex items-center gap-2 group/status">
            <span className={cn(
                "px-3 py-1.5 rounded-xl text-[10px] font-black border flex items-center gap-2 w-fit uppercase tracking-wider shadow-sm transition-all duration-300",
                styles[status] || 'bg-gray-100 text-gray-800 border-gray-200'
            )}>
                {icons[status] || <Layers size={12} />}
                {status.replace(/_/g, ' ')}
            </span>
            {showTooltip && (
                <div className="relative flex items-center">
                    <HelpCircle size={14} className="text-slate-300 group-hover/status:text-brand-blue transition-colors cursor-help" />
                    <div className="absolute left-full ml-2 px-3 py-2 bg-slate-900 text-white text-[11px] rounded-lg opacity-0 group-hover/status:opacity-100 transition-opacity pointer-events-none w-48 z-[60] shadow-xl border border-slate-800 font-medium leading-relaxed">
                        <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-slate-900 rotate-45 border-l border-b border-slate-800" />
                        {description}
                    </div>
                </div>
            )}
        </div>
    )
}
