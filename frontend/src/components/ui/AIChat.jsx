import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, User, Loader2, Database, AlertCircle } from 'lucide-react';
import { authHeaders, API_BASE } from '../../lib/auth';

export default function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'ai',
      text: 'I am the TRACK AI Assistant. I can analyze recent market news, track your portfolio sentiment, or assess geopolitical risks. How can I help you today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/chat/ask`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ message: userMsg })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch AI response');
      }

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'ai',
        text: data.reply,
        sources: data.sources
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'ai',
        isError: true,
        text: 'System Error: Unable to connect to the TRACK AI Engine. Please verify your connection.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:shadow-[0_0_30px_rgba(34,211,238,0.6)] transition-all group z-50 flex items-center justify-center"
      >
        <Bot className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-[22rem] md:w-96 h-[32rem] bg-black/40 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] flex flex-col z-50 overflow-hidden font-sans">

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
            <Bot className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">TRACK Intelligence</h3>
            <p className="text-xs text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Gemini 1.5 Active
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>

              <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center mt-1 border">
                {msg.role === 'user' ? (
                  <div className="w-full h-full bg-white/10 border-white/20 rounded-full flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-gray-300" />
                  </div>
                ) : (
                  <div className={`w-full h-full rounded-full flex items-center justify-center ${msg.isError ? 'bg-red-500/20 border-red-500/30' : 'bg-cyan-500/20 border-cyan-500/30'}`}>
                    {msg.isError ? <AlertCircle className="w-3.5 h-3.5 text-red-400" /> : <Bot className="w-3.5 h-3.5 text-cyan-400" />}
                  </div>
                )}
              </div>

              <div className={`p-3 rounded-2xl text-sm ${
                msg.role === 'user'
                  ? 'bg-cyan-600/20 text-white border border-cyan-500/30 rounded-tr-none'
                  : msg.isError
                    ? 'bg-red-500/10 text-red-200 border border-red-500/20 rounded-tl-none'
                    : 'bg-white/5 text-gray-200 border border-white/10 rounded-tl-none'
              }`}>
                <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>

                {msg.sources?.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Database className="w-3 h-3" /> Grounded Context
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.sources.map((src, i) => (
                        <span key={i} className="text-[10px] bg-black/40 border border-white/10 px-2 py-1 rounded-md text-cyan-200 truncate max-w-full">
                          {src}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-3 max-w-[85%] flex-row">
              <div className="w-7 h-7 rounded-full flex-shrink-0 bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center mt-1">
                <Bot className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="p-3 bg-white/5 border border-white/10 rounded-2xl rounded-tl-none flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                <span className="text-xs text-cyan-400 animate-pulse">Processing vast datasets...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-white/10 bg-black/20">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about Indian stocks..."
            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:bg-white/5 transition-all"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 p-1.5 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
