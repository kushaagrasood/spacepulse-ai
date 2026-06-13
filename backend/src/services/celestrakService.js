// Uses satellite.js if available. Falls back to limited info if not.
async function getISSData(lat, lon) {
  try {
    const tleRes = await fetch('https://celestrak.org/NORAD/elements/stations.txt');
    if (!tleRes.ok) throw new Error(`TLE fetch failed: ${tleRes.status}`);
    const txt = await tleRes.text();
    const lines = txt.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

    // find ISS block (name line then two TLE lines)
    let lineIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (/ISS|ZARYA/i.test(lines[i])) { lineIndex = i; break; }
    }
    if (lineIndex === -1) return { latitude: null, longitude: null, nextPassMinutes: null, direction: null };

    const name = lines[lineIndex];
    const tle1 = lines[lineIndex + 1];
    const tle2 = lines[lineIndex + 2];

    let satellite;
    try {
      satellite = require('satellite.js');
    } catch (e) {
      // satellite.js not installed
      return { name, tle1, tle2, latitude: null, longitude: null, nextPassMinutes: null, direction: null, warning: 'satellite.js not installed' };
    }

    const satrec = satellite.twoline2satrec(tle1, tle2);
    const now = new Date();
    const positionAndVelocity = satellite.propagate(satrec, now);
    const positionEci = positionAndVelocity.position;
    if (!positionEci) return { latitude: null, longitude: null, nextPassMinutes: null, direction: null };

    const gmst = satellite.gstime(now);
    const geo = satellite.eciToGeodetic(positionEci, gmst);
    const longitudeDeg = satellite.degreesLong(geo.longitude);
    const latitudeDeg = satellite.degreesLat(geo.latitude);

    // compute azimuth from ground observer
    const observerGd = {
      longitude: satellite.degreesToRadians(lon),
      latitude: satellite.degreesToRadians(lat),
      height: 0
    };
    const lookAngles = satellite.ecfToLookAngles(observerGd, satellite.eciToEcf(positionEci, gmst));
    const azimuthDeg = (lookAngles && lookAngles.azimuth) ? (lookAngles.azimuth * 180/Math.PI) : null;

    // direction as cardinal
    function azToCardinal(a){ if (a==null) return null; const dirs=['N','NE','E','SE','S','SW','W','NW']; return dirs[Math.floor(((a+22.5)%360)/45)]; }
    const direction = azToCardinal(azimuthDeg);

    // rough next pass: sample every 30s up to 6 hours for elevation > 0
    const stepSeconds = 30;
    const maxSec = 6 * 3600;
    let nextPassMinutes = null;
    for (let t = stepSeconds; t <= maxSec; t += stepSeconds) {
      const future = new Date(now.getTime() + t*1000);
      const pv = satellite.propagate(satrec, future);
      if (!pv.position) continue;
      const gmstF = satellite.gstime(future);
      const ecf = satellite.eciToEcf(pv.position, gmstF);
      const look = satellite.ecfToLookAngles(observerGd, ecf);
      const elevation = look && look.elevation ? (look.elevation * 180/Math.PI) : null;
      if (elevation != null && elevation > 0) { nextPassMinutes = Math.round(t/60); break; }
    }

    return { name, latitude: latitudeDeg, longitude: longitudeDeg, nextPassMinutes, direction };
  } catch (err) {
    return { latitude: null, longitude: null, nextPassMinutes: null, direction: null, error: err.message };
  }
}

module.exports = { getISSData };
