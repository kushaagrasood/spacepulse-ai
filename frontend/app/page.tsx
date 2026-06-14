"use client";
import Link from "next/link";
import { useMemo, useEffect, useState, useRef } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface KpData {
  kpIndex: number | null;
  severity: number | null;
}

// ── Star field ────────────────────────────────────────────────────────────────
function StarField({ count = 130 }: { count?: number }) {
  const stars = useMemo(() => (
    Array.from({ length: count }, (_, i) => ({
      id: i,
      w: i % 15 === 0 ? 3.5 : i % 6 === 0 ? 2.5 : (((i * 7 + 13) % 12) / 10 + 0.8).toFixed(1),
      top:  (((i * 37 + 11) % 1000) / 10).toFixed(1),
      left: (((i * 53 +  7) % 1000) / 10).toFixed(1),
      dur:  (((i * 11 +  5) %   30) / 10 + 1.5).toFixed(1),
      delay:(((i * 17 +  3) %   50) / 10).toFixed(1),
      tint: i % 20 === 0 ? '#00E5FF' : i % 25 === 0 ? '#b39ddb' : '#ffffff',
    }))
  ), [count]);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
      {stars.map((s) => (
        <div key={s.id} style={{
          position: 'absolute',
          borderRadius: '50%',
          width: `${s.w}px`,
          height: `${s.w}px`,
          top: `${s.top}%`,
          left: `${s.left}%`,
          background: s.tint,
          animation: `twinkle ${s.dur}s ease-in-out ${s.delay}s infinite alternate`,
          opacity: 0.7,
        }} />
      ))}
    </div>
  );
}

// ── Marquee ───────────────────────────────────────────────────────────────────
function Marquee() {
  const items = [
    'REAL-TIME SPACE INTELLIGENCE',
    '✦',
    'NOAA · NASA · CELESTRAK',
    '✦',
    'GROQ LLAMA 3 ENGINE',
    '✦',
    'PROFESSION-AWARE INSIGHTS',
    '✦',
    'MONITOR THE SOLAR STORM',
    '✦',
  ];
  const text = items.join('   ');

  return (
    <div style={{
      borderTop: '1px solid rgba(0,229,255,0.12)',
      borderBottom: '1px solid rgba(0,229,255,0.12)',
      background: 'rgba(0,229,255,0.03)',
      overflow: 'hidden',
      position: 'relative',
      zIndex: 10,
      padding: '11px 0',
    }}>
      <div style={{
        display: 'flex',
        gap: '4rem',
        animation: 'marqueeScroll 28s linear infinite',
        whiteSpace: 'nowrap',
      }}>
        {[0, 1, 2].map((n) => (
          <span key={n} style={{
            fontSize: '10px',
            letterSpacing: '0.22em',
            color: 'rgba(0,229,255,0.5)',
            fontFamily: 'var(--font-display, monospace)',
            fontWeight: 600,
          }}>
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar() {
  return (
    <nav style={{
      position: 'relative',
      zIndex: 20,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 48px',
      height: '62px',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
      background: 'rgba(0,0,0,0.45)',
      backdropFilter: 'blur(12px)',
    }}>
      {/* Logo */}
      <span style={{
        fontFamily: 'var(--font-display, monospace)',
        fontWeight: 700,
        fontSize: '15px',
        letterSpacing: '0.1em',
        color: '#E8EAF6',
      }}>
        SPACE<span style={{ color: '#00E5FF' }}>PULSE</span>
        <span style={{
          marginLeft: '6px',
          fontSize: '10px',
          letterSpacing: '0.15em',
          color: 'rgba(0,229,255,0.5)',
          verticalAlign: 'middle',
        }}>AI</span>
      </span>

      <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
        {[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Sky Feed', href: '/sky-feed' },
          { label: 'Night Planner', href: '/planner' },
          { label: 'AI Chat', href: '/chat' },
          { label: 'Sky Chart', href: '/locator' },
        ].map((link) => (
          <Link key={link.href} href={link.href} style={{
            fontSize: '12px',
            letterSpacing: '0.12em',
            color: 'rgba(255,255,255,0.45)',
            textDecoration: 'none',
            textTransform: 'uppercase',
            transition: 'color 0.2s',
            fontFamily: 'var(--font-display, monospace)',
          }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#00E5FF')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

// ── Live KP Counter ───────────────────────────────────────────────────────────
function LiveKpCounter() {
  const [kp, setKp] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [pulse, setPulse] = useState(false);

  const fetchKp = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/events`
      );

      const data = await res.json();

      if (data?.kpIndex !== undefined) {
        setKp(Number(data.kpIndex));

        setPulse(true);

        setTimeout(() => {
          setPulse(false);
        }, 600);
      }
    } catch (err) {
      console.error("Failed to fetch KP Index:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKp();
    const interval = setInterval(fetchKp, 60_000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  // Color based on severity
  const kpColor = kp == null ? '#00E5FF'
    : kp >= 7 ? '#FF5722'
    : kp >= 5 ? '#FF9800'
    : '#00E5FF';

  const kpLabel =
    kp == null
      ? "--"
      : kp >= 7
      ? "SEVERE STORM"
      : kp >= 5
      ? "GEOMAGNETIC STORM"
      : kp >= 3
      ? "UNSETTLED"
      : "QUIET";

  return (
    <div style={{
      position: 'relative',
      zIndex: 10,
      flexShrink: 0,
      padding: '32px 36px',
      background: `rgba(${kp != null && kp >= 7 ? '255,87,34' : '0,229,255'},0.04)`,
      border: `1px solid rgba(${kp != null && kp >= 7 ? '255,87,34' : '0,229,255'},0.18)`,
      borderRadius: '16px',
      backdropFilter: 'blur(10px)',
      textAlign: 'center',
      minWidth: '200px',
      transition: 'border-color 0.5s ease, background 0.5s ease',
    }}>
      {/* Live badge */}
      <div style={{
        fontSize: '10px',
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        color: kpColor,
        fontFamily: 'var(--font-display, monospace)',
        fontWeight: 600,
        marginBottom: '14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '7px',
      }}>
        <span style={{
          width: '7px', height: '7px',
          borderRadius: '50%',
          background: kpColor,
          display: 'inline-block',
          animation: 'livePulse 1.5s infinite',
          transition: 'background 0.5s',
        }} />
        LIVE KP INDEX
      </div>

      {/* Number */}
      <div style={{
        fontFamily: 'var(--font-display, monospace)',
        fontSize: '60px',
        fontWeight: 700,
        lineHeight: 1,
        color: kpColor,
        transition: 'color 0.5s ease',
        transform: pulse ? 'scale(1.08)' : 'scale(1)',
        display: 'block',
      }}>
        {loading ? "--" : kp?.toFixed(2)}
      </div>

      {/* Label */}
      <div style={{
        marginTop: '10px',
        fontSize: '11px',
        letterSpacing: '0.18em',
        color: 'rgba(255,255,255,0.35)',
        fontFamily: 'var(--font-display, monospace)',
      }}>
        {kpLabel}
      </div>

      {/* Scale bar */}
      <div style={{
        marginTop: '18px',
        height: '3px',
        borderRadius: '2px',
        background: 'rgba(255,255,255,0.08)',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${kp != null ? (kp / 9) * 100 : 0}%`,
          background: `linear-gradient(90deg, #00E5FF, ${kpColor})`,
          borderRadius: '2px',
          transition: 'width 0.8s ease, background 0.5s ease',
        }} />
      </div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '5px',
        fontSize: '9px',
        color: 'rgba(255,255,255,0.2)',
        fontFamily: 'var(--font-display, monospace)',
      }}>
        <span>0</span><span>9</span>
      </div>
    </div>
  );
}

// ── Intro screen ──────────────────────────────────────────────────────────────
function IntroScreen({ onEnter }: { onEnter: () => void }) {
  const [showHint, setShowHint] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowHint(true), 1800);
    return () => clearTimeout(t);
  }, []);

  const handleClick = () => {
    setExiting(true);
    setTimeout(onEnter, 900);
  };

  return (
    <div onClick={handleClick} style={{
      position: 'fixed', inset: 0, zIndex: 50,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer',
      background: 'radial-gradient(ellipse at 50% 55%, rgba(0,229,255,0.05) 0%, #000 65%)',
      opacity: exiting ? 0 : 1,
      transform: exiting ? 'scale(1.04)' : 'scale(1)',
      transition: exiting
        ? 'opacity 0.85s cubic-bezier(0.4,0,0.2,1), transform 0.85s cubic-bezier(0.4,0,0.2,1)'
        : 'none',
    }}>
      <p style={{
        fontFamily: 'var(--font-display, monospace)',
        fontWeight: 700,
        fontSize: 'clamp(2.8rem, 8vw, 6rem)',
        letterSpacing: '0.06em',
        lineHeight: 1,
        marginBottom: '1.25rem',
        color: '#E8EAF6',
        animation: 'brandPulse 3s ease-in-out infinite alternate',
      }}>
        SpacePulse<span style={{ color: '#00E5FF' }}> AI</span>
      </p>

      <p style={{
        fontSize: '10px',
        letterSpacing: '0.22em',
        color: 'rgba(255,255,255,0.22)',
        textTransform: 'uppercase',
        fontFamily: 'var(--font-display, monospace)',
        animation: 'fadeIn 0.8s 1s both',
      }}>
        Real-time space intelligence
      </p>

      <div style={{
        position: 'absolute', bottom: '2.5rem',
        left: '50%', transform: 'translateX(-50%)',
        textAlign: 'center',
        opacity: showHint ? 1 : 0,
        transition: 'opacity 0.7s ease',
      }}>
        <div style={{
          width: '44px', height: '44px', borderRadius: '50%',
          border: '1px solid rgba(0,229,255,0.35)',
          margin: '0 auto 0.75rem',
          animation: 'rippleAnim 1.8s ease-out infinite',
        }} />
        <p style={{
          fontSize: '10px', letterSpacing: '0.18em',
          color: 'rgba(255,255,255,0.28)',
          textTransform: 'uppercase',
          fontFamily: 'var(--font-display, monospace)',
        }}>
          click anywhere to enter
        </p>
      </div>
    </div>
  );
}

// ── Features strip ────────────────────────────────────────────────────────────
const FEATURES = [
  {
    label: 'Live Data Feeds',
    desc: 'NOAA Kp index and NASA DONKI solar flares updated every 60 seconds.',
    icon: (
      <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#00E5FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
  {
    label: 'Profession Aware',
    desc: 'Tailored impact scores for pilots, astronomers, engineers, and more.',
    icon: (
      <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#00E5FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
  },
  {
    label: 'Groq AI Engine',
    desc: 'Llama 3 analyses events in real time and explains what they mean for you.',
    icon: (
      <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#00E5FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a10 10 0 1 0 10 10" /><path d="M12 6v6l4 2" />
      </svg>
    ),
  },
  {
    label: 'ISS Pass Tracker',
    desc: 'Know exactly when and where the International Space Station flies over you.',
    icon: (
      <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#00E5FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" /><path d="M12 2v4M12 18v4M2 12h4M18 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" />
      </svg>
    ),
  },
];

function FeaturesStrip() {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      borderTop: '1px solid rgba(255,255,255,0.07)',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
      background: 'rgba(0,0,0,0.55)',
      backdropFilter: 'blur(8px)',
      position: 'relative',
      zIndex: 10,
    }}>
      {FEATURES.map((f, i) => (
        <div key={f.label} style={{
          padding: '44px 40px',
          borderRight: i < FEATURES.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none',
        }}>
          <span style={{ display: 'block', marginBottom: '16px' }}>{f.icon}</span>
          <h3 style={{
            fontFamily: 'var(--font-display, monospace)',
            fontSize: '14px',
            fontWeight: 700,
            color: '#E8EAF6',
            letterSpacing: '0.06em',
            margin: '0 0 10px',
            textTransform: 'uppercase',
          }}>
            {f.label}
          </h3>
          <p style={{
            fontSize: '13px',
            color: 'rgba(255,255,255,0.38)',
            lineHeight: 1.7,
            margin: 0,
          }}>
            {f.desc}
          </p>
        </div>
      ))}
    </div>
  );
}

// ── Stats bar ─────────────────────────────────────────────────────────────────
const STATS = [
  { value: 'LIVE', label: 'NOAA + NASA feeds' },
  { value: '6',    label: 'professions supported' },
  { value: '<1s',  label: 'AI response time' },
  { value: '24/7', label: 'solar monitoring' },
];

function StatsBar() {
  return (
    <div style={{
      display: 'flex',
      gap: '48px',
      padding: '20px 48px',
      background: '#0a0a0a',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      alignItems: 'center',
      flexWrap: 'wrap',
      position: 'relative',
      zIndex: 10,
    }}>
      {STATS.map((s) => (
        <div key={s.label} style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
          <span style={{
            fontFamily: 'var(--font-display, monospace)',
            fontSize: '18px',
            fontWeight: 700,
            color: '#00E5FF',
            letterSpacing: '0.05em',
          }}>
            {s.value}
          </span>
          <span style={{
            fontSize: '11px',
            letterSpacing: '0.12em',
            color: 'rgba(255,255,255,0.28)',
            textTransform: 'uppercase',
          }}>
            {s.label}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <div style={{
      position: 'relative',
      zIndex: 10,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '80px 48px 72px',
      gap: '48px',
    }}>
      {/* Aurora glow */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `
          radial-gradient(ellipse at 25% 60%, rgba(0,229,255,0.07) 0%, transparent 55%),
          radial-gradient(ellipse at 70% 35%, rgba(255,87,34,0.05) 0%, transparent 50%)
        `,
      }} />

      {/* Left: Headline */}
      <div style={{ flex: 1, maxWidth: '580px' }}>
        <p style={{
          fontSize: '10px',
          letterSpacing: '0.25em',
          color: '#00E5FF',
          fontFamily: 'var(--font-display, monospace)',
          fontWeight: 600,
          textTransform: 'uppercase',
          marginBottom: '20px',
        }}>
          Real-Time Space Intelligence
        </p>

        <h1 style={{
          fontSize: 'clamp(2.6rem, 5.5vw, 4.2rem)',
          fontWeight: 700,
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
          color: '#E8EAF6',
          margin: '0 0 10px',
        }}>
          What's happening{' '}
          <span style={{ color: '#FF5722' }}>
          <br />above you right now?</span>
        </h1>

        <p style={{
          fontSize: '1rem',
          color: 'rgba(232,234,246,0.48)',
          lineHeight: 1.75,
          maxWidth: '480px',
          marginBottom: '40px',
        }}>
          SpacePulse AI turns raw solar data into{' '}
          <span style={{ color: 'rgba(0,229,255,0.85)' }}>profession-aware insights</span>{' '}
          — so a geomagnetic storm means something different to a pilot than it does to an astronomer.
        </p>

        <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
          <Link href="/dashboard" style={{
            display: 'inline-block',
            fontWeight: 600,
            padding: '14px 32px',
            borderRadius: '12px',
            fontSize: '12px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            textDecoration: 'none',
            fontFamily: 'var(--font-display, monospace)',
            background: 'linear-gradient(135deg, #FF5722 0%, #FF8C42 100%)',
            color: '#fff',
            boxShadow: '0 0 32px rgba(255,87,34,0.3)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.03)';
              e.currentTarget.style.boxShadow = '0 0 44px rgba(255,87,34,0.45)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 0 32px rgba(255,87,34,0.3)';
            }}
          >
            Check the sky →
          </Link>

          <Link href="/assistant" style={{
            display: 'inline-block',
            padding: '13px 28px',
            borderRadius: '12px',
            fontSize: '12px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            textDecoration: 'none',
            fontFamily: 'var(--font-display, monospace)',
            border: '1px solid rgba(0,229,255,0.25)',
            color: 'rgba(0,229,255,0.7)',
            transition: 'border-color 0.2s, color 0.2s',
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(0,229,255,0.6)';
              e.currentTarget.style.color = '#00E5FF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(0,229,255,0.25)';
              e.currentTarget.style.color = 'rgba(0,229,255,0.7)';
            }}
          >
            Ask AI →
          </Link>
        </div>
      </div>

      {/* Right: Live KP Counter */}
      <LiveKpCounter />
    </div>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{
      background: '#0a0a0a',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      padding: '24px 48px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '16px',
      position: 'relative',
      zIndex: 10,
    }}>
      <div>
        <p style={{
          fontFamily: 'var(--font-display, monospace)',
          fontSize: '13px',
          fontWeight: 700,
          color: '#00E5FF',
          marginBottom: '4px',
          letterSpacing: '0.1em',
        }}>
          SPACEPULSE AI
        </p>
        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', margin: 0 }}>
          Real-time solar intelligence for everyone.
        </p>
      </div>
    </footer>
  );
}

// ── Home page content ─────────────────────────────────────────────────────────
function HomePage() {
  return (
    <main style={{ position: 'relative', minHeight: '100svh', display: 'flex', flexDirection: 'column' }}>
      <StarField />
      <Navbar />
      <Marquee />
      <Hero />
      <FeaturesStrip />
      <StatsBar />
      <div style={{ flex: 1, background: '#000' }} />
      <Footer />
    </main>
  );
}

// ── Root: intro → home ────────────────────────────────────────────────────────
export default function Page() {
  const [stage, setStage] = useState<'intro' | 'entering' | 'home'>('intro');

  const handleEnter = () => {
    setStage('entering');
    setTimeout(() => setStage('home'), 900);
  };

  return (
    <>
      {/* Global keyframes — inject once */}
      <style>{`
        @keyframes twinkle    { from { opacity: 0.15; } to { opacity: 0.9; } }
        @keyframes brandPulse { from { opacity: 0.82; } to { opacity: 1; }   }
        @keyframes fadeIn     { from { opacity: 0; }   to { opacity: 1; }   }
        @keyframes rippleAnim { 0% { transform: scale(1); opacity: 0.8; } 100% { transform: scale(1.7); opacity: 0; } }
        @keyframes marqueeScroll { 0% { transform: translateX(0); } 100% { transform: translateX(-33.33%); } }
        @keyframes livePulse  { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
      `}</style>

      <div style={{ position: 'relative', minHeight: '100svh', background: '#000' }}>
        {/* Intro overlay */}
        {stage !== 'home' && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 50 }}>
            <StarField count={140} />
            <IntroScreen onEnter={handleEnter} />
          </div>
        )}

        {/* Main content */}
        {stage !== 'intro' && (
          <div style={{
            opacity: stage === 'home' ? 1 : 0,
            transform: stage === 'home' ? 'scale(1)' : 'scale(0.97)',
            transition: 'opacity 0.8s 0.1s cubic-bezier(0.16,1,0.3,1), transform 0.8s 0.1s cubic-bezier(0.16,1,0.3,1)',
          }}>
            <HomePage />
          </div>
        )}
      </div>
    </>
  );
}
