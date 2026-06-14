"use client";
import { useState } from "react";
import Link from "next/link";

interface PlanItem {
  time: string;
  object: string;
  emoji: string;
  detail: string;
  type: "planet" | "satellite" | "lunar" | "event";
}

interface Plan {
  bestWindow: string;
  conditions: string;
  items: PlanItem[];
  tips: string[];
}

const typeColor: Record<string, string> = {
  planet:    'var(--solar)',
  satellite: 'var(--aurora)',
  lunar:     '#7C3AED',
  event:     '#FBB724',
};

// These are the ONLY questions the planner handles.
// All are observation-planning questions the AI can answer well.
const PRESET_QUESTIONS = [
  { label: "What can I observe tonight?",        icon: "🌌" },
  { label: "Plan a 2-hour stargazing session",   icon: "⏱️" },
  { label: "What's visible before midnight?",    icon: "🌙" },
  { label: "Best planets to see this week",      icon: "🪐" },
  { label: "When does the ISS pass tonight?",    icon: "🛸" },
  { label: "Is there a meteor shower soon?",     icon: "☄️" },
];

const LOCATION = "Rajkot, Gujarat, India";
const WEATHER  = { cloudCover: 22, visibility: "Excellent" };
const OBJECTS  = ["Jupiter", "Saturn", "Venus", "Mars", "ISS", "Moon"];

export default function Planner() {
  const [selected, setSelected] = useState<string | null>(null);
  const [plan, setPlan]         = useState<Plan | null>(null);
  const [loading, setLoading]   = useState(false);

  const handleSelect = async (question: string) => {
    setSelected(question);
    setLoading(true);
    setPlan(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/planner`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question,
            location: LOCATION,
            weather: WEATHER,
            visibleObjects: OBJECTS,
          }),
        }
      );
      const data = await res.json();
      setPlan(data);
    } catch {
      setPlan({
        bestWindow: "10:00 PM – 1:00 AM",
        conditions: "Excellent — 22% cloud cover, clear skies after 9 PM.",
        items: [
          { time: "9:47 PM",  object: "ISS Pass",  emoji: "🛸", detail: "ISS flies over heading NE at 57° elevation. Visible for ~6 min.", type: "satellite" },
          { time: "10:30 PM", object: "Jupiter",    emoji: "🪐", detail: "Jupiter rises SE. Best time to see cloud bands and Galilean moons.", type: "planet" },
          { time: "11:00 PM", object: "Saturn",     emoji: "🪐", detail: "Saturn follows Jupiter. Ring system visible with binoculars.", type: "planet" },
          { time: "11:45 PM", object: "Moon",       emoji: "🌕", detail: "Moon at 70% illumination, great for crater detail.", type: "lunar" },
        ],
        tips: [
          "Let your eyes dark-adapt for 20 minutes before observing",
          "Use red light only to preserve night vision",
          "Set an alarm for the ISS pass — it moves fast!",
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen px-6 overflow-hidden"
      style={{ paddingTop: '5.5rem', paddingBottom: '3rem' }}>
      <div className="aurora-bg"><div className="aurora-solar" /></div>

      <div className="relative z-10 max-w-3xl mx-auto">

        {/* Header */}
        <div className="fade-up-1 mb-10">
          <p className="label-mono mb-2" style={{ color: 'var(--aurora)' }}>
            ← <Link href="/dashboard" className="hover:opacity-70 transition">Dashboard</Link>
          </p>
          <h1 className="text-3xl font-bold mb-1" style={{ letterSpacing: '-0.01em' }}>
            AI <span style={{ color: 'var(--cosmic)' }}>Night Planner</span>
          </h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Pick what you want to plan — we'll build your perfect viewing schedule
          </p>
        </div>

        {/* Preset question grid */}
        <div className="fade-up-2 mb-8">
          <p className="label-mono mb-4">Choose a question</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PRESET_QUESTIONS.map((q) => {
              const isActive = selected === q.label;
              return (
                <button
                  key={q.label}
                  onClick={() => handleSelect(q.label)}
                  disabled={loading}
                  className="text-left px-5 py-4 rounded-xl transition-all duration-250 disabled:opacity-50"
                  style={{
                    background: isActive
                      ? 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(0,229,255,0.1))'
                      : 'rgba(255,255,255,0.03)',
                    border: isActive
                      ? '1px solid rgba(124,58,237,0.5)'
                      : '1px solid rgba(255,255,255,0.07)',
                    boxShadow: isActive ? '0 4px 24px rgba(124,58,237,0.2)' : 'none',
                  }}>
                  <span className="text-xl block mb-2">{q.icon}</span>
                  <span className="text-sm font-medium" style={{
                    color: isActive ? 'white' : 'rgba(255,255,255,0.65)',
                  }}>
                    {q.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Want to ask something else */}
        <div className="fade-up-2 mb-8 glass-card px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium mb-0.5">Have a different space question?</p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Ask our AI assistant anything about space weather, events, or astronomy.
            </p>
          </div>
          <Link href="/assistant"
            className="shrink-0 ml-4 px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, var(--cosmic), var(--aurora))',
              fontFamily: 'var(--font-display)',
              letterSpacing: '0.06em',
              boxShadow: '0 0 16px rgba(124,58,237,0.3)',
            }}>
            ASK AI →
          </Link>
        </div>

        {/* Loading */}
        {loading && (
          <div className="glass-card p-8 text-center mb-6">
            <p className="label-mono animate-pulse mb-4" style={{ color: 'var(--aurora)' }}>
              Planning your night…
            </p>
            <div className="flex justify-center gap-1.5">
              {[0,1,2].map((i) => (
                <div key={i} className="w-2 h-2 rounded-full animate-bounce"
                  style={{ background: 'var(--cosmic)', animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}

        {/* Plan Result */}
        {plan && !loading && (
          <div className="space-y-4 fade-up-1">

            {/* Best Window */}
            <div className="glass-card p-5 relative overflow-hidden"
              style={{ borderColor: 'rgba(124,58,237,0.3)' }}>
              <div className="absolute top-0 left-0 right-0 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, var(--cosmic), transparent)' }} />
              <div className="flex items-center justify-between mb-2">
                <p className="label-mono">Best Viewing Window</p>
                <span className="badge-low text-xs px-3 py-1 rounded-full"
                  style={{ fontFamily: 'var(--font-display)', fontSize: '0.6rem', letterSpacing: '0.1em' }}>
                  TONIGHT
                </span>
              </div>
              <p className="text-2xl font-bold glow-cosmic mb-2"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--cosmic)' }}>
                {plan.bestWindow}
              </p>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {plan.conditions}
              </p>
            </div>

            {/* Timeline */}
            <div className="glass-card p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, var(--aurora), transparent)' }} />
              <p className="label-mono mb-6">Your Viewing Schedule</p>
              <div className="space-y-4">
                {(plan?.items || []).map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="text-right shrink-0 w-20">
                      <p className="text-xs font-bold"
                        style={{ fontFamily: 'var(--font-display)', color: typeColor[item.type] }}>
                        {item.time}
                      </p>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full mt-0.5 shrink-0"
                        style={{ background: typeColor[item.type], boxShadow: `0 0 8px ${typeColor[item.type]}` }} />
                      {i < (plan?.items || []).length - 1 && (
                        <div className="w-px flex-1 mt-1"
                          style={{ background: 'rgba(255,255,255,0.07)', minHeight: '24px' }} />
                      )}
                    </div>
                    <div className="pb-4">
                      <p className="font-semibold flex items-center gap-2 mb-1">
                        <span>{item.emoji}</span>
                        <span style={{ color: typeColor[item.type], fontSize: '0.85rem' }}>
                          {item.object}
                        </span>
                      </p>
                      <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
                        {item.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="glass-card p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, #FBB724, transparent)' }} />
              <p className="label-mono mb-4">Pro Tips</p>
              <div className="space-y-3">
                {(plan?.tips || []).map((tip, i) => (
                  <div key={i} className="flex gap-3 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    <span style={{ color: '#FBB724', fontFamily: 'var(--font-display)', fontSize: '0.7rem', marginTop: '2px' }}>
                      0{i + 1}
                    </span>
                    <p>{tip}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </main>
  );
}