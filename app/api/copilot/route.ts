import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

async function generateAIResponse(message: string, invoiceId: string) {
    // If no API key is set, fallback to mock (safety net)
    if (!process.env.GEMINI_API_KEY) {
        console.warn('GEMINI_API_KEY not found, using fallback mock.');
        return {
            text: `[Fallback Mode] I've analyzed Invoice #${invoiceId}. Please add your Gemini API Key to .env.local to enable real AI analysis.`
        };
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        const prompt = `
      You are an expert Accounts Payable Copilot.
      User is asking about Invoice #${invoiceId}.
      
      Context: The user is reviewing this invoice for potential discrepancies.
      
      User Question: "${message}"
      
      Provide a helpful, professional response. If the user asks to draft an email, draft it.
      If they ask for analysis, assume there is a price variance where Invoice Price > PO Price (Standard Issue).
      Keep it concise and actionable.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return { text: response.text() };

    } catch (error) {
        console.error('Gemini API Error:', error);
        return {
            text: "I'm having trouble connecting to my AI brain right now. Please try again later."
        };
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { message, invoiceId } = body;

        if (!message || !invoiceId) {
            return NextResponse.json(
                { error: 'Missing message or invoiceId' },
                { status: 400 }
            );
        }

        const aiResponse = await generateAIResponse(message, invoiceId);

        return NextResponse.json(aiResponse);
    } catch (error) {
        console.error('Copilot API Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
