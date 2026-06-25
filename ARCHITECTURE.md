# Architektura Systemu: Generator QR Rozbudowany

## Zarys Technologiczny
Projekt oparty jest na nowoczesnym i szybkim stosie technologicznym przeznaczonym do tworzenia dynamicznych aplikacji jednostronicowych (SPA).

- **Frontend:** React.js (generowany przez Vite)
- **Styling:** Tailwind CSS (z niestandardową konfiguracją w `tailwind.config.js`)
- **Backend / Baza Danych:** Firebase (Authentication, Firestore Database)
- **Zabezpieczenia Antybotowe:** Firebase App Check zintegrowany z `reCAPTCHA v3 Standard` (zapobieganie spamowaniu bazy i fałszowaniu statystyk)
- **Generowanie QR:** Biblioteka `qr-code-styling` (pozwala na dynamiczne zmiany narożników, kolorów i osadzanie logotypów po stronie klienta bez komunikacji z serwerem)
- **Wybór Kolorów:** `react-colorful` (nowoczesny i lekki komponent Color Picker)
- **Ikony:** `lucide-react`
- **Wykresy / Analityka:** `chart.js` oraz `react-chartjs-2`
- **Serwer WWW:** Nginx (z wdrożonym plikiem `nginx.conf` obsługującym przepisywanie ścieżek SPA, tzw. fallback na `index.html`)

## Struktura Bazy Danych (Firestore)

Projekt korzysta z nierelacyjnej bazy danych NoSQL (Firestore). Główne kolekcje:

### 1. `workspaces` (Przestrzenie Robocze)
Zarządza zespołami oraz przestrzenią personalną użytkowników.
- `id` (String): ID dokumentu
- `name` (String): Nazwa przestrzeni (np. "Personal", "Marketing Team")
- `ownerId` (String): UID założyciela/właściciela
- `members` (Array of Strings): Lista UID przypisanych współpracowników (użytkowników zespołu)
- `type` (String): `personal` lub `team`
- `allowMembersEdit` (Boolean): Uprawnienia członków do edycji (Team)
- `allowMembersArchive` (Boolean): Uprawnienia członków do archiwizacji (Team)
- `allowMembersReset` (Boolean): Uprawnienia członków do resetowania statystyk (Team)
- `memberRoles` (Map): Zestawienie ról dla użytkowników w formacie `{ [uid]: "admin" }` (rola Menedżera, brak wpisu oznacza zwykłego Członka. Właściciel jest zdefiniowany przez `ownerId`)
- `archived` (Boolean): Flaga bezpiecznej archiwizacji ("Soft Delete"), ukrywająca zespół i deaktywująca jego kody.
- `createdAt` (Timestamp): Data utworzenia

### 2. `qrcodes` (Kody QR)
Przechowuje wszystkie zapisane kampanie QR powiązane z danym obszarem roboczym.
- `id` (String): ID dokumentu
- `workspaceId` (String): ID powiązanej przestrzeni z kolekcji `workspaces`
- `title` (String): Nazwa kampanii
- `contentType` (String): Typ zawartości (`url`, `phone`, `email`, `wifi`, `vcard`)
- `url` (String): Ostatecznie wygenerowany ciąg danych osadzony w kodzie QR (np. `BEGIN:VCARD...` lub `https://...`)
- Pobrane dane do edycji (`urlData`, `phoneData`, `emailData`, `wifiData`, `vcardData`)
- Opcje stylu (`styleType`, `dotsColor`, `eyeColor`, `backgroundColor`)
- `tags` (Array of Strings): Lista identyfikatorów z kolekcji `tags` przypisanych do tego kodu
- `scans` (Number): Liczba zeskanowań
- `archived` (Boolean): Flaga ukrywająca kod w widoku głównym
- `createdAt` (Timestamp): Data utworzenia

### 3. `smartlinks` (Inteligentne Linki)
Moduł alternatywny dla pełnych kampanii QR, skupiony włącznie na przekierowaniach URL z zaawansowaną analityką, wzbogacony o pobieranie Favicony strony docelowej.
- `id` (String): ID dokumentu (tożsamy z aliasem / short kodem np. "Zyx23")
- `workspaceId` (String): ID powiązanej przestrzeni
- `title` (String): Tytuł/nazwa linku
- `url` (String): URL docelowy
- `tags` (Array of Strings): Lista identyfikatorów z kolekcji `tags`
- `clicks` (Number): Liczba kliknięć
- `archived` (Boolean): Flaga ukrywająca link w widoku głównym
- `createdAt` (Timestamp): Data utworzenia

### 4. `tags` (Tagi kodów QR)
Globalne i uniwersalne etykiety dostępne w obrębie danej przestrzeni roboczej, służące do kategoryzacji kodów QR oraz Smart Linków.
- `id` (String): ID dokumentu
- `workspaceId` (String): ID przestrzeni, do której tag należy
- `name` (String): Nazwa tagu, unikalna w obrębie przestrzeni roboczej
- `color` (String): ID predefiniowanego koloru (np. `mint`, `orange`, `blue`) odpowiadający palecie zdefiniowanej w aplikacji
- `createdAt` (Timestamp): Data utworzenia

### 5. `users` (Globalny Rejestr Użytkowników)
Kolekcja tworzona przy rejestracji, służąca wyszukiwaniu członków na poczet zespołów.
- `id` (String): UID logowania
- `email` (String): E-mail użytkownika
- `name` (String): Wyświetlana nazwa (lub nazwa zastępcza)
- `avatarStyle` (String): Prywatny gradient wybrany w profilu (np. dla awatara)

### 6. `invites` (Zaproszenia do Zespołów)
Kolekcja nasłuchiwana u klientów w celu wypychania powiadomień.
- `id` (String): ID dokumentu
- `email` (String): Adres osoby zapraszanej
- `workspaceId` (String): ID docelowej przestrzeni
- `workspaceName` (String): Skopiowana nazwa przestrzeni dla czytelności powiadomień
- `status` (String): `pending`, `accepted` lub `rejected`
- `createdAt` (Timestamp): Data nadania zaproszenia

## Struktura Projektu i Nawigacja

```
├── app/
│   ├── src/
│   │   ├── components/         # Główne komponenty interfejsu (Sidebar, QRModal, itd.)
│   │   ├── pages/              # Główne widoki aplikacji (Account, Analytics, QRList, Login)
│   │   ├── hooks/              # Wyekstrahowana logika odpytywania bazy i stanu (useWorkspaces.js)
│   │   ├── utils/              # Funkcje pomocnicze, globalne warianty animacji (animations.js), współdzielone moduły
│   │   ├── context/            # Konteksty globalne np. Autoryzacja
│   │   ├── firebase.js         # Inicjalizacja i eksport instancji Firebase
│   │   ├── App.jsx             # Główny router aplikacji i system zarządzania stanem
│   │   └── main.jsx            # Punkt wejścia aplikacji z wpiętym react-router-dom
```

Aplikacja wykorzystuje `react-router-dom` (`<BrowserRouter>`, `<Routes>`) do obsługi nawigacji. Przejścia między widokami realizowane są za pomocą hooka `useNavigate`, co pozwala na pełną obsługę historii przeglądarki oraz czytelne ścieżki URL.

## Główne Komponenty Aplikacji (`app/src/components`)

1. **`App.jsx`**: Serce aplikacji. Konfiguruje router aplikacji oraz system autoryzacji użytkownika.
2. **`Login.jsx` + `AuthContext.jsx`**: Dwuwarstwowy moduł autoryzacji Enterprise. `Login.jsx` obsługuje UI logowania przez Google SSO z whitelistą domen. `AuthContext.jsx` stanowi drugi, niezbywalny punkt kontroli — po każdej zmianie stanu autoryzacji (login, odświeżenie tokenu) weryfikuje domenę emaila i natychmiastowo wylogowuje każdego spoza `@parys.pl`, niezależnie od tego jak uwierzytelnienie nastąpiło (UI czy bezpośrednie SDK).
3. **`QRList.jsx` & `SmartLinksList.jsx`**: Moduły wyświetlające zapisane obiekty z bazy. Obejmują potężne wyszukiwanie, filtrowanie ("Ostatnio utworzone", "Zarchiwizowane") oraz pobieranie miniaturek favikon z zewnątrz. Wykorzystują innowacyjny interfejs do zaznaczania tagów oparty na wskaźnikach przypominających przyciski "radio" dla większej czytelności.
4. **`QRModal.jsx` & `SmartLinkModal.jsx`**: Ogromne moduły odpowiedzialne za kreatory danych. **Sprawdzają w czasie rzeczywistym dostępność i duplikację nowo tworzonych aliasów (Short Linków) bezpośrednio w Firestore**. Wszystkie zamykane w sposób nowoczesny przez zrzucanie do tła (backdrop click).
5. **System Modali Tagów** (`TagManagerModal`, `TagEditModal`, `TagDeleteModal`): Wyspecjalizowane, bardzo nowoczesne komponenty oparte na schematach Glassmorphism do zarządzania (CRUD) tagami. Co najważniejsze, działają natywnie z głównym stanem bazy danych, dzięki czemu operacje na nich są w 100% reaktywne na żywo z brakiem "martwych stanów".
6. **`Analytics.jsx`**: Ekran dedykowany globalnym statystykom i szczegółowym danym odnośnie użycia poszczególnych kodów z przestrzeni roboczej.
7. **`RedirectEngine.jsx`**: Niewidzialny, inteligentny komponent działający poza głównym UI aplikacji. Odpowiada za przechwytywanie publicznego ruchu krótkich linków (`/:shortId`). Zlicza "na żywo" unikalne wizyty w tle i odsyła do fizycznych adresów końcowych.
8. **Moduły Pracy Zespołowej i Uprawnień** (`WorkspaceSettings.jsx`, `NotificationsModal.jsx`, `InviteMemberModal.jsx`): Nowoczesny system zarządzania danymi na żywo oparty o odpytywanie kolekcji po adresach E-mail. Właściciele mogą zapraszać członków, definiować ich precyzyjne uprawnienia, mianować na Menedżerów, a także całkowicie i trwale przekazywać im własność zespołu. Potencjalni odbiorcy zgarniają dynamiczne powiadomienia na pasku Sidebar z bezpośrednim przełączeniem do projektu po akceptacji.
9. **Transfer Zasobów (`MoveCodeModal.jsx`)**: System bezstratnego przenoszenia kodów QR i Smart Linków pomiędzy przestrzeniami roboczymi (z osobistej do zespołu lub pomiędzy zespołami). Automatycznie separuje i czyści lokalne tagi starej przestrzeni, zapobiegając usterkom kategoryzacji. Zabezpieczony rygorystycznymi uprawnieniami edycji.

## Model Bezpieczeństwa (Trójwarstwowy)

Aplikacja stosuje trzy niezależne warstwy ochrony, z których każda działa autonomicznie:

| Warstwa | Mechanizm | Co blokuje |
|---------|-----------|------------|
| **1. Klucz API** | Restrykcja HTTP Referrer w Google Cloud Console | Użycie klucza z obcych domen, curl, Postmana |
| **2. AuthContext** | Weryfikacja `@parys.pl` w `onAuthStateChanged` | Każde konto spoza domeny firmowej, niezależnie od ścieżki logowania |
| **3. Firestore Rules** | `isAppAdmin()` sprawdza domenę w tokenie JWT | Bezpośrednie zapytania do bazy z pominięciem aplikacji |

Dodatkowo reguła `analytics/create` weryfikuje istnienie `codeId` w bazie przed zapisem logu — chroniąc przed zalewaniem analityki fałszywymi danymi przez boty.

### Zmienne środowiskowe
Wszystkie dane uwierzytelniające Firebase przechowywane są w pliku `app/.env.local` (wykluczonym z git przez `.gitignore`). W środowisku produkcyjnym należy ustawić te same zmienne w panelu hostingowym:
```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_FIREBASE_MEASUREMENT_ID
VITE_GEO_API_URL       # URL serwera GeoLite2
```

## Główne wzorce w projekcie (Design Patterns)
- **Dynamic QR Routing:** Aplikacja rozróżnia surowe dane docelowe (zapisywane w bazie Firestore) od danych kodowanych graficznie (krótki link URL powiązany z ID dokumentu). Dzięki temu raz wygenerowany wzór wektorowy kropek pozostaje niezmienny, bez względu na modyfikacje treści przez użytkownika (z wyjątkiem sieci WiFi dla wymuszenia kompatybilności natywnej).
- **Real-time Updates:** Kody QR z bazy Firestore są nasłuchiwane w czasie rzeczywistym z użyciem `onSnapshot()`. Edycja kodu z innego urządzenia automatycznie odświeży go na liście.
- **Modals & Overlays:** Wiele procesów (np. tworzenie, edycja, tworzenie zespołu, ostrzeżenia o archiwizacji) wykonuje się jako modal, nakładając zaciemnione tło na główny interfejs.
- **Client-Side Rendering (CSR):** Silnik `qr-code-styling` na bieżąco przemalowuje kody jako wektory SVG na podstawie React State'ów bez opóźnień sieciowych, ulepszając User Experience.

- **Base64 Logo Encoding:** Obrazki wgrywane przez użytkowników w ramach dodawania logo do kodów QR są natychmiastowo konwertowane na ciągi znaków Base64 przez FileReader API. Pozwala to na ich zapisywanie bezstratnie w bazie Firestore bez konieczności utrzymywania i opłacania serwerów statycznych lub magazynów (np. Firebase Storage).
- **Live Form Validation & DB Checks:** System weryfikacji formularzy wykorzystuje nie tylko RegEx, ale również ułamkowe zapytania (np. `getDoc`) do bazy danych, po to by w ułamku sekundy wychwycić konflikt np. duplikację zdefiniowanego odnośnika "Short link".
- **Safe Initialization Strategy:** W celu uniknięcia "wyścigów danych" (race conditions) przy tworzeniu profilowych przestrzeni roboczych, inicjalizacja zrezygnowała z polegania na asynchronicznych nasłuchiwaczach na rzecz twardego zapytania autoryzującego `getDocs` – wymuszając tym samym odpowiedź bezpośrednio z serwera zanim jakikolwiek zapis zostanie dokonany.
- **Data Export & BOM:** Aplikacja renderuje własne pliki CSV na bazie wyfiltrowanych zapytań (Analytics). By zapobiec utracie polskich znaków przy otwieraniu plików przez silniki Microsoft Excel, każdy plik generowany w locie poprzedzony jest niewidzialnym bajtem `BOM (\uFEFF)`.
- **CSS Hardware Filters:** Skomplikowane efekty graficzne (np. hover na interaktywnych wykresach list) realizowane są przy użyciu wspieranych sprzętowo filtrów w CSS (m.in. `brightness`, `drop-shadow`, `grayscale`) nakładanych na pojedynczą instancję widoku (zamiast renderowania drugiego elementu Canvas), co zabezpiecza aplikację przed szarpaniem animacji.

---
*(Dokument utworzony i aktualizowany przez AI Assistant na podstawie wytycznych deweloperskich)*


### 5. `analytics_logs` (Logi Analityczne - przykładowa struktura)
Moduł analityki opiera się na logach zbierających informacje o kliknięciach i skanach.
- `id` (String): ID logu
- `urlId` (String): ID kodu QR lub Smart Linku
- `type` (String): `qr` lub `smartlink`
- `timestamp` (Timestamp): Dokładny czas interakcji
- `visitorId` (String): Zanonimizowane ID odwiedzającego (Fingerprint) do zliczania unikalnych wizyt (Cookieless)
- `geo` (Object): Dane geograficzne (kontynent, kraj, miasto)
- `tech` (Object): Dane technologiczne (przeglądarka, urządzenie, system operacyjny)
- `utm` (Object): Parametry kampanii marketingowych (source, medium, campaign, content)

## Design System & Kolorystyka
Aplikacja została uporządkowana według ściśle określonych stref kolorystycznych w celu poprawy User Experience:
- **Pomarańczowy (#f97316):** Używany do ustawień systemowych i zarządzania zespołami (wyszukiwarki członków, formularze tworzenia zespołów, selektor menu).
- **Niebieski (#1ea2e4):** Dedykowany do wizualizacji statystyk i okien modalnych kodów QR.
- **Fioletowy (#8b5cf6):** Dedykowany do wizualizacji statystyk i okien modalnych Smart Linków.

Interfejs zyskał zaktualizowane moduły list (paski procentowe `progress bars` zintegrowane w tle) oraz płynne efekty zanikania (CSS Masking) dla długich list analitycznych.
