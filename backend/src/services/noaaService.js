const NOAA_URL = 'https://services.swpc.noaa.gov/json/planetary_k_index_1m.json';

async function fetchKpIndex() {
  try {
    const res = await fetch(NOAA_URL);
    if (!res.ok) throw new Error(`NOAA fetch failed: ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0)
      return { kpIndex: null, severity: null };

    // Get most recent entry with valid data
    const last = data[data.length - 1];
    const kpIndex = last.estimated_kp ?? last.kp_index ?? null;

    if (kpIndex === null) return { kpIndex: null, severity: null };

    // severity 1-10 scale
    const severity = Math.max(1, Math.min(10, Math.round((kpIndex / 9) * 10)));

    // human readable status
    let status = 'quiet';
    if (kpIndex >= 7) status = 'severe storm';
    else if (kpIndex >= 5) status = 'moderate storm';
    else if (kpIndex >= 4) status = 'active';
    else if (kpIndex >= 2) status = 'unsettled';

    return { kpIndex, severity, status, timeTag: last.time_tag };
  } catch (err) {
    return { kpIndex: null, severity: null, error: err.message };
  }
}

module.exports = { fetchKpIndex };