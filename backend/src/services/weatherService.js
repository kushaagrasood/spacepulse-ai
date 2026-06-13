async function fetchLocalWeather(latitude, longitude) {
  try {
    const base = 'https://api.open-meteo.com/v1/forecast';
    const url = `${base}?latitude=${encodeURIComponent(latitude)}&longitude=${encodeURIComponent(longitude)}&hourly=cloudcover,visibility&timezone=UTC`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Open-Meteo fetch failed: ${res.status}`);
    const data = await res.json();

    // find nearest hour index
    const now = new Date();
    const hours = data.hourly && data.hourly.time ? data.hourly.time : [];
    const cloud = data.hourly && data.hourly.cloudcover ? data.hourly.cloudcover : [];
    const vis = data.hourly && data.hourly.visibility ? data.hourly.visibility : [];
    if (!hours.length) return { cloudCover: null, visibility: null, goodViewing: null };

    // find closest index to current UTC hour
    const nowIso = now.toISOString().slice(0,13) + ':00:00Z';
    let idx = hours.indexOf(nowIso);
    if (idx === -1) idx = 0;

    const cloudCover = cloud[idx] != null ? Number(cloud[idx]) : null;
    const visibility = vis[idx] != null ? Number(vis[idx]) : null;

    // good viewing when clouds low and visibility high
    const goodViewing = cloudCover != null && visibility != null ? (cloudCover <= 30 && visibility >= 8000) : null;

    return { cloudCover, visibility, goodViewing };
  } catch (err) {
    return { cloudCover: null, visibility: null, goodViewing: null, error: err.message };
  }
}

module.exports = { fetchLocalWeather };
