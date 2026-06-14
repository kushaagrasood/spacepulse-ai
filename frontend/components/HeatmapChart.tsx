"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface HeatmapChartProps {
  event: string;
  severity: number;
  realScores?: { profession: string; score: number }[];
}

const clamp = (value: number) =>
  Math.max(1, Math.min(10, value));

const professionScores = (severity: number) => [
  { profession: "Pilot", score: clamp(severity + 2) },
  { profession: "Airline Ops", score: clamp(severity + 2) },
  { profession: "Satellite Op", score: clamp(severity + 2) },
  { profession: "Photographer", score: clamp(severity + 1) },
  { profession: "Researcher", score: clamp(severity) },
  { profession: "Astronomer", score: clamp(severity - 1) },
  { profession: "Student", score: clamp(severity - 2) },
  { profession: "Farmer", score: clamp(severity - 4) },
  { profession: "Maritime", score: clamp(severity - 1) },
];

const barColor = (score: number) => {
  if (score >= 7) return "#FF5722"; // --solar
  if (score >= 4) return "#FBB724"; // amber
  return "#4ADE80";                 // green
};

// Custom tooltip to match glass-card aesthetic
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(10,8,25,0.92)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '0.75rem',
      padding: '0.6rem 1rem',
      backdropFilter: 'blur(12px)',
    }}>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem', letterSpacing: '0.12em', marginBottom: '0.25rem' }}>
        {label?.toUpperCase()}
      </p>
      <p style={{ color: barColor(payload[0].value), fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem' }}>
        {payload[0].value}
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', fontWeight: 400 }}>/10</span>
      </p>
    </div>
  );
};

export default function HeatmapChart({
  event,
  severity,
  realScores,
}: HeatmapChartProps) {

  const data =
    realScores && realScores.length > 0
      ? realScores
      : professionScores(severity);

  return (
    <div className="glass-card p-6">
      <p className="label-mono mb-1">Event</p>
      <p className="text-base font-semibold mb-6" style={{ color: 'rgba(232,234,246,0.9)' }}>
        {event}
      </p>

      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} layout="vertical" barCategoryGap="28%">
          <XAxis
            type="number"
            domain={[0, 10]}
            tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 11, fontFamily: 'var(--font-display)' }}
            axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="profession"
            width={140}
            tick={{ fill: 'rgba(232,234,246,0.65)', fontSize: 12, fontFamily: 'var(--font-body)' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar dataKey="score" radius={[0, 5, 5, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={barColor(entry.score)}
                fillOpacity={0.85}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
