"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import ProfessionSelector from "@/components/ProfessionSelector";
import EventCard from "@/components/EventCard";
import ImpactCard from "@/components/ImpactCard";
import HeatmapChart from "@/components/HeatmapChart";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

interface SpaceEvent {
  event: string;
  severity: number;
  kpIndex: number;
  solarFlare: string | null;
  iss: { nextPassMinutes: number; direction: string } | null;
  weather: { cloudCover: number; goodViewing: boolean } | null;
}

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function Dashboard() {
  const [selectedProfession, setSelectedProfession] = useState<string | null>(null);
  const [spaceEvent, setSpaceEvent] = useState<SpaceEvent | null>(null);
  const [eventLoading, setEventLoading] = useState(true);
  const [impact, setImpact] = useState<any>(null);
  const [impactLoading, setImpactLoading] = useState(false);
  const [heatmapScores, setHeatmapScores] = useState<{profession: string, score: number}[] | null>(null);
  const [heatmapLoading, setHeatmapLoading] = useState(false);
  const [history, setHistory] = useState([]);

  // ── Fetch live event on mount ──────────────────────────────────────────────
useEffect(() => {
  async function fetchHistory() {
    try {
      const res = await fetch(`${BACKEND}/api/history`);
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadEvent() {
    try {
      const getCoords = () =>
        new Promise<{ lat: number; lon: number }>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) =>
              resolve({
                lat: pos.coords.latitude,
                lon: pos.coords.longitude,
              }),
            () => resolve({ lat: 22.3, lon: 70.7 })
          );
        });

      const { lat, lon } = await getCoords();

      const res = await fetch(
        `${BACKEND}/api/events?lat=${lat}&lon=${lon}`
      );

      const data = await res.json();

      setSpaceEvent(data);

      fetchHeatmapScores(data);
    } catch {
      setSpaceEvent({
        event: "geomagnetic storm",
        severity: 7,
        kpIndex: 7,
        solarFlare: "X1.4",
        iss: { nextPassMinutes: 21, direction: "NE" },
        weather: { cloudCover: 30, goodViewing: true },
      });
    } finally {
      setEventLoading(false);
    }
  }

  loadEvent();
  fetchHistory();
}, []);

  // ── Call AI engine when profession selected ────────────────────────────────
  const handleProfessionSelect = async (profession: string) => {
    if (!spaceEvent) return;
    setSelectedProfession(profession);
    setImpactLoading(true);
    setImpact(null);

    try {
      const res = await fetch(`${BACKEND}/api/impact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profession,
          event: spaceEvent.event,
          severity: spaceEvent.severity,
        }),
      });
      const data = await res.json();
      setImpact(data);
    } catch {
      setImpact({
        impactScore: 8,
        summary: "High disruption expected across communication and navigation systems.",
        recommendation: "Monitor backup channels and delay sensitive operations where possible.",
      });
    } finally {
      setImpactLoading(false);
    }
  };
  
  const fetchHeatmapScores = async (event: SpaceEvent) => {
  setHeatmapLoading(true);
  const professions = ["pilot", "photographer", "farmer", "student", "researcher", "astronomer", "satellite ops", "airline ops", "maritime"];
  try {
    const results = await Promise.all(
      professions.map((p) =>
        fetch(`${BACKEND}/api/impact`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profession: p, event: event.event, severity: event.severity }),
        }).then((r) => r.json())
      )
    );
    setHeatmapScores(
      professions.map((p, i) => ({
        profession: p.charAt(0).toUpperCase() + p.slice(1),
        score: results[i]?.impactScore ?? 5,
      }))
    );
  } catch {
    // keep heatmap using severity fallback
  } finally {
    setHeatmapLoading(false);
  }
};

  // Normalise event into EventCard props
  const eventCardProps = spaceEvent
    ? {
        eventType:  spaceEvent.event,
        severity:   spaceEvent.severity,
        kpIndex:    spaceEvent.kpIndex  ?? 0,
        solarFlare: spaceEvent.solarFlare ?? "NONE",
      }
    : { eventType: "Loading…", severity: 0, kpIndex: 0, solarFlare: "—" };
      const historyChartData = history
      .slice(0, 200)
      .reverse()
      .map((item: any) => ({
        time: new Date(item.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        kp: item.kpIndex,
      }));    
      const totalSnapshots = history.length;

    const highestKP =
      history.length > 0
        ? Math.max(...history.map((h: any) => h.kpIndex || 0))
        : 0;

    const avgCloudCover =
      history.length > 0
        ? (
            history.reduce(
              (sum: number, h: any) =>
                sum + (h.cloudCover || 0),
              0
            ) / history.length
          ).toFixed(1)
        : "0";
      const cloudChartData = history
      .slice(0, 200)
      .reverse()
      .map((item: any) => ({
        time: new Date(item.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        cloud: item.cloudCover ?? 0,
      }));
  return (
    <main className="relative min-h-screen px-6 py-10 overflow-hidden"
      style={{ paddingTop: '5.5rem' }}> {/* clear the fixed navbar */}

      <div className="aurora-bg"><div className="aurora-solar" /></div>

      <div className="relative z-10 max-w-5xl mx-auto">

        {/* Header */}
        <div className="fade-up-1 flex items-center justify-between mb-10">
          <div>
            <Link href="/"
              className="label-mono mb-2 block hover:opacity-70 transition"
              style={{ color: 'var(--aurora)' }}>
              ← SpacePulse AI
            </Link>
            <h1 className="text-3xl font-bold" style={{ letterSpacing: '-0.01em' }}>
              Mission <span style={{ color: 'var(--solar)' }}>Control</span>
            </h1>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Live space weather · Personalized for you
            </p>
          </div>
          <div className="text-right">
            <p className="label-mono mb-2">Status</p>
            <div className="flex items-center gap-2 justify-end">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#4ADE80' }} />
              <span className="text-sm font-medium" style={{ color: '#4ADE80' }}>
                {eventLoading ? "Connecting…" : "Live Feed"}
              </span>
            </div>
          </div>
        </div>

        {/* Event Card */}
        <div className="fade-up-2 mb-8">
          {eventLoading ? (
            <div className="glass-card p-8 text-center">
              <p className="label-mono animate-pulse" style={{ color: 'var(--aurora)' }}>
                Fetching space weather…
              </p>
            </div>
          ) : (
            <EventCard {...eventCardProps} />
          )}
        </div>

        {/* ISS + Weather pills — only if data exists */}
        {spaceEvent && (spaceEvent.iss || spaceEvent.weather) && (
          <div className="fade-up-2 flex flex-wrap gap-3 mb-8">
            {spaceEvent.iss && (
              <div className="glass-card px-4 py-2.5 flex items-center gap-3">
                <span style={{ color: 'var(--aurora)', fontSize: '0.65rem', letterSpacing: '0.15em' }}>ISS PASS</span>
                <span className="font-bold" style={{ fontFamily: 'var(--font-display)', color: 'white' }}>
                  {spaceEvent.iss.nextPassMinutes} min · {spaceEvent.iss.direction}
                </span>
              </div>
            )}
            {spaceEvent.weather && (
              <div className="glass-card px-4 py-2.5 flex items-center gap-3">
                <span style={{ color: 'var(--aurora)', fontSize: '0.65rem', letterSpacing: '0.15em' }}>SKY</span>
                <span className="font-bold" style={{
                  fontFamily: 'var(--font-display)',
                  color: spaceEvent.weather.goodViewing ? '#4ADE80' : '#FBB724',
                }}>
                  {spaceEvent.weather.goodViewing ? "Good Viewing" : "Poor Viewing"}
                  {" "}· {spaceEvent.weather.cloudCover}% cloud
                </span>
              </div>
            )}
          </div>
        )}

        {/* Profession Selector */}
        <div className="fade-up-3 mb-8">
          <p className="label-mono mb-4">— Select Your Profession</p>
          <ProfessionSelector selected={selectedProfession} onSelect={handleProfessionSelect} />
        </div>

        {/* Impact loading */}
        {impactLoading && (
          <div className="glass-card p-8 mb-8 text-center">
            <p className="label-mono animate-pulse" style={{ color: 'var(--aurora)' }}>
              Analyzing impact with Groq AI…
            </p>
          </div>
        )}

        {/* Impact Card — smooth entrance handled inside ImpactCard via IntersectionObserver */}
        {impact && !impactLoading && (
          <div className="mb-8">
            <ImpactCard {...impact} />
          </div>
        )}

        {/* Heatmap */}
        <div className="fade-up-4">
          <p className="label-mono mb-4">— Space Weather Risk by Profession</p>
          {heatmapLoading ? (
            <div className="glass-card p-8 text-center">
              <p className="label-mono animate-pulse" style={{ color: 'var(--aurora)' }}>
                Fetching AI scores for all professions…
              </p>
            </div>
          ) : (
            <HeatmapChart
              event={spaceEvent?.event ?? "geomagnetic storm"}
              severity={spaceEvent?.severity ?? 7}
              realScores={heatmapScores ?? undefined}
            />
          )}
        </div>

      </div>

<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
<div className="glass-card p-5">
  <p className="label-mono mb-4">
    KP INDEX TREND
  </p>

  <ResponsiveContainer width="100%" height={220}>
    <LineChart data={historyChartData}>
      <XAxis dataKey="time" />
      <YAxis
        domain={[
          (dataMin: number) => Math.floor(dataMin - 0.5),
          (dataMax: number) => Math.ceil(dataMax + 0.5),
        ]}
      />
      <Tooltip
  contentStyle={{
    background: "rgba(10,8,25,0.95)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "12px",
  }}
/>

      <Line
        type="monotone"
        dataKey="kp"
        stroke="#ff7300"
        strokeWidth={3}
      />
    </LineChart>
  </ResponsiveContainer>
</div>
<div className="glass-card p-5">
  <p className="label-mono mb-4">
    CLOUD COVER HISTORY
  </p>

  <ResponsiveContainer width="100%" height={220}>
    <LineChart data={cloudChartData}>
      <XAxis dataKey="time" />
      <YAxis domain={[0, 100]} />

      <Tooltip
  contentStyle={{
    background: "rgba(10,8,25,0.95)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "12px",
  }}
/>

      <Line
        type="monotone"
        dataKey="cloud"
        stroke="#a6ff00"
        strokeWidth={3}
      />
    </LineChart>
  </ResponsiveContainer>
</div>  
</div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">

  <div className="glass-card p-4 text-center">
    <p className="label-mono mb-2">
      SNAPSHOTS STORED
    </p>

    <p
      className="text-2xl font-bold"
      style={{
        color: "#00E5FF",
        fontFamily: "var(--font-display)",
      }}
    >
      {totalSnapshots}
    </p>
  </div>

  <div className="glass-card p-4 text-center">
    <p className="label-mono mb-2">
      HIGHEST KP
    </p>

    <p
      className="text-2xl font-bold"
      style={{
        color: "#FF5722",
        fontFamily: "var(--font-display)",
      }}
    >
      {highestKP.toFixed(1)}
    </p>
  </div>

  <div className="glass-card p-4 text-center">
    <p className="label-mono mb-2">
      AVG CLOUD COVER
    </p>

    <p
      className="text-2xl font-bold"
      style={{
        color: "#4ADE80",
        fontFamily: "var(--font-display)",
      }}
    >
      {avgCloudCover}%
    </p>
  </div>

</div>
    </main>
  );
}
