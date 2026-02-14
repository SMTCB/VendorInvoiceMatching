'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function InvoiceActions({ invoiceId, status }: { invoiceId: string, status: string }) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleAction = async (action: 'POST' | 'REJECT') => {
        setLoading(true)
        try {
            // In a real app, this would call an API route or Server Action
            // For now, we update Supabase directly

            const newStatus = action === 'POST' ? 'POSTED' : 'REJECTED'

            const { error } = await supabase
                .from('invoices')
                .update({ status: newStatus })
                .eq('id', invoiceId)

            if (error) throw error

            // Trigger n8n webhook here in future
            console.log(`Triggering n8n action: ${action} for ${invoiceId}`)

            router.refresh()
        } catch (error) {
            console.error('Error updating invoice:', error)
            alert('Failed to update invoice')
        } finally {
            setLoading(false)
        }
    }

    if (status === 'POSTED' || status === 'REJECTED') {
        return null // No actions allowed
    }

    return (
        <div className="flex items-center gap-3">
            <button
                onClick={() => handleAction('REJECT')}
                disabled={loading}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
                Reject
            </button>
            <button
                onClick={() => handleAction('POST')}
                disabled={loading}
                className="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
                {loading ? 'Processing...' : 'Post Invoice'}
            </button>
        </div>
    )
}
