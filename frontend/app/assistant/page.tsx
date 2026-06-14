"use client";
import { useState, useRef, useEffect } from "react";
import { useLocation } from "@/context/LocationContext";
import Link from "next/link";

interface Message {
  role: "user" | "assistant";
  content: string;
  suggestions?: string[];
}

const SUGGESTIONS = [
  "What is a geomagnetic storm?",
  "Can I see Alpha Centauri from India?",
  "How does solar wind affect satellites?",
  "What's the best telescope for beginners?",
  "Why do auroras happen?",
  "Is Pluto visible with a telescope?",
];

export default function Assistant() {
  const { location } = useLocation();

  const currentLocation =
    location?.city || "Unknown Location";
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hi! I'm SpacePulse AI 🌌\n\nI'm your personal space weather and astronomy assistant. I'll tailor my answers to what's relevant for your skies.\n\nAsk me anything — space weather, visible objects, telescope tips, or what's happening above you right now.`,
    },
  ]);
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (text?: string) => {
    const question = text || input.trim();
    if (!question || loading) return;
    setInput("");

    const userMsg: Message = { role: "user", content: question };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/assistant`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: `The user is located in ${currentLocation}. ${question}`,
          }),
        }
      );
  const data = await res.json();

  setMessages((prev) => [
    ...prev,
    {
      role: "assistant",
      content: data.reply,
      suggestions: data.suggestions || [],
    },
  ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I couldn't reach the server. Please check your connection and try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex flex-col overflow-hidden"
      style={{ minHeight: '100svh', paddingTop: '4rem' }}>
      <div className="aurora-bg"><div className="aurora-solar" /></div>

      <div className="relative z-10 flex flex-col max-w-3xl w-full mx-auto px-6"
        style={{ flex: 1, paddingBottom: '1.5rem' }}>

        {/* Header */}
        <div className="fade-up-1 pt-6 pb-6">
          <p className="label-mono mb-2" style={{ color: 'var(--aurora)' }}>
            ← <Link href="/dashboard" className="hover:opacity-70 transition">Dashboard</Link>
          </p>
          <h1 className="text-3xl font-bold mb-1" style={{ letterSpacing: '-0.01em' }}>
            SpacePulse <span style={{ color: 'var(--aurora)' }}>AI</span>
          </h1>
          <p
          className="text-sm mt-2"
          style={{
            color: "rgba(255,255,255,0.45)",
            fontFamily: "var(--font-body)",
          }}
        >
          Ask away and I shall answer!
        </p>
        </div>

        {/* Suggestion chips — only shown before first user message */}
        {messages.length === 1 && (
          <div className="fade-up-2 flex flex-wrap gap-2 mb-4">
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => handleSend(s)}
                className="text-xs px-3 py-1.5 rounded-full transition-all hover:scale-105"
                style={{
                  background: 'rgba(0,229,255,0.07)',
                  border: '1px solid rgba(0,229,255,0.15)',
                  color: 'rgba(255,255,255,0.6)',
                }}>
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Message thread */}
        <div className="flex-1 space-y-4 mb-4 overflow-y-auto pr-1"
          style={{ maxHeight: 'calc(100svh - 320px)' }}>
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full shrink-0 mr-3 mt-1 flex items-center justify-center text-xs font-black"
                  style={{ background: 'linear-gradient(135deg, var(--cosmic), var(--aurora))', fontFamily: 'var(--font-display)' }}>
                  SP
                </div>
              )}
              <div
                className="max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed"
                style={msg.role === 'user' ? {
                  background: 'linear-gradient(135deg, rgba(124,58,237,0.35), rgba(0,229,255,0.15))',
                  border: '1px solid rgba(124,58,237,0.3)',
                  color: 'rgba(255,255,255,0.9)',
                  borderBottomRightRadius: '4px',
                } : {
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  color: 'rgba(232,234,246,0.85)',
                  borderBottomLeftRadius: '4px',
                  whiteSpace: 'pre-wrap',
                }}>
                {msg.content}
                {msg.role === "assistant" &&
                  msg.suggestions &&
                  msg.suggestions.length > 0 && (
                    <div
                      style={{
                        marginTop: "12px",
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "8px",
                      }}
                    >
                      {msg.suggestions.map((s, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(s)}
                          className="text-xs px-3 py-1.5 rounded-full transition-all hover:scale-105"
                          style={{
                            background: "rgba(123,47,255,0.12)",
                            border: "1px solid rgba(123,47,255,0.25)",
                            color: "rgba(255,255,255,0.75)",
                          }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex justify-start">
              <div className="w-7 h-7 rounded-full shrink-0 mr-3 mt-1 flex items-center justify-center text-xs font-black"
                style={{ background: 'linear-gradient(135deg, var(--cosmic), var(--aurora))', fontFamily: 'var(--font-display)' }}>
                SP
              </div>
              <div className="px-4 py-3 rounded-2xl flex items-center gap-1.5"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderBottomLeftRadius: '4px',
                }}>
                {[0,1,2].map((i) => (
                  <div key={i} className="w-2 h-2 rounded-full animate-bounce"
                    style={{ background: 'var(--aurora)', opacity: 0.7, animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="glass-card p-3 flex gap-3 items-center">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Ask about space weather, stars, planets…"
            disabled={loading}
            className="flex-1 px-3 py-2 rounded-xl text-sm outline-none bg-transparent"
            style={{
              color: 'white',
              caretColor: 'var(--aurora)',
            }}
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="px-5 py-2 rounded-xl text-xs font-semibold transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            style={{
              background: 'linear-gradient(135deg, var(--cosmic), var(--aurora))',
              fontFamily: 'var(--font-display)',
              letterSpacing: '0.06em',
              boxShadow: '0 0 16px rgba(124,58,237,0.3)',
            }}>
            SEND →
          </button>
        </div>

      </div>
    </main>
  );
}