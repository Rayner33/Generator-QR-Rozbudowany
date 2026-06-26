const express = require('express');
const cors = require('cors');
const geoip = require('geoip-lite');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Umożliwiamy odczytywanie prawdziwego IP za proxy
app.set('trust proxy', true);

app.get('/api/geo', (req, res) => {
  // Pobieramy IP (obsługa Cloudflare, proxy i Nginx)
  let ip = req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip;
  
  // Oczyszczanie, np. gdy x-forwarded-for ma więcej adresów
  if (ip && ip.includes(',')) {
    ip = ip.split(',')[0].trim();
  }
  
  // W przypadku IPv4 mapowanego do IPv6 np. "::ffff:192.168.1.1"
  if (ip && ip.startsWith('::ffff:')) {
    ip = ip.substring(7);
  }

  // W przypadku testowania lokalnie, baza MaxMind nie ma wpisu dla localhosta
  if (ip === '127.0.0.1' || ip === '::1' || !ip) {
    // Zwracamy mockowe dane ułatwiające testowanie w środowisku developerskim
    return res.json({
      ip: ip || '127.0.0.1',
      country: 'PL',
      region: 'Mazowieckie',
      city: 'Warszawa',
      continent: 'EU',
      ll: [52.2297, 21.0122],
      timezone: 'Europe/Warsaw',
      isLocalhost: true
    });
  }

  const geo = geoip.lookup(ip);

  if (geo) {
    res.json({
      ip: ip,
      country: geo.country,    // np. "PL"
      region: geo.region,      // np. "MZ"
      city: geo.city,          // np. "Warsaw"
      continent: geo.eu === '1' ? 'EU' : (geo.timezone ? geo.timezone.split('/')[0] : 'Unknown'), // uproszczona detekcja
      ll: geo.ll,
      timezone: geo.timezone,
      isLocalhost: false
    });
  } else {
    // Gdyby baza nie znała adresu IP (np. lokalne IP, nowe IP) zwracamy 200 z "Unknown" aby uniknąć czerwonych błędów w konsoli
    res.status(200).json({ 
      ip: ip,
      country: 'Unknown',
      region: 'Unknown',
      city: 'Unknown',
      continent: 'Unknown',
      error: 'Lokalizacja nieznana'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Pamiętaj: do odpalenia na serwerze z własnym plikiem .mmdb w przyszłości użyj @maxmind/geoip2-node.`);
});
