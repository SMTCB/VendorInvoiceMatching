import { NextResponse } from 'next/server'

export async function POST() {
    const webhookUrl = process.env.N8N_INGESTION_WEBHOOK_URL

    if (!webhookUrl) {
        console.error('N8N_INGESTION_WEBHOOK_URL is not configured')
        return NextResponse.json(
            { error: 'System not configured. Please add n8n Webhook URL to .env' },
            { status: 500 }
        )
    }

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                source: 'web_portal_manual_poll',
                timestamp: new Date().toISOString()
            }),
        })

        if (!response.ok) {
            throw new Error(`n8n responded with ${response.status}`)
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('n8n trigger error:', error)
        return NextResponse.json(
            { error: 'Failed to contact n8n. Check if n8n is running and reachable.' },
            { status: 500 }
        )
    }
}
