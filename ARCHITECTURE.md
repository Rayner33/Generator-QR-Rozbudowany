# Architektura Systemu: Generator QR Rozbudowany

## Zarys Technologiczny
Projekt oparty jest na nowoczesnym i szybkim stosie technologicznym przeznaczonym do tworzenia dynamicznych aplikacji jednostronicowych (SPA).

- **Frontend:** React.js (generowany przez Vite)
- **Styling:** Tailwind CSS (z niestandardową konfiguracją w `tailwind.config.js`)
- **Backend / Baza Danych:** Firebase (Authentication, Firestore Database)
- **Generowanie QR:** Biblioteka `qr-code-styling` (pozwala na dynamiczne zmiany narożników, kolorów i osadzanie logotypów po stronie klienta bez komunikacji z serwerem)
- **Wybór Kolorów:** `react-colorful` (nowoczesny i lekki komponent Color Picker)
- **Ikony:** `lucide-react`
- **Wykresy / Analityka:** `chart.js` oraz `react-chartjs-2`

## Struktura Bazy Danych (Firestore)

Projekt korzysta z nierelacyjnej bazy danych NoSQL (Firestore). Główne kolekcje:

### 1. `workspaces` (Przestrzenie Robocze)
Zarządza zespołami oraz przestrzenią personalną użytkowników.
- `id` (String): ID dokumentu
- `name` (String): Nazwa przestrzeni (np. "Personal", "Marketing Team")
- `ownerId` (String): UID założyciela/właściciela
- `members` (Array of Strings): Lista UID przypisanych współpracowników (użytkowników zespołu)
- `type` (String): `personal` lub `team`
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

### 3. `tags` (Tagi kodów QR)
Globalne i uniwersalne etykiety dostępne w obrębie danej przestrzeni roboczej, służące do kategoryzacji kodów QR.
- `id` (String): ID dokumentu
- `workspaceId` (String): ID przestrzeni, do której tag należy
- `name` (String): Nazwa tagu, unikalna w obrębie przestrzeni roboczej
- `color` (String): ID predefiniowanego koloru (np. `mint`, `orange`, `blue`) odpowiadający palecie zdefiniowanej w aplikacji
- `createdAt` (Timestamp): Data utworzenia

### 4. `users` (Globalny Rejestr Użytkowników)
Kolekcja tworzona przy rejestracji, służąca wyszukiwaniu członków na poczet zespołów.
- `id` (String): UID logowania
- `email` (String): E-mail użytkownika
- `name` (String): Wyświetlana nazwa (lub nazwa zastępcza)
- `avatarStyle` (String): Prywatny gradient wybrany w profilu (np. dla awatara)

### 5. `invites` (Zaproszenia do Zespołów)
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
│   │   ├── utils/              # Funkcje pomocnicze, współdzielone moduły (colors.js)
│   │   ├── context/            # Konteksty globalne np. Autoryzacja
│   │   ├── firebase.js         # Inicjalizacja i eksport instancji Firebase
│   │   ├── App.jsx             # Główny router aplikacji i system zarządzania stanem
│   │   └── main.jsx            # Punkt wejścia aplikacji z wpiętym react-router-dom
```

Aplikacja wykorzystuje `react-router-dom` (`<BrowserRouter>`, `<Routes>`) do obsługi nawigacji. Przejścia między widokami realizowane są za pomocą hooka `useNavigate`, co pozwala na pełną obsługę historii przeglądarki oraz czytelne ścieżki URL.

## Główne Komponenty Aplikacji (`app/src/components`)

1. **`App.jsx`**: Serce aplikacji. Konfiguruje router aplikacji oraz system autoryzacji użytkownika.
2. **`Auth.jsx`**: Moduł logowania. Obsługuje logowanie/rejestrację adresem email oraz logowanie przez Google za pomocą Firebase Auth.
3. **`QRList.jsx`**: Moduł wyświetlający zapisane kody QR. Obejmuje wyszukiwanie, filtrowanie ("Ostatnio utworzone", "Najwięcej skanów", "Zarchiwizowane"), przyciski pobierania plików (SVG, PNG) oraz menu kontekstowe z operacjami. Wyświetla również przypisane do kodów **Tagi** i posiada możliwość filtrowania wyników po konkretnym Tagu.
4. **`QRModal.jsx`**: Ogromny moduł odpowiedzialny za kreator kodów QR. Posiada zintegrowaną **Dynamiczną ocenę skanowalności** (bazującą na kontraście) i wspiera nowoczesny próbnik `react-colorful`. Generuje w czasie rzeczywistym podgląd za pomocą Canvas/SVG. Obsługuje tryby tworzenia (`create`), edycji (`edit`) i duplikacji (`duplicate`).
5. **System Modali Tagów** (`TagManagerModal`, `TagEditModal`, `TagDeleteModal`): Wyspecjalizowane komponenty do kompleksowego zarządzania (CRUD) tagami w przestrzeni roboczej i ich błyskawicznego przypisywania do kodów QR.
6. **`Analytics.jsx`**: Ekran dedykowany globalnym statystykom i szczegółowym danym odnośnie użycia poszczególnych kodów z przestrzeni roboczej.
7. **Moduły Pracy Zespołowej** (`WorkspaceSettings.jsx`, `NotificationsModal.jsx`, `InviteMemberModal.jsx`): Nowoczesny system zarządzania danymi na żywo oparty o odpytywanie kolekcji po adresach E-mail. Właściciele mogą tu zapraszać członków (korzystając z opcji Live Search z bazy Global Users), podczas gdy potencjalni odbiorcy zgarniają dynamiczne powiadomienia na pasku Sidebar z bezpośrednim przełączeniem do projektu.

## Główne wzorce w projekcie (Design Patterns)
- **Dynamic QR Routing:** Aplikacja rozróżnia surowe dane docelowe (zapisywane w bazie Firestore) od danych kodowanych graficznie (krótki link URL powiązany z ID dokumentu). Dzięki temu raz wygenerowany wzór wektorowy kropek pozostaje niezmienny, bez względu na modyfikacje treści przez użytkownika (z wyjątkiem sieci WiFi dla wymuszenia kompatybilności natywnej).
- **Real-time Updates:** Kody QR z bazy Firestore są nasłuchiwane w czasie rzeczywistym z użyciem `onSnapshot()`. Edycja kodu z innego urządzenia automatycznie odświeży go na liście.
- **Modals & Overlays:** Wiele procesów (np. tworzenie, edycja, tworzenie zespołu, ostrzeżenia o archiwizacji) wykonuje się jako modal, nakładając zaciemnione tło na główny interfejs.
- **Client-Side Rendering (CSR):** Silnik `qr-code-styling` na bieżąco przemalowuje kody jako wektory SVG na podstawie React State'ów bez opóźnień sieciowych, ulepszając User Experience.

- **Base64 Logo Encoding:** Obrazki wgrywane przez użytkowników w ramach dodawania logo do kodów QR są natychmiastowo konwertowane na ciągi znaków Base64 przez FileReader API. Pozwala to na ich zapisywanie bezstratnie w bazie Firestore bez konieczności utrzymywania i opłacania serwerów statycznych lub magazynów (np. Firebase Storage).
- **Live Form Validation:** Inteligentny system reagujący "w locie" z użyciem wyrażeń regularnych (RegEx) we wszystkich formatach zawartości. Zabezpiecza on bazę oraz użytkownika przed wygenerowaniem niedziałających kodów z literówkami i wymusza stosowanie poprawnych, międzynarodowych standardów dla poszczególnych rodzajów danych (E-mail, WWW, Tel, itp).

---
*(Dokument utworzony i aktualizowany przez AI Assistant na podstawie wytycznych deweloperskich)*
