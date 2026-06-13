const NASA_FLR_URL = 'https://api.nasa.gov/DONKI/FLR?api_key=DEMO_KEY';

async function fetchSolarFlares() {
  try {
    const res = await fetch(NASA_FLR_URL);
    if (!res.ok) throw new Error(`NASA fetch failed: ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return { eventType: null, magnitude: null, startTime: null };

    // pick the most recent event
    const evt = data[0];
    const eventType = 'solar_flare';
    const magnitude = evt.classType || evt.flrType || evt.class || null;
    const startTime = evt.beginTime || evt.startTime || evt.time_tag || null;

    return { eventType, magnitude, startTime };
  } catch (err) {
    return { eventType: null, magnitude: null, startTime: null, error: err.message };
  }
}

module.exports = { fetchSolarFlares };
