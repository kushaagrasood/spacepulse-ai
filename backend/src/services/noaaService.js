const NOAA_URL = 'https://services.swpc.noaa.gov/json/planetary_k_index_1m.json';

async function fetchKpIndex() {
  try {
    const res = await fetch(NOAA_URL);
    if (!res.ok) throw new Error(`NOAA fetch failed: ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return { kpIndex: null, severity: null };

    const last = data[data.length - 1];
    const kp = Number(last.kp || last.kp_index || last.Kp || last.KP || last['kp_index']);
    const kpIndex = Number.isFinite(kp) ? kp : null;
    const severity = kpIndex == null ? null : Math.max(1, Math.min(10, Math.round((kpIndex / 9) * 10)));

    return { kpIndex, severity };
  } catch (err) {
    return { kpIndex: null, severity: null, error: err.message };
  }
}

module.exports = { fetchKpIndex };
