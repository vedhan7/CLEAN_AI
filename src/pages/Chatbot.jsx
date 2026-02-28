import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Sparkles, Loader2, RefreshCw } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';

const initialMessages = [
    { id: 1, role: 'ai', text: 'Hello! I am the CleanMadurai AI Assistant powered by Gemini. Ask me about waste management insights, track a complaint, or analyze Swachh Survekshan data.' }
];

const mockResponses = [
    "Based on my analysis of Ward 42, there's been a 15% increase in bulk waste dumping near the Vakkal modal street. I recommend dispatching LCV #TN59-AB-4022 to clear it.",
    "The Swachh Score Simulator indicates that improving Door-to-Door collection in Zone 3 by 10% will raise our overall city ranking by 2 positions.",
    "I've cross-referenced priority complaints. Currently, there are 3 critical 'overflowing bin' issues in South Gate. Would you like me to auto-assign the nearest available sanitation workers?",
    "According to the Leaderboard data, Councillor Ramesh of Ward 12 has achieved 90% segregation at source. This is a model ward we should study.",
    "I have logged your request. The analytics dashboard will be updated shortly with the new predictive model for waste generation during the upcoming Chithirai festival."
];

const Chatbot = () => {
    const [messages, setMessages] = useState(initialMessages);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = { id: Date.now(), role: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        // Simulate AI thinking and responding
        setTimeout(() => {
            const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
            const aiMsg = { id: Date.now() + 1, role: 'ai', text: randomResponse };
            setMessages(prev => [...prev, aiMsg]);
            setIsTyping(false);
        }, 1500);
    };

    const handleReset = () => {
        setMessages(initialMessages);
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 h-[calc(100vh-80px)] flex flex-col">
            <div className="mb-6 flex justify-between items-end">
                <div>
                    <h1 className="font-display font-bold text-4xl mb-2 flex items-center gap-3">
                        <Sparkles className="text-cyan-400" size={32} /> Ask Gemini AI
                    </h1>
                    <p className="text-[var(--c-gray-400)]">Your intelligent sanitation and city management assistant.</p>
                </div>
                <button onClick={handleReset} className="text-[var(--c-gray-400)] hover:text-white flex items-center gap-2 text-sm transition-colors border border-[var(--c-gray-500)]/30 rounded-lg px-3 py-1.5 hover:bg-white/5">
                    <RefreshCw size={14} /> Clear Chat
                </button>
            </div>

            <GlassCard className="flex-1 flex flex-col overflow-hidden p-0 border border-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.05)]">

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-[var(--c-emerald)] text-[var(--c-midnight)]' : 'bg-gradient-to-br from-cyan-400 to-blue-600 text-white'}`}>
                                {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                            </div>
                            <div className={`p-4 rounded-2xl ${msg.role === 'user' ? 'bg-[var(--c-emerald)]/10 border border-[var(--c-emerald)]/20 text-white rounded-tr-sm' : 'bg-white/5 border border-[var(--glass-border)] text-[var(--c-gray-300)] rounded-tl-sm'}`}>
                                <p className="leading-relaxed">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex gap-4 max-w-[85%]">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-gradient-to-br from-cyan-400 to-blue-600 text-white">
                                <Bot size={20} />
                            </div>
                            <div className="p-4 rounded-2xl bg-white/5 border border-[var(--glass-border)] text-[var(--c-gray-300)] rounded-tl-sm flex items-center gap-2">
                                <Loader2 className="animate-spin text-cyan-400" size={16} /> <span className="text-sm">Gemini is analyzing...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-[var(--c-midnight-lighter)] border-t border-[var(--glass-border)]">
                    <form onSubmit={handleSend} className="relative flex items-center">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about wards, LCV routes, or Swachh metrics..."
                            className="w-full bg-white/5 border border-[var(--glass-border)] rounded-full pl-6 pr-14 py-4 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-[var(--c-gray-500)]"
                            disabled={isTyping}
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isTyping}
                            className="absolute right-2 p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full text-white hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                        >
                            <Send size={18} className="translate-x-[1px] translate-y-[-1px]" />
                        </button>
                    </form>
                </div>
            </GlassCard>
        </div>
    );
};

export default Chatbot;
