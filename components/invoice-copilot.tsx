"use client"

import { useState, useEffect, useRef } from 'react'
import { Send, Bot, User, RefreshCw, Paperclip, ChevronRight, Wand2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type Message = {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
    isTyping?: boolean
}

type InvoiceCopilotProps = {
    invoiceNumber: string;
    vendorName: string;
    status: string;
    exceptionReason?: string | null;
}

export function InvoiceCopilot({ invoiceNumber, vendorName, status, exceptionReason }: InvoiceCopilotProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: `Hello! I'm your AP Copilot. I've analyzed invoice **${invoiceNumber}** from **${vendorName}**.\n\nIt is currently **${status.replace(/_/g, ' ')}**. How can I help you?`,
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isThinking]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsThinking(true);

        // Simulate AI processing delay
        setTimeout(() => {
            const response = generateMockResponse(input, { invoiceNumber, vendorName, status, exceptionReason });
            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMsg]);
            setIsThinking(false);
        }, 1500);
    };

    const handleQuickAction = (action: string) => {
        setInput(action);
        // Optional: Auto-send or just populate
    };

    // Helper to clean up formatting for display
    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 border-l border-slate-200">
            {/* Chat Header */}
            <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between shadow-sm z-10">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg text-white shadow-md">
                        <Wand2 size={18} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-900">AP Copilot</h3>
                        <p className="text-xs text-indigo-600 font-medium flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                            Online
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setMessages([messages[0]])}
                    className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                    title="Reset Chat"
                >
                    <RefreshCw size={16} />
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth" ref={scrollRef}>
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={cn(
                            "flex gap-3 max-w-[85%]",
                            msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
                        )}
                    >
                        <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border shadow-sm",
                            msg.role === 'assistant' ? "bg-white text-indigo-600 border-indigo-100" : "bg-slate-200 text-slate-600 border-slate-300"
                        )}>
                            {msg.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
                        </div>

                        <div className={cn(
                            "rounded-2xl p-3 text-sm shadow-sm",
                            msg.role === 'assistant'
                                ? "bg-white border border-slate-200 text-slate-800 rounded-tl-none"
                                : "bg-blue-600 text-white rounded-tr-none"
                        )}>
                            <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                            <span className={cn(
                                "text-[10px] block mt-1 opacity-70",
                                msg.role === 'assistant' ? "text-slate-400" : "text-blue-100"
                            )}>
                                {formatTime(msg.timestamp)}
                            </span>
                        </div>
                    </div>
                ))}

                {isThinking && (
                    <div className="flex gap-3 max-w-[85%]">
                        <div className="w-8 h-8 rounded-full bg-white text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0 shadow-sm">
                            <Bot size={16} />
                        </div>
                        <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-3 shadow-sm flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                        </div>
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            {messages.length === 1 && (
                <div className="px-4 pb-2">
                    <p className="text-xs text-slate-400 mb-2 uppercase font-semibold tracking-wider">Suggested Actions</p>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => handleQuickAction("Explain the variance")}
                            className="text-xs bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 px-3 py-1.5 rounded-full transition-colors"
                        >
                            Explain variance?
                        </button>
                        <button
                            onClick={() => handleQuickAction("Draft rejection email")}
                            className="text-xs bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 px-3 py-1.5 rounded-full transition-colors"
                        >
                            Draft rejection email
                        </button>
                        <button
                            onClick={() => handleQuickAction("Show vendor history")}
                            className="text-xs bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 px-3 py-1.5 rounded-full transition-colors"
                        >
                            Vendor history
                        </button>
                    </div>
                </div>
            )}

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-200">
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
                    <button className="text-slate-400 hover:text-slate-600 p-1">
                        <Paperclip size={18} />
                    </button>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask Copilot..."
                        className="flex-1 bg-transparent border-none focus:outline-none text-sm text-slate-800 placeholder:text-slate-400"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isThinking}
                        className={cn(
                            "p-1.5 rounded-lg transition-colors",
                            input.trim() && !isThinking ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm" : "bg-slate-200 text-slate-400 cursor-not-allowed"
                        )}
                    >
                        <Send size={16} />
                    </button>
                </div>
                <div className="text-[10px] text-center text-slate-400 mt-2">
                    AI can make mistakes. Verify important info.
                </div>
            </div>
        </div>
    )
}

function generateMockResponse(input: string, context: any): string {
    const lowerInput = input.toLowerCase();

    if (lowerInput.includes('variance') || lowerInput.includes('error') || lowerInput.includes('wrong')) {
        if (context.status === 'BLOCKED_PRICE') {
            return `I've analyzed the line items. **Line 10** has a price variance.\n\n- PO Price: **$150.00**\n- Invoice Price: **$160.00**\n\nThe vendor is charging **6.6% more** than the agreed PO rate. This exceeds the 5% tolerance threshold.`;
        } else if (context.status === 'BLOCKED_QTY') {
            return `It looks like a quantity mismatch on **Line 10**.\n\n- Ordered: **1 unit**\n- Invoiced: **2 units**\n\nWe haven't received a Goods Receipt for the extra unit yet.`;
        } else {
            return `I don't see any major variances flagged by the system. The totals match the Purchase Order within tolerance.`;
        }
    }

    if (lowerInput.includes('email') || lowerInput.includes('draft') || lowerInput.includes('reject')) {
        return `Here is a draft rejection email for ${context.vendorName}:\n\n**Subject:** Invoice ${context.invoiceNumber} - Discrepancy Found\n\nDear Accounts Team,\n\nWe cannot process invoice ${context.invoiceNumber} due to a variance:\n\n> ${context.exceptionReason || 'Discrepancy between PO and Invoice'}\n\nPlease issue a credit note or provide a corrected invoice.\n\nRegards,\nAP Team`;
    }

    if (lowerInput.includes('history') || lowerInput.includes('vendor')) {
        return `**${context.vendorName}** History (Last 6 Months):\n\n- Total Invoices: **12**\n- Paid on Time: **10**\n- Rejected: **2**\n\nThey generally have clean invoices, but we had a similar price variance issue 2 months ago.`;
    }

    return `I can help you with that. I'm trained to analyze invoice discrepancies, check vendor compliance, and assist with processing actions. What specifically would you like to know about invoice ${context.invoiceNumber}?`;
}
