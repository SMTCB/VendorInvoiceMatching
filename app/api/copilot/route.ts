import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

async function generateAIResponse(message: string, invoiceId: string, context: any) {
    if (!process.env.GEMINI_API_KEY) {
        return { text: "[Fallback] Please add GEMINI_API_KEY to .env.local" };
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
      You are an expert Accounts Payable Copilot for the "Vendor Invoice Matching Platform".
      Current Invoice Context:
      - ID: ${invoiceId}
      - Vendor: ${context.vendorName}
      - Status: ${context.status}
      - Exception Reason: ${context.exceptionReason || 'None'}
      
      USER QUESTION: "${message}"
      
      INSTRUCTIONS:
      1. Provide a professional, analytical response based on the context.
      2. If the status is BLOCKED, explain logically why (e.g., price mismatch, missing data).
      3. If the user asks for an email, draft a professional inquiry to the vendor.
      4. Use markdown for tables/bolding to make it readable.
      5. Keep it concise but insightful.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return { text: response.text() };

    } catch (error) {
        console.error('Gemini API Error:', error);
        return { text: "I'm having trouble connecting to my AI brain. Check your API key." };
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { message, invoiceId, context } = body;

        if (!message || !invoiceId) {
            return NextResponse.json({ error: 'Missing params' }, { status: 400 });
        }

        const aiResponse = await generateAIResponse(message, invoiceId, context || {});
        return NextResponse.json(aiResponse);
    } catch (error) {
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
