import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, RefreshCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { getGeminiModel } from '../lib/gemini';

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Vanakkam! Nan Ungal CleanMadurai AI uthaviyalar. (Hello! I am your CleanMadurai AI assistant.) How can I help you regarding waste management in your ward today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const model = getGeminiModel();

      // We pass the conversation context to the prompt
      const contextPrompt = `
        You are the official CleanMadurai.AI civic assistant.
        You understand both English and Tamil fluently.
        Respond in the language the user speaks to you. 
        If they speak 'Tanglish' (Tamil words written in English alphabet), reply in Tanglish or English.
        Be extremely concise, polite, and helpful regarding solid waste management, booking LCV trucks, or reporting issues.
        Do NOT answer questions outside of civic duties, waste management, or Madurai city information.
        
        Prior Conversation:
        ${messages.map(m => `${m.role}: ${m.content}`).join('\n')}
        
        user: ${userMessage}
        assistant:
      `;

      const result = await model.generateContent(contextPrompt);
      const response = result.response.text();

      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error("Chat error:", error);
      // Remove the last user message from state so they can tap retry or re-type cleanly
      setMessages(prev => prev.slice(0, -1));
      setInput(userMessage); // Put their typed message back into the input box
      toast.error('Network timeout connecting to AI. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      { role: 'assistant', content: 'Vanakkam! Nan Ungal CleanMadurai AI uthaviyalar. How can I help you regarding waste management in your ward today?' }
    ]);
  };

  return (
    <div className="container" style={{ paddingTop: '100px', height: '100vh', display: 'flex', flexDirection: 'column', maxWidth: '800px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
        <h1 className="animate-fade-in-up">AI Assistant / AI உதவியாளர்</h1>
        <button onClick={clearChat} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--c-gray-400)' }}>
          <RefreshCcw size={16} /> Reset
        </button>
      </div>

      <div className="glass-card animate-fade-in-up delay-100" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>

        <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-md)', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          {messages.map((msg, i) => (
            <div key={i} style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              gap: '12px'
            }}>
              {msg.role === 'assistant' && (
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--c-emerald)', color: 'var(--c-midnight)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Bot size={20} />
                </div>
              )}

              <div style={{
                background: msg.role === 'user' ? 'var(--c-emerald)' : 'var(--c-midnight-light)',
                color: msg.role === 'user' ? 'var(--c-midnight)' : 'var(--c-white)',
                padding: '12px 16px',
                borderRadius: 'var(--radius-sm)',
                maxWidth: '80%',
                border: msg.role === 'user' ? 'none' : '1px solid var(--glass-border)',
                lineHeight: '1.5'
              }}>
                {msg.content}
              </div>

              {msg.role === 'user' && (
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', color: 'var(--c-white)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <User size={20} />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--c-emerald)', color: 'var(--c-midnight)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={20} />
              </div>
              <div style={{ background: 'var(--c-midnight-light)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)', color: 'var(--c-gray-400)' }}>
                Thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} style={{ display: 'flex', padding: 'var(--space-sm)', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid var(--glass-border)' }}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="Type your message in English or Tamil / தமிழில் தட்டச்சு செய்க..."
            style={{ flex: 1, padding: '16px', background: 'transparent', border: 'none', color: 'white', outline: 'none', fontSize: '1rem' }}
          />
          <button type="submit" disabled={isLoading || !input.trim()} style={{ background: 'var(--c-emerald)', color: 'var(--c-midnight)', padding: '0 24px', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: isLoading || !input.trim() ? 0.5 : 1 }}>
            <Send size={20} />
          </button>
        </form>

      </div>
    </div>
  );
}
