"use client";
import { useState, useEffect } from "react";
import { useLocation } from "@/context/LocationContext";
import Link from "next/link";

interface SkyData {
  kpIndex: number;
  event: string;

  weather: {
    cloudCover: number;
    visibility: string;
    temp: number;
    goodViewing: boolean;
  };

  iss: {
    nextPassMinutes: number;
    direction: string;
    elevation?: number;
  };

  moon: {
    illumination: number;
    phase: string;
    rise: string;
    set: string;
  };

  planets: {
    name: string;
    emoji: string;
    visible: boolean;
    rise: string;
    bestTime: string;
    magnitude: string;
    detail: string;
  }[];

  events: {
    type: string;
    name: string;
    emoji: string;
    time: string;
    detail: string;
  }[];
}

const fallbackData: SkyData = {
  kpIndex: 1.3,
  event: "nominal",

  weather: { cloudCover: 22, visibility: "Excellent", temp: 28, goodViewing: true },
  iss: { nextPassMinutes: 21, direction: "North-East", elevation: 57 },
  moon: { illumination: 18, phase: "Waxing Crescent", rise: "09:42 AM", set: "09:15 PM" },
  planets: [
    { name: "Jupiter", emoji: "🪐", visible: true, rise: "9:42 PM", bestTime: "11:30 PM", magnitude: "-2.4", detail: "" },
    { name: "Saturn",  emoji: "🪐", visible: true, rise: "10:15 PM", bestTime: "", magnitude: "", detail: "Rings visible with binoculars" },
    { name: "Mars",    emoji: "🔴", visible: false, rise: "", bestTime: "", magnitude: "", detail: "" },
    { name: "Venus",   emoji: "⭐", visible: true, rise: "6:30 AM", bestTime: "7:00 AM", magnitude: "-3.9", detail: "" },
  ],
  events: [
    { type: "METEOR SHOWER", name: "Perseid Peak", emoji: "☄️", time: "TOMORROW", detail: "Perseid peak · Expected 50–100 meteors/hr · Best after midnight" },
  ],
};

export default function SkyFeed() {
  const { location, loading: locLoading, error: locError } = useLocation();
  const [skyData, setSkyData] = useState<SkyData>(fallbackData);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
  if (locLoading) return;

  if (location?.lat && location?.lon) {
    fetchSkyData(location.lat, location.lon);
  } else {
    fetchSkyData(22.3, 70.7);
  }
}, [location, locLoading]);

  const fetchSkyData = async (lat: number, lon: number) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/events?lat=${lat}&lon=${lon}`
      );
      const data = await res.json();

      // Merge real data with fallback for things backend doesn't provide yet
      setSkyData((prev) => ({
        ...prev,

        kpIndex: data.kpIndex ?? prev.kpIndex,
        event: data.event ?? prev.event,

        weather: {
          cloudCover: data.weather?.cloudCover ?? prev.weather.cloudCover,
          visibility: data.weather?.cloudCover < 30 ? "Excellent" : data.weather?.cloudCover < 60 ? "Fair" : "Poor",
          temp: prev.weather.temp,
          goodViewing: data.weather?.goodViewing ?? prev.weather.goodViewing,
        },
        iss: {
          nextPassMinutes: data.iss?.nextPassMinutes ?? prev.iss.nextPassMinutes,
          direction: data.iss?.direction ?? prev.iss.direction,
          elevation: prev.iss.elevation,
        },
      }));
    } catch {
      // keep fallback data
    } finally {
      setDataLoading(false);
    }
  };

  const d = skyData;

  const viewingColor = d.weather.goodViewing ? '#4ADE80' : 'var(--solar)';
  const viewingLabel = d.weather.goodViewing ? 'EXCELLENT VIEWING CONDITIONS' : 'POOR VIEWING CONDITIONS';

  return (
    <main className="relative min-h-screen px-6 py-10 overflow-hidden" style={{ paddingTop: "5rem" }}>
      <div className="aurora-bg"><div className="aurora-solar" /></div>

      <div className="relative z-10 max-w-5xl mx-auto">

        {/* Header */}
        <div className="fade-up-1 mb-10">
          <Link href="/dashboard" className="text-xs tracking-widest mb-2 block hover:opacity-70 transition"
            style={{ color: 'var(--aurora)', fontFamily: 'var(--font-display)' }}>
            ← DASHBOARD
          </Link>
          <h1 className="text-3xl font-black" style={{ fontFamily: 'var(--font-display)' }}>
            Tonight's <span style={{ color: 'var(--aurora)' }}>Sky</span>
          </h1>
          <p
            className="text-sm mt-2"
            style={{
              color: "rgba(255,255,255,0.45)",
              fontFamily: "var(--font-body)",
            }}
          >
            Real-time celestial conditions, satellite passes and observation opportunities
          </p>
        </div>

        {/* Viewing Conditions */}
        <div className="fade-up-2 glass-card p-6 mb-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px"
            style={{ background: `linear-gradient(90deg, transparent, ${viewingColor}, transparent)` }} />
          <div className="flex items-center justify-between">
            <div>
              <p className="flex items-center gap-2 font-black text-lg mb-4"
                style={{ fontFamily: 'var(--font-display)', color: viewingColor }}>
                <span className="w-2 h-2 rounded-full animate-pulse inline-block"
                  style={{ background: viewingColor }} />
                {dataLoading ? "CHECKING CONDITIONS..." : viewingLabel}
              </p>
              <div className="flex gap-8">
                {[
                  { label: "CLOUD COVER", value: dataLoading ? "..." : `${d.weather.cloudCover}%` },
                  { label: "VISIBILITY", value: dataLoading ? "..." : d.weather.visibility },
                  { label: "TEMP", value: `${d.weather.temp}°C` },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="text-xs tracking-wider mb-1"
                      style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-display)' }}>
                      {s.label}
                    </p>
                    <p className="font-bold text-white">{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ISS + Planets grid */}
        <div className="fade-up-2 grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">

          {/* ISS — REAL DATA */}
          <div className="glass-card p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, var(--aurora), transparent)' }} />
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs tracking-widest mb-1"
                  style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-display)' }}>
                  SATELLITE · LIVE
                </p>
                <p className="font-black text-lg" style={{ fontFamily: 'var(--font-display)' }}>ISS PASS</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🛸</span>
                <span className="font-black text-2xl glow-aurora"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--aurora)' }}>
                  {dataLoading ? "..." : `${d.iss.nextPassMinutes} MIN`}
                </span>
              </div>
            </div>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Direction: <span className="text-white">{d.iss.direction}</span>
              {d.iss.elevation && <> · Elevation peak: <span className="text-white">{d.iss.elevation}°</span></>}
            </p>
          </div>

          {/* SPACE WEATHER */}
          <div className="glass-card p-5 relative overflow-hidden">
            <div
              className="absolute top-0 left-0 right-0 h-px"
              style={{
                background:
                  "linear-gradient(90deg, transparent, var(--solar), transparent)",
              }}
            />

            <div className="flex items-start justify-between mb-3">
              <div>
                <p
                  className="text-xs tracking-widest mb-1"
                  style={{
                    color: "rgba(255,255,255,0.4)",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  SPACE WEATHER
                </p>

                <p
                  className="font-black text-lg"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "var(--solar)",
                  }}
                >
                  KP INDEX
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-2xl">⚡</span>

                <span
                  className="font-black"
                  style={{
                    color:
                      d.kpIndex >= 5
                        ? "var(--solar)"
                        : d.kpIndex >= 3
                        ? "#FBB724"
                        : "#4ADE80",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  {d.kpIndex >= 5
                    ? "STORM"
                    : d.kpIndex >= 3
                    ? "ACTIVE"
                    : "QUIET"}
                </span>
              </div>
            </div>

            <p
              className="font-black text-3xl"
              style={{
                color:
                  d.kpIndex >= 5
                    ? "var(--solar)"
                    : d.kpIndex >= 3
                    ? "#FBB724"
                    : "#4ADE80",
                fontFamily: "var(--font-display)",
                fontSize: "23px",
              }}
            >
              KP {d.kpIndex.toFixed(1)}
            </p>

            <p
              className="text-sm mt-2"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              Current geomagnetic activity from NOAA monitoring.
            </p>
          </div>

          {/* OBSERVATION STATUS */}
          <div className="glass-card p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, #FBB724, transparent)' }} />
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs tracking-widest mb-1"
                  style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-display)' }}>
                  OBSERVATION
                </p>
                <p className="font-black text-lg" style={{ fontFamily: 'var(--font-display)', color: '#FBB724' }}>CURRENT STATE</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔭</span>
                <span className="font-black" style={{ color: '#FBB724', fontFamily: 'var(--font-display)' }}>
                  {d.weather.goodViewing ? "GOOD" : "POOR"}
                </span>
              </div>
            </div>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
              Cloud Cover: <span className="text-white">{d.weather.cloudCover}%</span>
              {" · "}
              Visibility: <span className="text-white">{d.weather.visibility}</span>
            </p>
          </div>

          {/* SPACE EVENT */}
          <div className="glass-card p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, var(--cosmic), transparent)' }} />
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs tracking-widest mb-1"
                  style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-display)' }}>
                  SPACE EVENT
                </p>
                <p className="font-black text-lg" style={{ fontFamily: 'var(--font-display)', color: 'var(--cosmic)' }}>STATUS</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🌌</span>
                <span
                  className="font-black"
                  style={{
                    color: "var(--cosmic)",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  {d.event.toUpperCase()}
                </span>
              </div>
            </div>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Current space event activity from backend monitoring.
            </p>
          </div>

        </div>

        {/* Meteor Shower */}
        <div className="fade-up-3 glass-card p-5 mb-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, var(--solar), transparent)' }} />
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-xs tracking-widest mb-1"
                style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-display)' }}>
                EVENT
              </p>
              <p className="font-black text-lg" style={{ fontFamily: 'var(--font-display)', color: 'var(--solar)' }}>
                ☄️ METEOR SHOWER
              </p>
            </div>
            <span className="badge-high text-xs px-3 py-1 rounded-full font-bold"
              style={{ fontFamily: 'var(--font-display)' }}>
              TOMORROW
            </span>
          </div>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Perseid peak · Expected 50–100 meteors/hr · Best after midnight
          </p>
        </div>

        {/* AI Night Planner CTA */}
        <div className="fade-up-4 glass-card p-8 text-center relative overflow-hidden"
          style={{ borderColor: 'rgba(123,47,255,0.3)' }}>
          <div className="absolute top-0 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, var(--cosmic), transparent)' }} />
          <p className="text-xs tracking-widest mb-2"
            style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-display)' }}>
            WANT A PERSONALIZED PLAN?
          </p>
          <h2 className="text-2xl font-black mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            AI <span style={{ color: 'var(--cosmic)' }}>NIGHT PLANNER</span>
          </h2>
          <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Tell our AI what you want to observe and get a custom viewing schedule based on your location, weather, and tonight's sky.
          </p>
          <Link href="/planner"
            className="inline-block font-bold px-8 py-3 rounded-xl transition-all duration-300 hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, var(--cosmic), #00F0FF)',
              fontFamily: 'var(--font-display)',
              fontSize: '0.8rem',
              letterSpacing: '0.05em',
              boxShadow: '0 0 30px rgba(123,47,255,0.4)',
            }}>
            OPEN NIGHT PLANNER →
          </Link>
        </div>

      </div>
    </main>
  );
}