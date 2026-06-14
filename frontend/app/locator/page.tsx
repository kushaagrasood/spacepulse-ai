"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Locator() {
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [cityName, setCityName] = useState<string | null>(null);
  const [locLoading, setLocLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        setLocation({ lat, lon });
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
          );
          const data = await res.json();
          const city = data.address?.city || data.address?.town || data.address?.village || "Your Location";
          const state = data.address?.state || "";
          setCityName(`${city}, ${state}`);
        } catch {
          setCityName(`${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E`);
        }
        setLocLoading(false);
      },
      () => setLocLoading(false)
    );
  }, []);

  const stellariumUrl = location
    ? `https://stellarium-web.org/?lat=${location.lat}&lng=${location.lon}&fov=60`
    : "https://stellarium-web.org/";

  return (
    <main className="relative min-h-screen flex flex-col overflow-hidden">
      <div className="aurora-bg"><div className="aurora-solar" /></div>

      <div className="relative z-10 flex flex-col flex-1 pt-14">

        {/* Header */}
        <div className="px-6 py-6 fade-up-1">
          <Link
            href="/dashboard"
            className="label-mono"
            style={{ color: 'var(--aurora)' }}
          >
            ← DASHBOARD
          </Link>
          <div className="flex items-end justify-between">
            <div>
              <h1
                className="text-3xl font-black"
                style={{
                  fontFamily: 'var(--font-display)',
                  letterSpacing: '-0.01em'
                }}
              >
                Sky <span style={{ color: 'var(--solar)' }}>Chart</span>
              </h1>
              <p
              className="text-sm mt-2"
              style={{
                color: "rgba(255,255,255,0.45)",
                fontFamily: "var(--font-body)",
              }}
            >
              Real-time celestial map
            </p>
            </div>

            {/* Quick tips */}
            <div className="hidden sm:flex gap-3">
              {[
                { icon: "🖱️", tip: "Drag to rotate" },
                { icon: "🔍", tip: "Scroll to zoom" },
                { icon: "🪐", tip: "Click objects" },
              ].map((t) => (
                <div key={t.tip} className="text-center px-3 py-2 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <p className="text-lg">{t.icon}</p>
                  <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{t.tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stellarium Embed */}
        <div className="fade-up-2 flex-1 px-6 pb-2">
          <div className="relative w-full overflow-hidden"
            style={{
              height: 'calc(100vh - 220px)',
              borderRadius: '1.25rem',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 0 60px rgba(123,47,255,0.15)',
            }}>

            {locLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10"
                style={{ background: '#0A0A0F' }}>
                <p className="text-4xl mb-4 animate-pulse">🌌</p>
                <p className="text-xs tracking-widest animate-pulse"
                  style={{ color: 'var(--aurora)', fontFamily: 'var(--font-display)'}}>
                  DETECTING LOCATION...
                </p>
              </div>
            )}

            {!locLoading && (
              <iframe
                src={stellariumUrl}
                className="w-full h-full"
                style={{ border: 'none', borderRadius: '1.25rem' }}
                allow="geolocation"
                title="Live Sky Chart"
              />
            )}

          </div>
        </div>

        {/* Credit */}
        <div className="px-6 py-3 text-center fade-up-3">
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
            Sky chart powered by{" "}
            <a href="https://stellarium-web.org" target="_blank" rel="noopener noreferrer"
              className="hover:opacity-70 transition underline underline-offset-2"
              style={{ color: 'rgba(255,255,255,0.35)' }}>
              Stellarium Web
            </a>
            {" "}— open source, GPL v2 licensed
          </p>
        </div>

      </div>
    </main>
  );
}