import { UAParser } from 'ua-parser-js';

export async function generateVisitorHash(ip, userAgent) {
  // Sól oparta na dzisiejszej dacie - hash zmienia się każdego dnia (Cookieless)
  const dateSalt = new Date().toISOString().split('T')[0]; 
  const rawString = `${ip}-${userAgent}-${dateSalt}`;

  const encoder = new TextEncoder();
  const data = encoder.encode(rawString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function getAnalyticsData() {
  let geo = {
    ip: 'Unknown',
    country: 'Unknown',
    region: 'Unknown',
    city: 'Unknown',
    continent: 'Unknown'
  };

  try {
    const geoResponse = await fetch('http://localhost:3001/api/geo');
    if (geoResponse.ok) {
      const data = await geoResponse.json();
      geo = {
        ip: data.ip || 'Unknown',
        country: data.country || 'Unknown',
        region: data.region || 'Unknown',
        city: data.city || 'Unknown',
        continent: data.continent || 'Unknown'
      };
    }
  } catch (err) {
    console.warn("Nie udało się pobrać geolokalizacji z lokalnego serwera API.", err);
  }

  const parser = new UAParser();
  const result = parser.getResult();

  const userAgent = navigator.userAgent;
  const visitorHash = await generateVisitorHash(geo.ip, userAgent);

  return {
    visitorHash,
    country: geo.country,
    region: geo.region,
    city: geo.city,
    continent: geo.continent,
    os: result.os.name || 'Unknown',
    browser: result.browser.name || 'Unknown',
    device: result.device.type || 'Desktop', // Jeśli brak typu, zazwyczaj jest to Desktop
    timestamp: new Date()
  };
}
