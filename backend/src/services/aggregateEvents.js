const { fetchKpIndex } = require('./noaaService');
const { fetchSolarFlares, fetchCMEs, fetchGeoStorms } = require('./nasaService');
const { getISSData } = require('./celestrakService');
const { fetchLocalWeather } = require('./weatherService');

async function aggregateEvents({ latitude, longitude } = {}) {
  // fetch everything in parallel
  const [kp, flr, cme, gst, iss, weather] = await Promise.all([
    fetchKpIndex(),
    fetchSolarFlares(),
    fetchCMEs(),
    fetchGeoStorms(),
    getISSData(latitude || 0, longitude || 0),
    fetchLocalWeather(latitude || 0, longitude || 0)
  ]);

  // determine main event string
  let event = 'nominal';
  if ((kp && kp.kpIndex >= 7) || (gst && gst.hasStorm && gst.kpMax >= 7)) {
    event = 'geomagnetic storm';
  } else if (cme && cme.hasCME) {
    event = 'coronal mass ejection';
  } else if (flr && flr.magnitude && String(flr.magnitude).startsWith('X')) {
    event = 'solar flare';
  } else if (flr && flr.magnitude && String(flr.magnitude).startsWith('M')) {
    event = 'solar flare';
  }

  // severity: combine all signals
  const kpSeverity = kp && kp.severity ? kp.severity : 0;
  const gstSeverity = gst && gst.kpMax ? Math.round((gst.kpMax / 9) * 10) : 0;

  let flareSeverity = 0;
  if (flr && flr.magnitude) {
    const m = String(flr.magnitude).toUpperCase();
    if (m.startsWith('X')) flareSeverity = 9;
    else if (m.startsWith('M')) flareSeverity = 6;
    else if (m.startsWith('C')) flareSeverity = 3;
  }

  let cmeSeverity = 0;
  if (cme && cme.hasCME && cme.speed) {
    if (cme.speed > 1000) cmeSeverity = 8;
    else if (cme.speed > 500) cmeSeverity = 5;
    else cmeSeverity = 3;
  }

  const severity = Math.max(kpSeverity, gstSeverity, flareSeverity, cmeSeverity) || 1;

  return {
    event,
    severity,
    kpIndex: kp && kp.kpIndex != null ? kp.kpIndex : null,
    solarFlare: flr && flr.magnitude ? flr.magnitude : null,
    solarFlareTime: flr && flr.startTime ? flr.startTime : null,
    cme: cme && cme.hasCME ? {
      speed: cme.speed,
      type: cme.type,
      time: cme.time,
    } : null,
    geoStorm: gst && gst.hasStorm ? {
      kpMax: gst.kpMax,
      startTime: gst.startTime,
    } : null,
    iss: iss ? {
      nextPassMinutes: iss.nextPassMinutes,
      direction: iss.direction,
    } : null,
    weather: weather ? {
      cloudCover: weather.cloudCover,
      goodViewing: weather.goodViewing,
    } : null,
  };
}

module.exports = { aggregateEvents };