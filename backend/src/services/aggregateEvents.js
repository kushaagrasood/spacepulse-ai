const { fetchKpIndex } = require('./noaaService');
const { fetchSolarFlares } = require('./nasaService');
const { getISSData } = require('./celestrakService');
const { fetchLocalWeather } = require('./weatherService');

async function aggregateEvents({ latitude, longitude } = {}) {
  // fetch everything in parallel
  const [kp, flr, iss, weather] = await Promise.all([
    fetchKpIndex(),
    fetchSolarFlares(),
    getISSData(latitude || 0, longitude || 0),
    fetchLocalWeather(latitude || 0, longitude || 0)
  ]);

  // determine main event string
  let event = 'nominal';
  if (kp && kp.kpIndex >= 7) event = 'geomagnetic storm';
  else if (flr && flr.magnitude && String(flr.magnitude).startsWith('X')) event = 'solar flare';

  // severity: combine Kp-based and flare-based signals
  const kpSeverity = kp && kp.severity ? kp.severity : 0;
  let flareSeverity = 0;
  if (flr && flr.magnitude) {
    const m = String(flr.magnitude).toUpperCase();
    if (m.startsWith('X')) flareSeverity = 9;
    else if (m.startsWith('M')) flareSeverity = 6;
    else if (m.startsWith('C')) flareSeverity = 3;
  }
  const severity = Math.max(kpSeverity, flareSeverity) || 1;

  const out = {
    event,
    severity,
    kpIndex: kp && kp.kpIndex != null ? kp.kpIndex : null,
    solarFlare: flr && flr.magnitude ? flr.magnitude : null,
    iss: iss ? { nextPassMinutes: iss.nextPassMinutes, direction: iss.direction } : null,
    weather: weather ? { cloudCover: weather.cloudCover, goodViewing: weather.goodViewing } : null
  };

  return out;
}

module.exports = { aggregateEvents };
