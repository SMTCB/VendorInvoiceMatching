import { cn } from "@/lib/utils"

export function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        PROCESSING: 'bg-blue-100 text-blue-800 border-blue-200',
        READY_TO_POST: 'bg-green-100 text-green-800 border-green-200',
        BLOCKED_PRICE: 'bg-red-100 text-red-800 border-red-200',
        BLOCKED_QTY: 'bg-orange-100 text-orange-800 border-orange-200',
        POSTED: 'bg-gray-100 text-gray-800 border-gray-200',
        REJECTED: 'bg-red-50 text-red-600 border-red-200',
        AWAITING_INFO: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }

    return (
        <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium border", styles[status] || 'bg-gray-100 text-gray-800 border-gray-200')}>
            {status.replace(/_/g, ' ')}
        </span>
    )
}
