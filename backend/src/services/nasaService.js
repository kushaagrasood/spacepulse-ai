require("dotenv").config();

const NASA_KEY = process.env.NASA_API_KEY || "DEMO_KEY";
const BASE = "https://api.nasa.gov/DONKI";

// Get date range for last 7 days
function getDateRange() {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 7);
  const fmt = (d) => d.toISOString().split("T")[0];
  return { startDate: fmt(start), endDate: fmt(end) };
}

// Fetch solar flares
async function fetchSolarFlares() {
  try {
    const { startDate, endDate } = getDateRange();
    const url = `${BASE}/FLR?startDate=${startDate}&endDate=${endDate}&api_key=${NASA_KEY}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`NASA FLR fetch failed: ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0)
      return { eventType: null, magnitude: null, startTime: null };

    const evt = data[data.length - 1]; // most recent
    return {
      eventType: "solar_flare",
      magnitude: evt.classType || evt.flrType || null,
      startTime: evt.beginTime || evt.startTime || null,
      peakTime: evt.peakTime || null,
      sourceLocation: evt.sourceLocation || null,
    };
  } catch (err) {
    return { eventType: null, magnitude: null, startTime: null, error: err.message };
  }
}

// Fetch CMEs (Coronal Mass Ejections)
async function fetchCMEs() {
  try {
    const { startDate, endDate } = getDateRange();
    const url = `${BASE}/CME?startDate=${startDate}&endDate=${endDate}&api_key=${NASA_KEY}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`NASA CME fetch failed: ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0)
      return { hasCME: false, speed: null, type: null, time: null };

    const evt = data[data.length - 1]; // most recent
    const analysis = evt.cmeAnalyses?.[0];
    return {
      hasCME: true,
      speed: analysis?.speed || null,
      type: analysis?.type || null,
      time: evt.startTime || null,
      note: evt.note || null,
    };
  } catch (err) {
    return { hasCME: false, error: err.message };
  }
}

// Fetch geomagnetic storms
async function fetchGeoStorms() {
  try {
    const { startDate, endDate } = getDateRange();
    const url = `${BASE}/GST?startDate=${startDate}&endDate=${endDate}&api_key=${NASA_KEY}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`NASA GST fetch failed: ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0)
      return { hasStorm: false, kpMax: null, startTime: null };

    const evt = data[data.length - 1];
    const kpValues = evt.allKpIndex || [];
    const kpMax = kpValues.length
      ? Math.max(...kpValues.map((k) => k.kpIndex || 0))
      : null;
    return {
      hasStorm: true,
      kpMax,
      startTime: evt.startTime || null,
    };
  } catch (err) {
    return { hasStorm: false, error: err.message };
  }
}

module.exports = { fetchSolarFlares, fetchCMEs, fetchGeoStorms };