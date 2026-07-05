const express = require('express');
const cors = require('cors');
const { Reader } = require('@maxmind/geoip2-node');

const app = express();
const PORT = process.env.PORT || 3000;
const API_SECRET_KEY = 'ParysGeoSecret_2026!xyz'; 

// Konfiguracja CORS (zezwala tylko określonym domenom na dostęp z poziomu przeglądarki)
const allowedOrigins = ['https://qr.parys.pl', 'http://localhost:5173', 'http://localhost:3000'];
app.use(cors({
    origin: function (origin, callback) {
        // Zezwól jeśli domena jest na liście, lub jeśli to zapytanie bezpośrednie (brak origin, np. curl/postman)
        // if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        if (allowedOrigins.indexOf(origin) !== -1) {    
            callback(null, true);
        } else {
            callback(new Error('Niedozwolone przez CORS'));
        }
    }
}));

// Globalny łapacz błędów (ukrywa techniczne ścieżki serwera przed użytkownikiem m.in. dla błędów CORS)
app.use((err, req, res, next) => {
    if (err.message === 'Niedozwolone przez CORS') {
        return res.status(403).json({ error: 'Brak dostępu. Domena nieautoryzowana (CORS).' });
    }
    // Dla innych błędów wyrzucamy generyczny komunikat
    res.status(500).json({ error: 'Wewnętrzny błąd serwera.' });
});

app.use(express.json());

// Ufamy proxy (Nginx, Cloudflare), co jest kluczowe do poprawnego odczytywania IP
app.set('trust proxy', true);

// Zmienna przechowująca naszą bazę danych MaxMind
let geoReader;

// Inicjalizacja bazy MaxMind przy starcie serwera
// Pamiętaj: Plik GeoLite2-City.mmdb musi znajdować się w podfolderze "geoip"
Reader.open('./geoip/GeoLite2-City.mmdb')
    .then(reader => {
        geoReader = reader;
        console.log('✅ Baza danych GeoIP (MaxMind) załadowana pomyślnie!');
    })
    .catch(err => {
        console.error('❌ Błąd ładowania bazy GeoIP:', err.message);
        console.error('Upewnij się, że plik GeoLite2-City.mmdb istnieje w ścieżce ./geoip/GeoLite2-City.mmdb');
    });

/**
 * Funkcja wyciągająca dane z bazy MaxMind.
 * Zawiera tzw. "Graceful fallback", czyli w razie błędu zwraca "Unknown".
 */
function getGeoData(ip) {
    if (!geoReader) {
        throw new Error('Baza GeoIP nie jest jeszcze gotowa');
    }

    try {
        const result = geoReader.city(ip);
        return {
            ip,
            country: result.country?.names?.en || 'Unknown',
            region: result.subdivisions?.[0]?.names?.en || 'Unknown',
            city: result.city?.names?.en || 'Unknown', // Dodane pole city!
            continent: result.continent?.names?.en || 'Unknown',
        };
    } catch (e) {
        // Zwracamy spójny obiekt (zamiast rzucać pustym błędem), 
        // aby frontend (React) nigdy nie miał błędów na czerwono.
        return {
            ip,
            country: 'Unknown',
            region: 'Unknown',
            city: 'Unknown',
            continent: 'Unknown',
            error: 'IP not found in database'
        };
    }
}

/**
 * Endpoint główny: Automatycznie wykrywa IP odwiedzającego (np. z aplikacji React).
 * Z tej ścieżki będzie korzystać nasz Generator QR (VITE_GEO_API_URL=https://geo.parys.pl/api-geo)
 */
app.get('/api/geo', (req, res) => {
    // Rozpoznawanie IP: Cloudflare -> Nginx/Real-IP -> X-Forwarded -> Natywne połączenie
    let ip = req.headers['cf-connecting-ip'] 
          || req.headers['x-real-ip'] 
          || req.headers['x-forwarded-for'] 
          || req.socket.remoteAddress 
          || req.ip;

    // Jeżeli X-Forwarded-For zwróci ciąg IP (np. proxy1, proxy2), bierzemy pierwszy
    if (ip && ip.includes(',')) {
        ip = ip.split(',')[0].trim();
    }
    
    // Konwersja IPv4 zmapowanego do IPv6 do normalnego IPv4
    if (ip && ip.startsWith('::ffff:')) {
        ip = ip.substring(7);
    }

    // Jeśli zapytanie przychodzi z localhosta (brak przypisanego państwa)
    if (ip === '127.0.0.1' || ip === '::1' || !ip) {
        return res.json({
            ip: ip || '127.0.0.1',
            country: 'PL',
            region: 'Mazowieckie',
            city: 'Warszawa',
            continent: 'Europe',
            isLocalhost: true
        });
    }

    try {
        const data = getGeoData(ip);
        res.status(200).json(data);
    } catch (e) {
        res.status(503).json({ error: 'Usługa tymczasowo niedostępna', details: e.message });
    }
});

/**
 * Endpoint pomocniczy: Pozwala ręcznie sprawdzić dowolne IP (np. /api/geo/8.8.8.8)
 */
app.get('/api/geo/:ip', (req, res) => {
    try {
        const data = getGeoData(req.params.ip);
        res.status(200).json(data);
    } catch (e) {
        res.status(503).json({ error: 'Usługa tymczasowo niedostępna', details: e.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Serwer GeoLite2 Production Microservice uruchomiony na porcie ${PORT}`);
});
