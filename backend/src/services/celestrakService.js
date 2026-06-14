async function getISSData(lat, lon) {
  try {
    // Get current ISS position
    const res = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
    if (!res.ok) throw new Error(`ISS fetch failed: ${res.status}`);
    const iss = await res.json();

    const issLat = iss.latitude;
    const issLon = iss.longitude;

    // Calculate direction from observer to ISS
    const dLon = issLon - lon;
    const dLat = issLat - lat;
    const angle = Math.atan2(dLon, dLat) * (180 / Math.PI);
    const normalized = (angle + 360) % 360;

    function azToCardinal(a) {
      const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
      return dirs[Math.round(normalized / 45) % 8];
    }

    // Rough distance in km
    const R = 6371;
    const dLatRad = (dLat * Math.PI) / 180;
    const dLonRad = (dLon * Math.PI) / 180;
    const a =
      Math.sin(dLatRad / 2) ** 2 +
      Math.cos((lat * Math.PI) / 180) *
        Math.cos((issLat * Math.PI) / 180) *
        Math.sin(dLonRad / 2) ** 2;
    const groundDistance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    // ISS altitude is ~420km, use that to estimate pass time
    // ISS travels at ~7.66 km/s = ~27576 km/h
    const ISS_SPEED_KMH = 27600;
    const nextPassMinutes = Math.round((groundDistance / ISS_SPEED_KMH) * 60);

    return {
      latitude: issLat,
      longitude: issLon,
      altitude: iss.altitude,
      velocity: iss.velocity,
      visibility: iss.visibility,
      nextPassMinutes: Math.min(nextPassMinutes, 360), // cap at 6 hours
      direction: azToCardinal(normalized),
    };
  } catch (err) {
    return {
      latitude: null,
      longitude: null,
      nextPassMinutes: null,
      direction: null,
      error: err.message,
    };
  }
}

module.exports = { getISSData };