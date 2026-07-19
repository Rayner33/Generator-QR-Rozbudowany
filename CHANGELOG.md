# Changelog

## [1.5.0] - 2026-07-19
### Dodane
- **Globalny moduł "Administracja":** Dodano nową, dedykowaną zakładkę w ustawieniach konta (dostępną dla administratorów), pozwalającą na pełne zarządzanie kodami QR wszystkich użytkowników oraz powiązanymi z nimi statystykami, co zapewnia centralną kontrolę nad danymi.

### Poprawione
- **Odświeżone Logo i Favicon:** Podmieniono główne logo aplikacji (na stronie logowania oraz w menu) oraz faviconę na nowe projekty wektorowe. Wdrożono zaktualizowane pliki z poprawnym obszarem roboczym (`viewBox`), a także wprowadzono mechanizm wymuszający przeładowanie u klientów (cache busting w `index.html`), aby zmiany były natychmiast widoczne u wszystkich użytkowników.
- **Płynna animacja menu zakładek:** Naprawiono problem z brakiem płynnego przesuwania się dolnej kreski (wskaźnika aktywnej zakładki) w menu "Ustawienia Konta". System animacji został ujednolicony i bazuje na poprawnie działającym, białym motywie znanym z ustawień Zespołu.

## [1.4.3] - 2026-07-05
- **Premium Editor UI (Kolory & Gradienty):** Zastąpiono klasyczne okna Color Pickera nowym, innowacyjnym układem. Wprowadzono dużą zintegrowaną planszę podglądu wybranego koloru/gradientu sprzężoną z precyzyjną "Pipetą", obok której umiejscowiono dynamiczną, sprytnie ściskającą się siatkę flex (grid), prezentującą z góry przygotowane 28 kolorów bazowych oraz 28 luksusowych gradientów.
- **Rozbudowa kreatora wizualnego:** Przeprojektowano wszystkie kształty i zachowania paneli wyboru kolorów w podziale na "Tło" oraz "Pierwszy plan", osiągając całkowitą niezależność z-indexów, a na urządzeniach mobilnych perfekcyjne ułożenie z zachowaniem kształtów klasą `aspect-square`.

### Poprawione
- **Korekta przestrzeni wektorowej (SVG & Canvas):** Rozwiązano problem odwróconych gradientów przy eksporcie. Nałożono na wewnętrzny silnik `qr-code-styling` offset o wartości -90 stopni dla rotacji gradientów (obu płaszczyzn), niwelując rozjazd matematyczny i synchronizując eksport z klasycznym pozycjonowaniem CSS (np. 135 stopni).
- **Gruntowna odnowa 30 Szablonów (qr-templates):** Zaktualizowano wszystkie dostępne motywy startowe do nowego standardu: rotacja 135 stopni w gradientach, zrezygnowanie z kanciastych modułów na rzecz nowoczesnych okręgów (`classys`, `dot`, `extra-rounded`).
- **Asynchroniczne czasy animacji (Framer Motion):** Naprawiono wizualne zapadanie się zawartości akordeonu podczas zamykania. Wprowadzono niezależny krótszy czas dla przezroczystości (0.1s) w stosunku do animacji fizycznego zwijania okna (0.2s), w efekcie maskując zgniecenie treści.
- **Ghost Line Rendering (Emboss):** Wyeliminowano fałszywy wizualny błąd brzegowy przeglądarek (Chrome/Safari) dla przezroczystych ramek nakładanych na gradienty, zamieniając `border-transparent` na renderowane po warstwie wewnętrznej `shadow-[inset]`.

## [1.4.2] - 2026-07-02
### Poprawione
- **Optymalizacja widoków mobilnych (Analityka i Edytor):** Usunięto błąd ucinanych przycisków w Analityce oraz ulepszono ich estetykę (usunięto mylący efekt `hover`). Całkowicie przebudowano mobilny układ edytora kodów QR – m.in. skompresowano style do widoku kompaktowej siatki, zrównano przycisk zapisu z szerokością podglądu kodu QR, oraz sprytnie przeniesiono ręczne pole wpisywania HEX do wewnątrz zoptymalizowanego okienka wyboru koloru. Poprawiono system zamykania okien kolorów i płynne skalowanie elementów.

## [1.4.1] - 2026-07-01
### Dodane
- **Animacje kaskadowe (Stagger Animations):** Wdrożono nowoczesny, ujednolicony system animacji (oparty o framer-motion) na wszystkich listach w aplikacji. Elementy na listach Kodów QR, Smart Linków, w blokach analityki oraz w oknach ustawień (zespołu i konta użytkownika) ładują się teraz kaskadowo z płynnym, "sprężystym" efektem, nadając aplikacji jeszcze bardziej profesjonalny i "żywy" charakter. Szybkość ładowania zestrojona z opóźnieniem 50ms na każdy kolejny element.

## [1.4.0] - 2026-06-29
### Dodane
- **Pełna responsywność i dostosowanie do wersji mobilnych (Mobile First UI):** Całkowicie przebudowano i zoptymalizowano interfejs kluczowych ekranów, aby aplikacja działała i wyglądała perfekcyjnie na smartfonach i tabletach.
- Zmodyfikowano układy poszczególnych elementów, takich jak menu opcji (3 kropki), widoki analityki, tagi i informacje tekstowe (data, autor), tak aby intuicyjnie układały się w stosy (kolumny) na małych ekranach.
- Przystosowano kontrolki u góry listy (Wyszukiwarka, Tagi, Filtry), upewniając się, że nie zachodzą na siebie i dopasowują się szerokością.

### Poprawione
- **Kosmetyka wersji Desktop (PC):** Usunięto nieestetyczne szare pola, integrując czarne, wtopione w tło przyciski tagów na listach kodów. Dodatkowo zapewniono marginesy dolne list ułatwiające nawigację na dole ekranu.
- **Równowaga kontenerów tekstowych:** Wyrównano wizualnie wertykalne odstępy dla kodów w formacie "TEKST" na dedykowanej stronie przekierowania, ignorując wbudowany górny margines pierwszych nagłówków.

## [1.3.6] - 2026-06-29
### Dodane
- **Rozbudowa Edytora Tekstowego (Quill):** Wzbogacono pasek narzędzi w kodach typu "Tekst" o nowe, kluczowe funkcjonalności dla twórców: dedykowane przyciski nagłówków (H1 i H2) dla jasnej struktury, formatowanie cytatów (Blockquote) oparte na eleganckim, firmowym pomarańczowym akcencie PARYS, oraz zaawansowaną paletę kolorowania tekstu i jego tła. W palecie barw zintegrowano i umiejscowiono na priorytetowych pozycjach trzy kluczowe kolory identyfikacji wizualnej platformy (Pomarańczowy, Niebieski, Fioletowy).

### Poprawione
- **Optymalizacja Nagłówków w Edytorze:** Zaprojektowano od nowa grubości i marginesy nagłówków H1 i H2, zmniejszając ich nadmierne rozmiary domyślne na korzyść subtelniejszego, wyrównanego wyglądu (Waga H1/H2 równa 700). Zmiany estetyczne wiernie odwzorowano zarówno w samym edytorze w panelu, jak i na ostatecznej stronie tekstowej dla użytkownika.
- **Odporność na "Puchnięcie" Pogrubień w Tailwind Prose:** Wyeliminowano błąd krytyczny po stronie frameworka Tailwind na stronach docelowych, w którym tagi `<strong>` oraz `<b>` wewnątrz nagłówków nadmiernie powiększały wagę czcionki (do 900). Zastosowano radykalne, wymuszone reguły CSS zapewniające absolutną stabilność tekstów na urządzeniach mobilnych.
- **Naprawa Funkcji Resetu Analityki:** Rozwiązano błąd uniemożliwiający fizyczne usunięcie archiwalnych danych z chmury po kliknięciu "Resetuj Analitykę" (błędna ścieżka kolekcji: `analytics_logs` zamiast poprawnej `analytics`).

## [1.3.5] - 2026-06-29
### Dodane
- **Normalizacja Danych Analitycznych:** Zintegrowano zaawansowany słownik normalizujący, który w locie (po stronie klienta) tłumaczy i łączy stare wpisy z bazy geoip-lite z nowymi, profesjonalnymi logami MaxMind. Rozwiązano problem duplikacji (np. równoczesnego wyświetlania statystyk dla "EU" i "Europe" czy "Warszawa" i "Warsaw"). Od teraz wszystkie dane geograficzne (kontynenty, kraje, duże miasta) prezentowane są w ujednoliconej, zoptymalizowanej i w 100% spolszczonej formie na wykresach.

### Poprawione
- **Edytor Tekstu WYSIWYG (Quill):** Kompleksowo zoptymalizowano zachowanie edytora wykorzystywanego w trybie kodów QR typu "TEXT". Do paska narzędzi dodano brakującą opcję justowania/wyśrodkowania tekstu. Wyeliminowano problem zapamiętywania treści z poprzednio tworzonych kodów poprzez wymuszone czyszczenie stanu formularza (React State Reset).
- **Zarządzanie marginesami w Edytorze:** Usunięto błąd układania się tekstu zastępczego (placeholder) poza krawędziami tekstu. Wyzerowano ukryte, nadmierne marginesy klasy Tailwind Prose dla akapitów (`<p>`), dzięki czemu natywny klawisz "Enter" zachowuje się teraz tak płynnie jak dawny miękki Shift+Enter (bez nienaturalnych pustych luk), co ułatwia wpisywanie skompresowanych bloków kontaktowych (np. danych teleadresowych).
- **Spójność Wizualna Renderowania Text QR:** Wdrożono specjalną klasę korygującą `prose-p:my-0` na stronie docelowej (`RedirectEngine`), dzięki czemu formatowanie odstępów akapitów odczytywanych po zeskanowaniu kodu pokrywa się idealnie, piksel-w-piksel z widokiem podglądu z panelu edycji.
- **Błędy CORS na Produkcji (Ukrywanie Stack Trace):** Wprowadzono do produkcyjnego mikroserwisu Node.js mechanizm łagodnego wyłapywania i transformacji (Global Error Handling) wyjątków rzucanych przez bibliotekę `cors`. Serwer w razie zapytania z nieznanej domeny nie "wypluwa" już wewnętrznych, technicznych ścieżek aplikacji, lecz bezpiecznie zwraca wystandaryzowany komunikat JSON.
- **UI Zarządzania Zespołem:** Zwiększono domyślną szerokość okna podręcznego w panelu opcji członków przestrzeni roboczej (`w-40` -> `w-44`), by nazwa akcji "Zrób Menedżerem" mieściła się w jednej linii nie psując kompozycji menu.

## [1.3.4] - 2026-06-26
### Dodane
- **Produkcyjny Mikroserwis GeoLite2:** Opracowano i zaimplementowano dedykowany, wydajny mikroserwis Node.js dla środowiska produkcyjnego wykorzystujący oficjalną bazę GeoLite2-City firmy MaxMind. Serwer automatycznie obsługuje ekstrakcję prawdziwego adresu IP odwiedzającego (uwzględniając maskowanie Nginx Proxy oraz Cloudflare).
- **Zabezpieczenia API Geolokalizacji:** Wdrożono dwuwarstwowy system zabezpieczeń: restrykcje CORS (uniemożliwiające łączenie się z API z innych domen niż zaufane, np. `qr.parys.pl`) oraz ukryty w nagłówkach HTTP klucz API (`x-api-key`) skutecznie chroniący serwer przed zautomatyzowanymi botami indeksującymi i masowymi zapytaniami z poziomu terminala.
- **Graceful Fallback w Geolokalizacji:** Opracowano system łagodnego radzenia sobie z nierozpoznanymi (np. prywatnymi, maskowanymi) adresami IP. Mikroserwis zamiast generować typowe błędy połączenia (HTTP 404/400) widoczne na czerwono w konsoli przeglądarki, gładko zwraca prawidłowy status 200 z informacją "Unknown", utrzymując nienaganną czystość konsoli deweloperskiej platformy.

### Poprawione
- **Parsowanie Linków w Kodach Tekstowych:** Wdrożono pre-procesowanie danych wprowadzonych w edytorze tekstowym WYSIWYG przed ich wyrenderowaniem. System za pomocą natywnego parsera DOM automatycznie wykrywa i transformuje wadliwe hiperłącza względne (np. `www.parys.pl`) dodając do nich niezbędny protokół `https://`. Dodano również atrybut `target="_blank"`, gwarantując, że linki otworzą się w nowej karcie bez przerywania sesji użytkownika na czytanej stronie skanowanego kodu.

## [1.3.3] - 2026-06-25
- **Transfer Kodów i Smart Linków:** Wprowadzono bezstratny system przenoszenia własności zasobów (kodów QR oraz Smart Linków) pomiędzy przestrzeniami roboczymi (np. z przestrzeni osobistej do przestrzeni zespołu). Opcja uwzględnia ścisłe uprawnienia edycji i natychmiast przenosi całą zebraną do tej pory analitykę.
- **Bezpieczne Oczyszczanie Tagów:** Podczas transferu zasobów pomiędzy zespołami, system inteligentnie czyści poprzednio przypisane tagi, ponieważ nowa przestrzeń robocza posiada własny, niezależny system etykietowania.
- **Wersjonowanie w interfejsie:** Zintegrowano automatyczny znacznik wersji aplikacji na dole paska bocznego (Sidebar), wczytywany dynamicznie z pliku `package.json`.
- **Zamykanie Modali w tle (Backdrop Click):** Wdrożono ujednolicone zamykanie okien ostrzegawczych (np. przed Archiwizacją, Resetem statystyk) poprzez kliknięcie w dowolne miejsce w tle, zwiększając ergonomię użytkowania na wszystkich ekranach.

### Poprawione
- **Stylistyka okien modalnych:** Ujednolicono wizualnie okno nowej funkcji Transferu (brak gradientu, zewnętrzny "X", zachowane animacje znikania) z resztą platformy.
- **Produkcyjny Build SPA:** Poprawiono błędny import bazy danych Firebase w nowym oknie Transferu, co odblokowało możliwość bezbłędnego zbudowania produkcyjnej paczki SPA (Vite/Rolldown).


## [1.3.2] - 2026-06-25
### Dodane
- **Niestandardowe Kolory Tagów (HEX):** Całkowicie przebudowano silnik renderowania tagów, znosząc ograniczenie do sztywno zdefiniowanej palety kolorów Tailwind. Tagi obsługują teraz dowolny kolor z palety 16 milionów barw HEX.
- **Wbudowany Color Picker:** W oknie tworzenia i edycji tagów zintegrowano nowy wizualny selektor barw (`react-colorful`) pozwalający na precyzyjne ustawienie dowolnego odcienia za pomocą "tęczowego kółeczka". Opcja ta posiada własny, estetyczny przycisk z pastelowym, stożkowym gradientem.
- **Animacje w Menedżerze Tagów:** Przeprojektowano listę dostępnych tagów w oknie zarządzania, wprowadzając płynne, sprzętowo akcelerowane podświetlanie (hover) oparte o `framer-motion` (Magic Layout). Element gładko "ślizga się" między rzędami podążając za kursorem. Dodano niestandardowy pasek przewijania oraz efekt zanikania (fade-out gradient) przy dolnej krawędzi długiej listy.
- **Odświeżenie List Rozwijanych w Analityce:** Zastąpiono statyczne, przeskakujące podświetlenia elementów na listach "Filtruj" oraz wyboru przedziału czasowego. Wdrożono płynne, ślizgające się tło hovera (`framer-motion`), spójne z resztą platformy.
- **Routing SPA na serwerach Nginx:** Zamieniono plik `.htaccess` na konfigurację `nginx.conf` z regułami przepisywania (fallback na `index.html`), rozwiązując problem błędu 404 (Not Found) podczas bezpośredniego wchodzenia w linki statystyk (np. `/oCtmq`) lub po odświeżeniu strony w środowisku produkcyjnym.
- **Zewnętrzne meta-dane:** Zmieniono systemową nazwę aplikacji (wyświetlaną na kartach w przeglądarce) z domyślnego "app" na "QR PARYS" oraz zaktualizowano atrybut językowy dokumentu HTML na polski (`pl`).

### Poprawione
- **Stabilność renderowania tagów:** Usunięto błąd powodujący natychmiastowy "czarny ekran" w aplikacji React w momencie przypisywania tagów, wynikający z brakującego importu ikon (`ReferenceError`). Poprawiono również rozszczepienie stylizacji na listach filtrów, aby ikony checkmark poprawnie dziedziczyły wybrany niestandardowy kolor tekstu.
- **Wsparcie autoryzacyjne (Firebase):** Zweryfikowano i dodano produkcyjną domenę logowania Google Auth do autoryzowanych domen w GCP, odblokowując możliwość pomyślnego uwierzytelniania na nowym adresie `qr.parys.pl`.
## [1.3.1] - 2026-06-23
### Dodane
- **Dedykowany widok dla dezaktywowanych Smart Linków:** Wprowadzono warunkowe renderowanie (rozgałęzienie interfejsu) na stronie archiwum. Kiedy zarchiwizowany zostaje nie kod QR, a czysty Smart Link, system nie wyświetla już mylącego, wygenerowanego kodu QR. Zamiast tego renderowany jest estetyczny, responsywny "kafelek" tekstowy (z wyszarzoną domeną automatycznie dostosowującą się do adresu środowiska produkcyjnego i wyróżnionym, białym identyfikatorem), w pełni spójny z motywem platformy i opatrzony etykietą "Dezaktywowany".

### Poprawione
- **Wygląd i spójność kodów QR:** Naprawiono błąd zaokrągleń ułamkowych we wbudowanej bibliotece SVG (fractional rounding margin), ujednolicając rozdzielczość bazową kodów we wszystkich oknach podglądu. Dzięki temu kody pozbawione są niepożądanych, asymetrycznych białych pasów wokół krawędzi.
- **Proporcjonalne marginesy:** Sztywne, pikselowe klasy w CSS zostały zamienione na responsywne (procentowe) marginesy `p-[6.5%]`. Pozwala to na idealnie zachowane, geometryczne proporcje białego tła wobec kropek QR niezależnie od tego, jak duży jest ekran. Identyczny proporcjonalny margines został dodany do logiki pobieranych i generowanych plików PNG/SVG.
- **Ekran kodu zarchiwizowanego:** Wyeliminowano błąd związany z duplikowaniem kodu QR w drzewie DOM w trakcie cyklu montowania Reacta. Wygląd kodu został ujednolicony z podglądem z kreatora (poprawny URL i dodane logo).
- **Link pobieranych kodów:** Usunięto stary ciąg testowy z funkcji pobierania. Graficzny plik, który pobiera klient, przechowuje teraz prawidłowy skrócony i funkcjonujący adres.

## [1.3.0] - 2026-06-21
### Dodane
- **Bezpieczne usuwanie zespołów (Soft Delete):** Zastąpiono permanentne i kaskadowe usuwanie zespołów bezpieczną "Archiwizacją Zespołu". Zarchiwizowane zespoły zostają całkowicie ukryte z interfejsu (i przerywają działanie swoich kodów QR), ale wszystkie fizyczne dane pozostają zamrożone w bazie Firestore. Opcja ta zapobiega bezpowrotnej i przypadkowej stracie np. ulotek promocyjnych – odwrócenie procesu jest możliwe z poziomu bazy danych przez Administratora.
- **Tarcza Antybotowa (Firebase App Check):** Wdrożono system zabezpieczeń oparty o `reCAPTCHA v3 Standard`, który niewidzialnie dla użytkownika autoryzuje każde zapytanie. Chroni to bazę statystyk przed fałszywym nabijaniem kliknięć przez automatyczne skrypty i wtyczki (scrapery), przy jednoczesnym zerowym wpływie na UX (brak obrazków do klikania).

### Poprawione
- **Odblokowanie analityki UTM:** Zidentyfikowano i załatano krytyczny rygor w Regułach Bezpieczeństwa Firestore (`firestore.rules`), który całkowicie blokował zapisywanie statystyk dla kodów posiadających parametry UTM. Zaktualizowano schemat weryfikacji, dopuszczając pole `utm` przy zachowaniu najwyższych standardów bezpieczeństwa.

## [1.2.0] - 2026-06-15
### Dodane
- **Dynamiczne Kody Tekstowe (Mikro-strony):** Nowa funkcjonalność umożliwiająca tworzenie kodów QR przechowujących sformatowany tekst. Kody zachowują się jak kody dynamiczne (zliczają statystyki), kierując skanującego na dedykowaną, estetyczną, mobilną mikro-stronę w aplikacji. Zintegrowano lekki wizualny edytor WYSIWYG (`react-quill-new`) pozwalający na dodawanie pogrubień, list i linków z zachowaniem brandingu.
- **Odświeżone UI Modalów:** 
  - Usunięto nieestetyczne systemowe suwaki z poziomych list zakładek (m.in. przy wyborze typów zawartości). Wprowadzono system "Drag to Scroll" z pojawiającymi się po najechaniu, dedykowanymi przyciskami (strzałkami) do przesuwania.
  - Zaimplementowano płynne, zaawansowane animacje w oparciu o silnik `framer-motion` (Magic Layout) dla znaczników aktywnej zakładki, ujednolicając tym samym czas i charakterystykę przeskoku (typ sprężynowy bez odbicia - *bounce: 0*) z resztą platformy.
- **Przekazywanie Własności Zespołów:** Właściciel zespołu ma teraz możliwość trwałego i bezpiecznego przekazania praw własności nad zespołem dowolnemu członkowi. Proces opiera się na wysłaniu zaproszenia typu `transfer_request`, które wymaga akceptacji przez odbiorcę z poziomu "Dzwoneczka". Przyjęcie zaproszenia degraduje dotychczasowego właściciela do roli członka, zachowując bezwzględne bezpieczeństwo.
- **Rola Menedżera (Restrykcje UI):** Zmieniono nazewnictwo "Admin" na "Menedżer". Menedżer zachowuje pełne prawa operacyjne nad kodami i statystykami, ale został pozbawiony dostępu do zarządzania samym zespołem (brak możliwości dodawania/usuwania członków, zmiany ról i edycji nazwy/koloru zespołu).

### Poprawione
- **Ukrywanie Tagów dla nieuprawnionych:** Zwykli członkowie zespołu bez prawa do edycji kodów nie widzą już przycisków dodawania ani modyfikacji Tagów (ukryto ikonę '+' oraz napis "Wybierz tagi").
- **Stan UI (Real-time update) po akceptacji zaproszenia:** Rozwiązano problem konieczności odświeżania strony po zaakceptowaniu prośby. Zamiast nadpisywać stan aplikacji częściowymi danymi, komponent powiadomień błyskawicznie dociąga kompletny obiekt zespołu z bazy Firestore i automatycznie go wczytuje.
- Zablokowano błąd duplikacji obiektów powielających render "Właściciela" poprzez ścisłe filtrowanie unikalnych `uids` w ustawieniach zespołu.
- Usunięto błędy wizualne pustych separatorów z list rozwijanych (np. po przycisku "Duplikuj"), gdy dany członek zespołu nie ma dostępu do opcji Archiwizacji/Resetowania.

## [1.1.0] - 2026-06-12
### Dodane
- **Wielowymiarowe Filtrowanie Analityki:** Pełna implementacja zaawansowanego filtrowania statystyk w panelu Analityki. Możliwość jednoczesnego krzyżowania danych (np. Państwo + Urządzenie + Kampania UTM), z dynamicznym odzwierciedleniem na wykresie i listach w czasie rzeczywistym.
- **Moduł Analityki UTM:** Nowa dedykowana sekcja w statystykach analizująca parametry ruchu sieciowego (Source, Medium, Campaign, Content). 
- Rozbudowa eksportu CSV o kolumny z wartościami UTM oraz zapewnienie, że plik zawsze eksportuje dane zgodne z nałożonymi filtrami w interfejsie.
- **Interaktywne Listy Statystyk:** Kliknięcie w dowolny wiersz statystyki (np. "Mobile", "Europa", "Źródło: ulotka") automatycznie nakłada ten filtr, a aktywne elementy podświetlają swój pasek na czerwono, wskazując aktualne filtry. Interfejs zyskał dedykowane pływające okienka "chip" pozwalające wyłączać nałożone warunki selekcji.

- **Optymalizacja UX Menu i Filtrów:** Zaimplementowano płynne zamykanie okien typu "dropdown" (Tagi, Sortowanie, Filtry Analityki) przy zjechaniu kursem (onMouseLeave) z marginesem błędu 250ms zapobiegającym przypadkowemu zamykaniu. Poprawiono estetykę i kolory dynamicznego focusu we wbudowanych wyszukiwarkach.
- **Dynamiczny podgląd UTM:** W pełni zaimplementowano natychmiastowe aktualizowanie adresu URL o utworzone tagi UTM, zarówno w widoku modala jak i na głównej liście kodów, z obsługą czyszczenia starych tagów.
- **Wydajność Przekierowań (Redirect Engine):** Przebudowano silnik przekierowań, eliminując sekwencyjne blokowanie przez zapytania do bazy danych i API geolokalizacyjnego. Wprowadzono architekturę współbieżną (Parallel Promise execution) dla zapytań odczytujących z 400ms limitem czasowym (timeout) dla logowania analityki, co przyspieszyło przekierowanie użytkownika o ponad 60% bez utraty danych.


## [1.0.1] - 2026-06-10
### Bezpieczeństwo
- **Konfiguracja Firebase przeniesiona do zmiennych środowiskowych:** Klucze API usunięte z kodu źródłowego do pliku `.env.local` (wykluczony z git). Wdrożono restrykcję domenową HTTP Referrer w Google Cloud Console — klucz działa wyłącznie z autoryzowanych domen produkcyjnych.
- **Wzmocnienie Firestore Security Rules:** Funkcja `isAppAdmin()` weryfikuje teraz domenę emaila bezpośrednio w tokenie Firebase (`@parys.pl`). Eliminuje dostęp przez konta spoza domeny firmowej, nawet przy bezpośrednim wywołaniu Firebase SDK przez konsolę przeglądarki.
- **Ochrona analityki przed botami:** Reguła `analytics/create` wymaga teraz uwierzytelnienia, ściśle określonego zestawu pól oraz weryfikacji, że `codeId` faktycznie istnieje w bazie. Eliminuje masowe wstrzykiwanie fałszywych skanowań.
- **Weryfikacja domeny przeniesiona do AuthContext:** Sprawdzenie `@parys.pl` działa na poziomie kontekstu — każde konto spoza domeny jest natychmiast wylogowywane niezależnie od ścieżki uwierzytelnienia.
- **Usunięcie `gmail.com` z whitelisty:** Domena testowa usunięta — aplikacja akceptuje wyłącznie konta `@parys.pl`.
- **Usunięcie narzędzia diagnostycznego z UI:** Panel masowego usuwania przestrzeni roboczych usunięty ze strony Konta (był dostępny publicznie dla każdego zalogowanego użytkownika).

### Poprawione
- **Kaskadowe usuwanie workspace'u rozszerzone:** Usunięcie Zespołu usuwa teraz atomowo (`writeBatch`) powiązane: `qrcodes`, `smartlinks`, `tags`, `analytics` i `invites`. Poprzednio tylko `qrcodes` były czyszczone.
- **Naprawa zarządzania członkami zespołu:** `memberDetails` przechowuje teraz `uid` explicite — poprzednio `member.uid` było zawsze `undefined`, blokując usuwanie i identyfikację członków.
- **Routing `/login` naprawiony:** Dodano `/login` do wyjątków `isPublicRedirect` — wcześniej wejście na `/login` mogło być błędnie traktowane jako short link.
- **`signOut` awaitable:** Wylogowanie używa teraz `await signOut(auth)`.
- **URL geo API jako zmienna środowiskowa:** Hardkodowany `http://localhost:3001` zastąpiony przez `import.meta.env.VITE_GEO_API_URL`.
- **Usunięto pusty stub `handleDelete`:** Funkcja i modal "Usuń trwale" usunięte z `QRList.jsx` — usuwanie jest celowo możliwe tylko ręcznie przez administratora bazy.

## [1.0.0] - 2026-06-10
### Dodane
- **Eksport CSV Analityki:** Implementacja pobierania szczegółowych "surowych" logów z uwzględnieniem aktywnych w danej chwili filtrów z poziomu widoku statystyk. Pliki generowane w pełni kompatybilnie z programami kalkulacyjnymi (np. Excel) ze wsparciem polskich znaków (BOM).
- **Zabezpieczenie ról dla Zespołów (RBAC):** Pełna weryfikacja ról w Zespołach. Członkowie (Members) mają teraz zablokowany dostęp do modyfikacji ustawień drużyny, usuwania zespołu oraz Archiwum. Jedynie Założyciel (Owner) może trwale usunąć grupę. Zastosowano precyzyjne reguły w interfejsie w powiązaniu z uprawnieniami zapisanymi w Firestore.
- **Inteligentne Linki w kodach:** Typy QR `vCard`, `WiFi` oraz `Telefon` automatycznie otwierają swój ekran edycji bezpośrednio po kliknięciu linku docelowego w liście kodów (ponieważ nie mają fizycznej strony docelowej). Tytuły linków w panelu otrzymały precyzyjne, sformatowane etykiety zastępujące nieczytelne przedrostki protokołów.

### Poprawione
- **Naprawa race condition przy logowaniu:** Wyeliminowano uporczywy problem dublujących się "Osobistych" przestrzeni roboczych (Personal Workspaces). Zapytanie `getDocs` twardo weryfikuje brak profilu z serwera przez utworzeniem, omijając wyścig danych lokalnej pamięci podręcznej.
- Ujednolicono system wielkości, grubości oraz układu przycisków na przestrzeni całej aplikacji.
- Płynne zamykanie okien (Click-outside) elegancko wyłącza wszystkie drobne okienka opcji (Role, Filtry) po kliknięciu w tło.
- Wdrożono spójne, bezszwowe animacje wejścia (`framer-motion`) m.in. dla paska modyfikacji uprawnień członków.
## [0.17.0] - 2026-06-09
### Dodane
- **Globalna Aktualizacja Interfejsu (UI/UX):** Zbudowano jednolity, spójny system kolorystyczny w całej aplikacji. Pomarańczowy (#f97316) dla ustawień zespołów, Niebieski (#1ea2e4) dla Modułu Kodów QR oraz Fioletowy (#8b5cf6) dla Smart Linków.
- Zmodyfikowano zachowanie animacji "magic hover" oraz obrysów formularzy (focus rings), aby zintegrować się z nowym schematem kolorystycznym.
- Wprowadzono "Maskę Gradientową" na głównym panelu Analityki, dzięki której statystyki (np. Kody QR, Urządzenia, Państwa) płynnie znikają (fade-out) na dolnej krawędzi okna, tworząc wizualny efekt głębi (CSS Masking).

### Poprawione
- **Analityka:** Wdrożono inteligentne renderowanie przycisku "Zobacz wszystko" na głównej liście analityki – widoczny jest tylko wtedy, gdy liczba pozycji na liście przekracza 7 elementów.
- Wyeliminowano błędny routing filtrów w Analityce. Opcja "Smart Linki" w menu głównych filtrów (dropdown) wysyła już prawidłową wartość `smartlink` zamiast `links`, poprawiając awarię braku załadowania odpowiednich danych.
- Zmniejszono paddingi statystyk w modułach analityki, wprowadzając cienkie poziome paski ładowania (Progress bars), które dynamicznie pokrywają tło każdego elementu względem jego popularności.
- System dynamicznie odcina ułamki dziesiętne z wyników procentowych w przypadku osiągnięcia 100%, oszczędzając przestrzeń interfejsu.
- Poprawiono kolory w modalu "Zaproszenie członka zespołu" i "Nowy zespół", tak aby formularze podświetlały się spójnym pomarańczem.

## [0.7.0] - 2026-06-08
### Dodane
- **Panel Analityki (Analytics.jsx):** Utworzenie głównego widoku analityki ze spersonalizowanymi statystykami. Wykorzystanie biblioteki chart.js do interaktywnego głównego wykresu.
- Zaimplementowano ujednolicony modal 'Zobacz wszystko' w panelu Analityki ze wsparciem dla wyszukiwania i dostosowanym schematem kolorów (niebieski dla kodów QR, fioletowy dla Smart Linków).

### Poprawione
- **Optymalizacja wydajności:** Wdrożono opónienie wyciągania (renderowania) dużych list QR kodów i Smart Linków (setTimeout), co wyeliminowano zacięcia podczas odtwarzania animacji nawigacyjnej w menu bocznym.
- **Ujednolicenie wizualne:** Zsynchronizowano kolorystykę przycisków analityki oraz mini-wykresów (sparklines) w listach QRList.jsx i SmartLinksList.jsx do obowiązującego schematu Analytics (odpowiednio #1ea2e4 i #8b5cf6).

Wszystkie najważniejsze zmiany w tym projekcie dokumentowane są w tym pliku.

Format pliku bazuje na standardzie [Keep a Changelog](https://keepachangelog.com/pl/1.0.0/), a wersjonowanie odpowiada standardowi [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.16.0] - 2026-06-08
### Dodane
- **Globalne Animacje i Magic Hover:** Wprowadzono scentralizowany system animacji oparty o bibliotekę `framer-motion` (`src/utils/animations.js`). Aplikacja korzysta teraz ze spójnego efektu powiększania i rozjaśniania (fade & scale) przy otwieraniu wszelkich okienek typu dropdown (wybór Workspace, lista tagów, menu filtrów i menu akcji). Dodano również "magiczny", przesuwający się efekt tła przy najechaniu na kafelki głównych zakładek.
- **Wizualna unifikacja:** Przyciski z filtrami ("Tagi", "Ostatnio utworzone") zyskały odświeżony styl podświetlający obramowania, a modale zyskały identyczny styl okrągłego białego przycisku zamknięcia, porządkując design systemu.

### Poprawione
- **Filtrowanie Zaproszeń:** Okno zapraszania członków do zespołu (`InviteMemberModal`) inteligentnie ignoruje teraz własny e-mail użytkownika podczas autouzupełniania – zapobiegając wysłaniu bezcelowego zaproszenia do samego siebie.
- **Optymalizacja DOM:** Rozwiązano problemy z cyklem życia okien z użyciem tagu `<AnimatePresence>` w React, dzięki czemu animacje zamknięcia poszczególnych okien menu akcji odgrywają się w poprawny i naturalny sposób.

## [0.15.0] - 2026-06-07
### Dodane
- **Silnik Przekierowań (Redirect Engine):** Niewidzialny, błyskawiczny moduł uruchamiający się przy wejściu na krótki odnośnik (np. `/:shortId`). Otwiera i zlicza kliknięcia w pełni asynchronicznie za pomocą `runTransaction` w Firebase, kierując użytkownika końcowego bezpośrednio na oryginalny URL.
- **Granularne Uprawnienia Zespołu:** Nowa zakładka "Uprawnienia" w module `WorkspaceSettings`. Właściciele Zespołów otrzymali możliwość odbierania nowo dodanym członkom zespołu praw do: *Edycji*, *Archiwizacji* i *Resetowania Analityki* kodów należących do innej osoby. Odpowiednio wdrożono zaktualizowane `firestore.rules`.

### Zmienione
- **Enterprise SSO:** Usunięto klasyczne formularze E-mail/Hasło oraz system "Próśb o dostęp". Przekształcono aplikację na w pełni zamknięty ekosystem oparty o Single Sign-On (Google Login) weryfikujący końcówki domen.
- Zabezpieczenie przed atakami Brute-Force oraz odciążenie zarządzania (osoba wyrzucona z grupy firmowej automatycznie traci dostęp do bazy).
- **Branding:** Ujednolicono system ikon, używając ikony kodu QR z pakietu `lucide-react` w roli nowego, dynamicznego i skalowalnego logo platformy (`Sidebar.jsx`, `Login.jsx`).

### Poprawione
- **Redirect Optimization:** Przebudowano warstwę nawigacji tak, by logowanie przez panel Google SSO oraz akceptacja zaproszenia zawsze kierowała użytkowników bezpośrednio do listy najnowszych kodów QR (`/`), zamiast do ustawień konta.
- Skrupulatnie zablokowano i wyszarzono ikonę ołówka edycji w panelu wizytówki kodu, dając gwarancję wizualnego uniemożliwienia naruszenia cudzego projektu (Security UX).

## [0.14.0] - 2026-06-07
### Dodane
- **Smart Linki (Inteligentne Odnośniki):** Wprowadzono całkowicie nowy moduł aplikacji działający równolegle do Kodów QR. Oferuje on odrębną listę `SmartLinksList` wraz z innowacyjnym systemem pobierania ikonek (favicons) z adresów docelowych w celach podglądu.
- Stworzono uproszczony kreator `SmartLinkModal.jsx`, pozwalający użytkownikom na błyskawiczne zakładanie krótkich linków bez konieczności dostosowywania grafik.
- **Odświeżony Menadżer Tagów:** System przypisywania tagów otrzymał przepiękny, w pełni reaktywny interfejs oparty na półprzezroczystym "szkle" (Glassmorphism). Modale można teraz wyłączać intuicyjnym kliknięciem poza ich obszarem (backdrop click) - funkcja ta powędrowała zresztą również do pozostałych okien dialogowych.

### Poprawione
- Rozwiązano problem "martwego stanu" (stale state) okienek zarządzania tagami. Obecnie każdy modal subskrybuje z bazy `Firestore` najświeższe dane, co umożliwia przypinanie i odpinanie tagów całkowicie w locie, w czasie rzeczywistym, bez zamykania panelu.
- Uspójniono architekturę przycisków rozciągających element i ulepszono dropdown z filtrami - zyskał on nowy system ikonek `Radio` naśladujących główny kolor taga. W ten sposób zniwelowano efekt przeciążenia interfejsu.

## [0.13.0] - 2026-06-07
### Dodane
- **Short link w kreatorze:** Dodano panel "Short link" jako pierwszy krok w oknie tworzenia kodu QR. Generuje on automatycznie unikalny, 5-znakowy identyfikator i w locie weryfikuje jego dostępność w bazie danych (zapobiegając konfliktom). W trybie edycji krótki link jest zablokowany, chroniąc integralność danych.
- **Interaktywne Statystyki Kodów QR:** Przebudowano statyczny licznik skanowań na liście kodów, zamieniając go w dynamiczny, interaktywny przycisk ("Pokaż więcej") prowadzący docelowo do zakładki Analityki. Wdrożono filtry graficzne CSS i efekty "glow".

### Zmienione
- **Rzeczywisty Podgląd na liście:** Zrezygnowano ze sztucznej ikony w widoku listy `QRList.jsx`. Aplikacja renderuje w locie prawdziwe, w pełni ostylowane wektory kodów QR w wysokiej bazowej rozdzielczości (1000x1000 px), skutecznie eliminując matematyczne odchyłki marginesów biblioteki generatora.
- **Odnośniki zewnętrzne:** Udoskonalono obsługę klikalnych linków pod kodem – system automatycznie dokleja prefiks `https://` do linków bez protokołu HTTP, co zapobiega traktowaniu ich jako adresów podrzędnych względem uruchomionej strony.
- **Wizualne Tweaki:** Skompresowano sztuczne paddingi na listach kodów, uzyskując czystszy, bardziej dopasowany układ.

## [0.12.0] - 2026-06-06
### Dodane
- **Pełen Ekosystem Pracy Zespołowej (Zespoły & Zarządzanie):** Wdrożono całkowicie nowy, dedykowany panel Ustawień Zespołu (`WorkspaceSettings`). Właściciel zespołu ma prawo do zmiany nazwy, gradientu lub usunięcia całego zasobu, a pozostali Członkowie mogą go jedynie opuścić.
- **Powiadomienia i Odbieranie Zaproszeń:** Zaproszeni użytkownicy otrzymują dyskretne Powiadomienia bez przeładowywania strony. Odbiór powiadomienia objawia się świecącym dzwonkiem w nawigacji oraz wbudowanym Modalem w którym, poprzez zatwierdzenie, użytkownik zostaje dynamicznie dodany do listy uczestników zespołu.
- **Live Search w Zaproszeniach:** Implementacja inteligentnego Modala wyszukiwania wspierającego Live Search. Baza rejestruje od teraz logowania i buduje sieć `users` globalnie, umożliwiając autouzupełnianie się wyników wewnątrz formularza zaproszeń na podstawie pierwszych wpisywanych znaków e-maila. Synchronizowane są także wybrane kolory i unikalne nazwy osobiste.

## [0.11.0] - 2026-06-06
### Zmienione
- **Refaktoryzacja Architektury:** Przejście z prostego przełączania widoków (stan activeView) na pełny system routingu z wykorzystaniem biblioteki `react-router-dom`. Gwarantuje to stabilne przełączanie między kartami i zapamiętywanie historii URL.
- **Struktura Plików:** Usystematyzowano drzewo projektu – główne podstrony (Account, Analytics, QRList) przeniesiono do nowego folderu `pages/`, a logikę zapytań o zespoły przeniesiono do reużywalnego Custom Hooka `useWorkspaces.js` do folderu `hooks/`.

## [0.10.0] - 2026-06-06
### Dodane
- **Wgrywanie Logotypów (Base64):** Zaimplementowano nową sekcję (Krok 5) umożliwiającą wrzucenie własnego logo do kodu QR (obsługa formatów JPG, PNG, SVG). Rozwiązano problem skomplikowanego hostingu plików poprzez inteligentną konwersję logotypu do Base64 "w locie" i bezstratne zapisanie go w Firestore jako tekst. 
- **Dynamiczna walidacja formularzy w locie:** System rozpoznaje błędnie wpisywane dane już w trakcie pisania. Niepoprawny adres E-mail, format numeru telefonu czy błędny link natychmiast podświetlą formularz na czerwono wyświetlając stosowny komunikat błędu.
- Pojawił się całkowicie nowy interfejs weryfikacji pola: dedykowany przycisk czyszczący `X` oraz inteligentnie wyłączający się przycisk "Zapisz kod QR", uniemożliwiający zapis wadliwego lub całkowicie pustego kodu.
- Zaprojektowano od zera nową sekcję "Wybierz styl kodu QR". Zyskała ona kompaktowe, poziome karty stylów wraz z customowymi ikonami wektorowymi (SVG), które oddają wygląd wybranego układu kropek (Łagodne, Kropki, Kwadraty), w ten sposób podnosząc przejrzystość UX.

### Poprawione
- Usunięto niepotrzebny element nagłówka modala "Szkic zapisany", czyszcząc widok przed nowymi, ważniejszymi narzędziami.

## [0.9.0] - 2026-06-05
### Dodane
- **Architektura Dynamicznych Kodów QR:** Obrazki kodów QR teraz domyślnie zaszywają w sobie wygenerowany krótki link (np. `qrc-ai.com/Uxyz...`), a nie docelową zawartość. Zmiana ta gwarantuje, że przy edycji docelowego adresu URL, VCard, E-mail czy Telefonu sam fizyczny obrazek kodu nigdy się nie zmienia.
- Wyjątek dla typów `WiFi`: Kody WiFi generują się natywnie (statycznie), z odpowiednim pomarańczowym ostrzeżeniem w interfejsie informującym o zmianach układu kropek przy edycji.
- **Wygodne Kopiowanie Linków:** Wygenerowany krótki link na listach kodów QR otrzymał mechanizm "Kliknij by Skopiować", zapisujący zawartość do schowka i wyświetlający animowaną plakietkę "Skopiowano!".

### Poprawione
- Ulepszono pasek wskaźnika Skanowalności – wylicza teraz procenty proporcjonalnie od skrajnych wartości kontrastu (0-100%), odrzucając sztywne przedziały. Wdrożono nowy, dokładniejszy wygląd przypominający profesjonalne suwaki.
- Podgląd kodu QR w kreatorze został ujednolicony i precyzyjnie zaokrąglony. Renderuje plik SVG dostosowujący się w 100% do kontenera z zaokrąglonymi krawędziami. Zablokowano błąd traktowania koloru czarnego jako tła przezroczystego w obu widokach.
- Zablokowano irytujące autouzupełnianie haseł (autocomplete) w formularzach dodawania sieci WiFi.

## [0.8.0] - 2026-06-05
### Dodane
- **Pełny System Tagów:** Kompleksowe rozwiązanie do organizacji i kategoryzacji kodów. Tagi są powiązane z daną przestrzenią roboczą. Posiadają kolory, nazwy i pozwalają na potężne sortowanie na liście kodów. Dodano okna `TagManagerModal`, `TagEditModal` oraz `TagDeleteModal`.
- **Nowoczesny Próbnik Kolorów:** Zainstalowano lekką i stylową bibliotekę `react-colorful` zastępującą natywny próbnik Windows we wszystkich opcjach wyboru barw (`QRModal.jsx`).
- **Dynamiczna Skanowalność:** Oparta o algorytm kontrastu ocena, pokazująca na bieżąco, czy dobrany zestaw kolorów tła/kropek będzie czytelny dla aparatów. Pasek w czasie rzeczywistym odpowiada m.in. komunikatami "Słaba" lub "Doskonała" skanowalność.

### Zmienione
- Zoptymalizowano proces połączonych kroków 2 oraz 3 w kreatorze kodów QR (Krok wyboru typu i podania zawartości to teraz jeden spójny punkt).
- Formularz E-mail został mocno uproszczony, skupiając się włącznie na adresacie i tworząc zgrabny link docelowy bez zbędnego balastu tematu i treści.
- Link docelowy na liście kodów stał się o wiele bardziej przejrzysty: odrzucono niepotrzebny prefiks `mailto:`, ujednolicono estetykę ikony ze strzałką i podrasowano czcionkę na jaśniejszą.

### Poprawione
- Skompilowano pomyślnie brakujące struktury DOM (usunięto nadmiarowy tag zamykający), likwidując błędy rzutu JSX (`Unterminated regular expression`) i przywracając prawy panel przycisków na właściwe, dociągnięte w prawo miejsce w układzie kart `QRList.jsx`.
- Zniwelowano problem "wywieszania się" paska przewidywanej skanowalności dla poprawnych kolorów, wdrażając niezawodny parser wartości szesnastkowych HEX.

## [0.7.0] - 2026-06-05
### Dodane
- **Różne typy zawartości w QRModal:** System rozpoznaje teraz wiele typów kodów. Utworzono odrębne formularze dla: URL / Link, Wizytówki VCard, Sieci WIFI, E-maili i numerów Telefonów.
- **Rozbudowana paleta barw:** Dodano trzecią zmienną koloru (Kolor oczka), dzięki czemu kod pozwala odróżnić narożniki od reszty kropek.
- **System Archiwizacji:** Możliwość przenoszenia wybranych kodów do Archiwum wraz ze stworzonym widokiem `Zarchiwizowane` służącym ich przeglądaniu i przywracaniu.
- **Reset Analityki:** Implementacja funkcji wyzerowania liczników skanowań poszczególnego kodu (chroniona modalem bezpieczeństwa).
- **Zaawansowane menu QRList:** Dodanie rozwijanego menu w `QRList.jsx` sortującego elementy według daty lub skanów, oraz przycisku "Tagi" do grupowania w bliskiej przyszłości.

### Poprawione
- Poprawiono zawieszanie się okna `QRModal.jsx` podczas kliknięcia przycisku Zapisz (rozwiązano problem brakujących argumentów `initialData` i `mode`).
- Wyrównano wyszukiwarkę i narzędzia sortowania tak, aby na stałe były dostępne bez względu na liczbę kodów w systemie i rozciągały się na szerokość kontenera.
- Skrypt generatora dynamicznie dobiera typ narożników w oparciu o wybraną wizualną opcję główną.

## [0.6.0] - 2026-06-04
### Dodane
- **Tryby Okna Modalnego:** Okno `QRModal.jsx` potrafi teraz funkcjonować w trzech dedykowanych trybach: "Tworzenie", "Edycja", "Duplikacja", zachowując poprzedni wizualny stan kodów (kolory i układ punktów).
- Opcja wyświetlania pustego paska linku przy inicjalizacji "Tworzenia" w celu szybszego wklejania własnego adresu bez kasowania starych napisów.

### Poprawione
- Usunięcie sztywnych wartości z pól tekstowych i wdrożenie `useState` do ich aktualizacji w tle.
- Udoskonalenie zachowania menu ("trzy kropki") w `QRList.jsx`, w celu automatycznego zamykania po kliknięciu wybranej akcji lub w innym miejscu ekranu.
- Usunięcie przycisku "Pobierz" z rozwijanego menu (opcje te zostały zduplikowane na główny widok jako przyciski [PNG] / [SVG]).

## [0.5.0] - 2026-06-03
### Dodane
- Komponent `QRList.jsx` wdrożony, subskrybuje (`onSnapshot`) bazę po kodach i filtruje je na podstawie parametru `activeWorkspace`.
- Pobieranie kodów graficznych wektorowo jako SVG, albo w wysokiej rozdzielczości jako PNG przez dedykowane przyciski interfejsu.
- Statyczne zarysy wykresów Sparkline w kodach przy użyciu `react-chartjs-2`.

### Zmienione
- Optymalizacja ładowania danych Firestore dla szybszej inicjalizacji napisów przy wyświetlaniu obszarów przestrzeni roboczych (Workspace).

## [0.4.0] - 2026-06-02
### Dodane
- Nowy komponent `QRModal.jsx`, działający na warstwie absolutnej (Overlay).
- Implementacja potężnej biblioteki konfiguracyjnej `qr-code-styling` ładującej kody QR na elemencie Canvas w czasie rzeczywistym.
- Pierwsze kroki wizualnej edytowalności (kształt kropek, kwadratów, kolor).

## [0.3.0] - 2026-06-01
### Dodane
- **Workspaces (Przestrzenie robocze):** Wdrożono model rozdziału danych w bazie po parametrze `workspaceId`. Użytkownicy otrzymują domyślny obszar "Osobisty", z możliwością utworzenia nieskończonej liczby przestrzeni dla swoich "Zespołów".
- Użytkownicy logujący się po raz pierwszy otrzymują w Firebase automatycznie utworzoną personalną przestrzeń.
- Okno Modal dodawania nowego obszaru.

## [0.2.0] - 2026-05-31
### Dodane
- Główna struktura Layoutowa UI. Sidebar umieszczony na lewo, z opcjami nawigacyjnymi (Kody, Analityka, Domeny, API).
- Integracja interfejsu logowania w komponencie `Auth.jsx` (przejrzysty wygląd dostosowany do ciemnego motywu `bg-background`).

## [0.1.0] - 2026-05-30
### Dodane
- Wstępna Inicjalizacja projektu przy użyciu paczki Vite z szablonem React.
- Instalacja środowiska TailwindCSS w oparciu o niestandardowe zmienne koloru i ciemne motywy.
- Podłączenie bazowego rdzenia `firebase.js` łączącego Firebase SDK dla funkcji autoryzacyjnych.
- Podstawowa kontrola prywatnego dostępu (przekierowanie na stronę autoryzacji z głównej tablicy).

