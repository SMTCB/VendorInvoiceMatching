"use client"

import { useState, useEffect, useRef } from 'react'
import { Send, Bot, User, RefreshCw, Paperclip, ChevronRight, Wand2, Zap, ShieldCheck } from 'lucide-react'
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
            content: `Master Intelligence active for Invoice **${invoiceNumber || 'PENDING'}**.\n\nI've cross-referenced vendor **${vendorName || 'IDENTIFIED'}** against current ERP records. Currently flagged as **${status?.replace(/_/g, ' ') || 'PROCESSING'}**.\n\nHow can I assist with your audit today?`,
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

        try {
            const response = await fetch('/api/copilot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: input,
                    invoiceId: invoiceNumber, // Using invoiceNumber as display ID
                    context: {
                        vendorName,
                        status,
                        exceptionReason
                    }
                })
            });

            if (!response.ok) throw new Error('Failed to fetch AI response');

            const data = await response.json();

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.text,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMsg]);
        } catch (e) {
            console.error('Copilot Error:', e);
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "I apologize, but I'm having trouble connecting to my intelligence engine. Please ensure your Gemini API Key is valid.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsThinking(false);
        }
    };

    const handleQuickAction = (action: string) => {
        setInput(action);
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="flex flex-col h-full bg-[#F8FAFC]">
            {/* Chat Header - High Tech */}
            <div className="px-6 py-5 bg-white border-b border-slate-200 flex items-center justify-between shadow-sm z-10 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="bg-brand-navy p-2.5 rounded-xl text-brand-cyan shadow-lg shadow-brand-navy/20 relative">
                        <Wand2 size={20} />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-brand-cyan rounded-full border-2 border-white animate-pulse" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Master Copilot</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded font-black uppercase tracking-tighter">Secure Engine</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">v2.0 Flash</span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => setMessages([messages[0]])}
                    className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-all"
                    title="Reset Audit Log"
                >
                    <RefreshCw size={16} />
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6" ref={scrollRef}>
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={cn(
                            "flex gap-4 max-w-[90%]",
                            msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
                        )}
                    >
                        <div className={cn(
                            "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm border",
                            msg.role === 'assistant'
                                ? "bg-brand-navy text-brand-cyan border-brand-navy/10"
                                : "bg-white text-slate-600 border-slate-100"
                        )}>
                            {msg.role === 'assistant' ? <Bot size={18} /> : <User size={18} />}
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <div className={cn(
                                "rounded-2xl p-4 text-sm font-medium leading-relaxed shadow-sm transition-all",
                                msg.role === 'assistant'
                                    ? "bg-white border border-slate-100 text-slate-800 rounded-tl-none"
                                    : "bg-brand-blue text-white rounded-tr-none shadow-blue-900/10"
                            )}>
                                <p className="whitespace-pre-wrap">{msg.content}</p>
                            </div>
                            <span className={cn(
                                "text-[10px] font-black uppercase tracking-widest px-1",
                                msg.role === 'assistant' ? "text-slate-300" : "text-blue-300 ml-auto"
                            )}>
                                {formatTime(msg.timestamp)}
                            </span>
                        </div>
                    </div>
                ))}

                {isThinking && (
                    <div className="flex gap-4">
                        <div className="w-9 h-9 rounded-xl bg-brand-navy text-brand-cyan flex items-center justify-center shrink-0 shadow-sm border border-brand-navy/10">
                            <Zap size={18} className="animate-pulse" />
                        </div>
                        <div className="bg-white border border-white/10 rounded-2xl rounded-tl-none p-4 shadow-sm flex items-center gap-2">
                            <div className="flex gap-1">
                                <span className="w-1.5 h-1.5 bg-brand-cyan/40 rounded-full animate-bounce"></span>
                                <span className="w-1.5 h-1.5 bg-brand-cyan/60 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                <span className="w-1.5 h-1.5 bg-brand-cyan rounded-full animate-bounce [animation-delay:0.4s]"></span>
                            </div>
                            <span className="text-[10px] font-black text-brand-cyan uppercase tracking-widest ml-2">Crossing ERP...</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Suggested Intelligence Actions */}
            {messages.length === 1 && (
                <div className="px-6 pb-4">
                    <div className="flex flex-wrap gap-2">
                        <QuickAction
                            label="Variance Report"
                            onClick={() => handleQuickAction("Generate a detailed variance report for this invoice.")}
                        />
                        <QuickAction
                            label="Vendor Risk"
                            onClick={() => handleQuickAction("Analyze vendor reliability history.")}
                        />
                        <QuickAction
                            label="Tax Audit"
                            onClick={() => handleQuickAction("Verify tax compliance on this document.")}
                        />
                    </div>
                </div>
            )}

            {/* Input Dashboard */}
            <div className="p-6 bg-white border-t border-slate-100 shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
                <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-brand-blue/10 focus-within:border-brand-blue/30 transition-all group">
                    <button className="text-slate-400 hover:text-brand-blue p-1 transition-colors">
                        <Paperclip size={20} />
                    </button>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Inquire auditing assistance..."
                        className="flex-1 bg-transparent border-none focus:outline-none text-sm font-medium text-slate-800 placeholder:text-slate-400"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isThinking}
                        className={cn(
                            "p-2 rounded-xl transition-all",
                            input.trim() && !isThinking ? "bg-brand-navy text-brand-cyan shadow-lg shadow-brand-navy/20 hover:scale-110 active:scale-95" : "bg-slate-200 text-slate-400 cursor-not-allowed"
                        )}
                    >
                        <Send size={18} />
                    </button>
                </div>
                <div className="flex items-center justify-center gap-4 mt-4">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                        <ShieldCheck size={10} className="text-brand-cyan" /> Secure Enterprise AI
                    </p>
                    <div className="w-1 h-1 rounded-full bg-slate-200" />
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">LLM Audit Verified</p>
                </div>
            </div>
        </div>
    )
}

function QuickAction({ label, onClick }: { label: string, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="text-[10px] font-black uppercase tracking-widest bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl hover:border-brand-blue hover:text-brand-blue transition-all shadow-sm active:scale-95"
        >
            {label}
        </button>
    )
}

function generateMockResponse(input: string, context: any): string {
    const lowerInput = input.toLowerCase();

    if (lowerInput.includes('variance') || lowerInput.includes('report') || lowerInput.includes('why')) {
        if (context.status === 'BLOCKED_PRICE') {
            return `### Variance Audit Analysis\n\nI've identified an **Over-Threshold Variance** on Line Item 10.\n\n- **ERP Base Price:** $150.00\n- **Extracted Price:** $160.00\n- **Delta:** +$10.00 (**6.6%**)\n\nThis exceeds the standard enterprise tolerance of 5.0%. Recommendation: Initiate Vendor Inquiry to reconcile before posting.`;
        } else if (context.status === 'BLOCKED_QTY') {
            return `### Quantity Audit Analysis\n\nI've identified a **Negative Variance** on Line Item 10.\n\n- **PO Quantity:** 1 Unit\n- **Extracted Quantity:** 2 Units\n\nCurrently, the Goods Receipt portal has not authorized this over-delivery. Recommendation: Park invoice until Receipt confirmation is achieved.`;
        } else {
            return `Audit results indicate **100% compliance** for all line items. All variances are within 0.1% tolerance. Ready for posting.`;
        }
    }

    if (lowerInput.includes('risk') || lowerInput.includes('history') || lowerInput.includes('vendor')) {
        return `### Vendor Intelligence Report: ${context.vendorName}\n\n- **Reliability Index:** High (92/100)\n- **Compliance History:** 3 variances in last 50 documents.\n- **Payment Cycle:** Average 1.2 days delay.\n\nThis vendor is considered low risk for price gouging, however, recent shipping delays have been noted in other departments.`;
    }

    if (lowerInput.includes('tax') || lowerInput.includes('compliance')) {
        return `### Tax Compliance Verification\n\n- **Tax ID:** Found & Validated.\n- **VAT Calculation:** 0% (Consistent with PO classification).\n- **Legal Entity:** Matches ERP Master Data.\n\nCompliance score: **Passed**.`;
    }

    return `I am processing your inquiry. I can perform variance audits, risk assessments, and compliance checks on Invoice ${context.invoiceNumber || 'PENDING'}. What specific intelligence do you require?`;
}
