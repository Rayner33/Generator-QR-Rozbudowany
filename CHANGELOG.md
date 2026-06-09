# Changelog

## [0.17.0] - 2026-06-09
### Dodane
- **Globalna Aktualizacja Interfejsu (UI/UX):** Zbudowano jednolity, spĂłjny system kolorystyczny w caĹ‚ej aplikacji. PomaraĹ„czowy (#f97316) dla ustawieĹ„ zespoĹ‚Ăłw, Niebieski (#1ea2e4) dla ModuĹ‚u KodĂłw QR oraz Fioletowy (#8b5cf6) dla Smart LinkĂłw.
- Zmodyfikowano zachowanie animacji "magic hover" oraz obrysĂłw formularzy (focus rings), aby zintegrowaÄ‡ siÄ™ z nowym schematem kolorystycznym.
- Wprowadzono "MaskÄ™ GradientowÄ…" na gĹ‚Ăłwnym panelu Analityki, dziÄ™ki ktĂłrej statystyki (np. Kody QR, UrzÄ…dzenia, PaĹ„stwa) pĹ‚ynnie znikajÄ… (fade-out) na dolnej krawÄ™dzi okna, tworzÄ…c wizualny efekt gĹ‚Ä™bi (CSS Masking).

### Poprawione
- **Analityka:** WdroĹĽono inteligentne renderowanie przycisku "Zobacz wszystko" na gĹ‚Ăłwnej liĹ›cie analityki â€“ widoczny jest tylko wtedy, gdy liczba pozycji na liĹ›cie przekracza 7 elementĂłw.
- Wyeliminowano bĹ‚Ä™dny routing filtrĂłw w Analityce. Opcja "Smart Linki" w menu gĹ‚Ăłwnych filtrĂłw (dropdown) wysyĹ‚a juĹĽ prawidĹ‚owÄ… wartoĹ›Ä‡ `smartlink` zamiast `links`, poprawiajÄ…c awariÄ™ braku zaĹ‚adowania odpowiednich danych.
- Zmniejszono paddingi statystyk w moduĹ‚ach analityki, wprowadzajÄ…c cienkie poziome paski Ĺ‚adowania (Progress bars), ktĂłre dynamicznie pokrywajÄ… tĹ‚o kaĹĽdego elementu wzglÄ™dem jego popularnoĹ›ci.
- System dynamicznie odcina uĹ‚amki dziesiÄ™tne z wynikĂłw procentowych w przypadku osiÄ…gniÄ™cia 100%, oszczÄ™dzajÄ…c przestrzeĹ„ interfejsu.
- Poprawiono kolory w modalu "Zaproszenie czĹ‚onka zespoĹ‚u" i "Nowy zespĂłĹ‚", tak aby formularze podĹ›wietlaĹ‚y siÄ™ spĂłjnym pomaraĹ„czem.
## [0.7.0] - 2026-06-08
### Dodane
- **Panel Analityki (Analytics.jsx):** Utworzenie głownego widoku analityki ze spersonalizowanymi statystykami. Wykorzystanie biblioteki chart.js do interaktywnego głównego wykresu.
- Zaimplementowano ujednolicony modal 'Zobacz wszystko' w panelu Analityki ze wsparciem dla wyszukiwania i dostosowanym schematem kolorów (niebieski dla kodów QR, fioletowy dla Smart Linków).

### Poprawione
- **Optymalizacja wydajności:** Wdrożono opóźnienie wyciągania (renderowania) dużych list QR kodów i Smart Linków (setTimeout), co wyeliminowało zacięcia podczas odtwarzania animacji nawigacyjnej w menu bocznym.
- **Ujednolicenie wizualne:** Zsynchronizowano kolorystykę przycisków analityki oraz mini-wykresów (sparklines) w listach QRList.jsx i SmartLinksList.jsx do obowiązującego schematu Analytics (odpowiednio #1ea2e4 i #8b5cf6).

Wszystkie najwaĹĽniejsze zmiany w tym projekcie dokumentowane sÄ… w tym pliku.

Format pliku bazuje na standardzie [Keep a Changelog](https://keepachangelog.com/pl/1.0.0/), a wersjonowanie odpowiada standardowi [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.16.0] - 2026-06-08
### Dodane
- **Globalne Animacje i Magic Hover:** Wprowadzono scentralizowany system animacji oparty o bibliotekÄ™ `framer-motion` (`src/utils/animations.js`). Aplikacja korzysta teraz ze spĂłjnego efektu powiÄ™kszania i rozjaĹ›niania (fade & scale) przy otwieraniu wszelkich okienek typu dropdown (wybĂłr Workspace, lista tagĂłw, menu filtrĂłw i menu akcji). Dodano rĂłwnieĹĽ "magiczny", przesuwajÄ…cy siÄ™ efekt tĹ‚a przy najechaniu na kafelki gĹ‚Ăłwnych zakĹ‚adek.
- **Wizualna unifikacja:** Przyciski z filtrami ("Tagi", "Ostatnio utworzone") zyskaĹ‚y odĹ›wieĹĽony styl podĹ›wietlajÄ…cy obramowania, a modale zyskaĹ‚y identyczny styl okrÄ…gĹ‚ego biaĹ‚ego przycisku zamkniÄ™cia, porzÄ…dkujÄ…c design systemu.

### Poprawione
- **Filtrowanie ZaproszeĹ„:** Okno zapraszania czĹ‚onkĂłw do zespoĹ‚u (`InviteMemberModal`) inteligentnie ignoruje teraz wĹ‚asny e-mail uĹĽytkownika podczas autouzupeĹ‚niania â€“ zapobiegajÄ…c wysĹ‚aniu bezcelowego zaproszenia do samego siebie.
- **Optymalizacja DOM:** RozwiÄ…zano problemy z cyklem ĹĽycia okien z uĹĽyciem tagu `<AnimatePresence>` w React, dziÄ™ki czemu animacje zamkniÄ™cia poszczegĂłlnych okien menu akcji odgrywajÄ… siÄ™ w poprawny i naturalny sposĂłb.

## [0.15.0] - 2026-06-07
### Dodane
- **Silnik PrzekierowaĹ„ (Redirect Engine):** Niewidzialny, bĹ‚yskawiczny moduĹ‚ uruchamiajÄ…cy siÄ™ przy wejĹ›ciu na krĂłtki odnoĹ›nik (np. `/:shortId`). Otwiera i zlicza klikniÄ™cia w peĹ‚ni asynchronicznie za pomocÄ… `runTransaction` w Firebase, kierujÄ…c uĹĽytkownika koĹ„cowego bezpoĹ›rednio na oryginalny URL.
- **Granularne Uprawnienia ZespoĹ‚u:** Nowa zakĹ‚adka "Uprawnienia" w module `WorkspaceSettings`. WĹ‚aĹ›ciciele ZespoĹ‚Ăłw otrzymali moĹĽliwoĹ›Ä‡ odbierania nowo dodanym czĹ‚onkom zespoĹ‚u praw do: *Edycji*, *Archiwizacji* i *Resetowania Analityki* kodĂłw naleĹĽÄ…cych do innej osoby. Odpowiednio wdroĹĽono zaktualizowane `firestore.rules`.

### Zmienione
- **Enterprise SSO:** UsuniÄ™to klasyczne formularze E-mail/HasĹ‚o oraz system "PrĂłĹ›b o dostÄ™p". PrzeksztaĹ‚cono aplikacjÄ™ na w peĹ‚ni zamkniÄ™ty ekosystem oparty o Single Sign-On (Google Login) weryfikujÄ…cy koĹ„cĂłwki domen.
- Zabezpieczenie przed atakami Brute-Force oraz odciÄ…ĹĽenie zarzÄ…dzania (osoba wyrzucona z grupy firmowej automatycznie traci dostÄ™p do bazy).
- **Branding:** Ujednolicono system ikon, uĹĽywajÄ…c ikony kodu QR z pakietu `lucide-react` w roli nowego, dynamicznego i skalowalnego logo platformy (`Sidebar.jsx`, `Login.jsx`).

### Poprawione
- **Redirect Optimization:** Przebudowano warstwÄ™ nawigacji tak, by logowanie przez panel Google SSO oraz akceptacja zaproszenia zawsze kierowaĹ‚a uĹĽytkownikĂłw bezpoĹ›rednio do listy najnowszych kodĂłw QR (`/`), zamiast do ustawieĹ„ konta.
- Skrupulatnie zablokowano i wyszarzono ikonÄ™ oĹ‚Ăłwka edycji w panelu wizytĂłwki kodu, dajÄ…c gwarancjÄ™ wizualnego uniemoĹĽliwienia naruszenia cudzego projektu (Security UX).

## [0.14.0] - 2026-06-07
### Dodane
- **Smart Linki (Inteligentne OdnoĹ›niki):** Wprowadzono caĹ‚kowicie nowy moduĹ‚ aplikacji dziaĹ‚ajÄ…cy rĂłwnolegle do KodĂłw QR. Oferuje on odrÄ™bnÄ… listÄ™ `SmartLinksList` wraz z innowacyjnym systemem pobierania ikonek (favicons) z adresĂłw docelowych w celach podglÄ…du.
- Stworzono uproszczony kreator `SmartLinkModal.jsx`, pozwalajÄ…cy uĹĽytkownikom na bĹ‚yskawiczne zakĹ‚adanie krĂłtkich linkĂłw bez koniecznoĹ›ci dostosowywania grafik.
- **OdĹ›wieĹĽony MenadĹĽer TagĂłw:** System przypisywania tagĂłw otrzymaĹ‚ przepiÄ™kny, w peĹ‚ni reaktywny interfejs oparty na pĂłĹ‚przezroczystym "szkle" (Glassmorphism). Modale moĹĽna teraz wyĹ‚Ä…czaÄ‡ intuicyjnym klikniÄ™ciem poza ich obszarem (backdrop click) - funkcja ta powÄ™drowaĹ‚a zresztÄ… rĂłwnieĹĽ do pozostaĹ‚ych okien dialogowych.

### Poprawione
- RozwiÄ…zano problem "martwego stanu" (stale state) okienek zarzÄ…dzania tagami. Obecnie kaĹĽdy modal subskrybuje z bazy `Firestore` najĹ›wieĹĽsze dane, co umoĹĽliwia przypinanie i odpinanie tagĂłw caĹ‚kowicie w locie, w czasie rzeczywistym, bez zamykania panelu.
- UspĂłjniono architekturÄ™ przyciskĂłw rozciÄ…gajÄ…cych element i ulepszono dropdown z filtrami - zyskaĹ‚ on nowy system ikonek `Radio` naĹ›ladujÄ…cych gĹ‚Ăłwny kolor taga. W ten sposĂłb zniwelowano efekt przeciÄ…ĹĽenia interfejsu.

## [0.13.0] - 2026-06-07
### Dodane
- **Short link w kreatorze:** Dodano panel "Short link" jako pierwszy krok w oknie tworzenia kodu QR. Generuje on automatycznie unikalny, 5-znakowy identyfikator i w locie weryfikuje jego dostÄ™pnoĹ›Ä‡ w bazie danych (zapobiegajÄ…c konfliktom). W trybie edycji krĂłtki link jest zablokowany, chroniÄ…c integralnoĹ›Ä‡ danych.
- **Interaktywne Statystyki KodĂłw QR:** Przebudowano statyczny licznik skanowaĹ„ na liĹ›cie kodĂłw, zamieniajÄ…c go w dynamiczny, interaktywny przycisk ("PokaĹĽ wiÄ™cej") prowadzÄ…cy docelowo do zakĹ‚adki Analityki. WdroĹĽono filtry graficzne CSS i efekty "glow".

### Zmienione
- **Rzeczywisty PodglÄ…d na liĹ›cie:** Zrezygnowano ze sztucznej ikony w widoku listy `QRList.jsx`. Aplikacja renderuje w locie prawdziwe, w peĹ‚ni ostylowane wektory kodĂłw QR w wysokiej bazowej rozdzielczoĹ›ci (1000x1000 px), skutecznie eliminujÄ…c matematyczne odchyĹ‚ki marginesĂłw biblioteki generatora.
- **OdnoĹ›niki zewnÄ™trzne:** Udoskonalono obsĹ‚ugÄ™ klikalnych linkĂłw pod kodem â€“ system automatycznie dokleja prefiks `https://` do linkĂłw bez protokoĹ‚u HTTP, co zapobiega traktowaniu ich jako adresĂłw podrzÄ™dnych wzglÄ™dem uruchomionej strony.
- **Wizualne Tweaki:** Skompresowano sztuczne paddingi na listach kodĂłw, uzyskujÄ…c czystszy, bardziej dopasowany ukĹ‚ad.

## [0.12.0] - 2026-06-06
### Dodane
- **PeĹ‚en Ekosystem Pracy ZespoĹ‚owej (ZespoĹ‚y & ZarzÄ…dzanie):** WdroĹĽono caĹ‚kowicie nowy, dedykowany panel UstawieĹ„ ZespoĹ‚u (`WorkspaceSettings`). WĹ‚aĹ›ciciel zespoĹ‚u ma prawo do zmiany nazwy, gradientu lub usuniÄ™cia caĹ‚ego zasobu, a pozostali CzĹ‚onkowie mogÄ… go jedynie opuĹ›ciÄ‡.
- **Powiadomienia i Odbieranie ZaproszeĹ„:** Zaproszeni uĹĽytkownicy otrzymujÄ… dyskretne Powiadomienia bez przeĹ‚adowywania strony. OdbiĂłr powiadomienia objawia siÄ™ Ĺ›wiecÄ…cym dzwonkiem w nawigacji oraz wbudowanym Modalem w ktĂłrym, poprzez zatwierdzenie, uĹĽytkownik zostaje dynamicznie dodany do listy uczestnikĂłw zespoĹ‚u.
- **Live Search w Zaproszeniach:** Implementacja inteligentnego Modala wyszukiwania wspierajÄ…cego Live Search. Baza rejestruje od teraz logowania i buduje sieÄ‡ `users` globalnie, umoĹĽliwiajÄ…c autouzupeĹ‚nianie siÄ™ wynikĂłw wewnÄ…trz formularza zaproszeĹ„ na podstawie pierwszych wpisywanych znakĂłw e-maila. Synchronizowane sÄ… takĹĽe wybrane kolory i unikalne nazwy osobiste.

## [0.11.0] - 2026-06-06
### Zmienione
- **Refaktoryzacja Architektury:** PrzejĹ›cie z prostego przeĹ‚Ä…czania widokĂłw (stan activeView) na peĹ‚ny system routingu z wykorzystaniem biblioteki `react-router-dom`. Gwarantuje to stabilne przeĹ‚Ä…czanie miÄ™dzy kartami i zapamiÄ™tywanie historii URL.
- **Struktura PlikĂłw:** Usystematyzowano drzewo projektu â€“ gĹ‚Ăłwne podstrony (Account, Analytics, QRList) przeniesiono do nowego folderu `pages/`, a logikÄ™ zapytaĹ„ o zespoĹ‚y przeniesiono do reuĹĽywalnego Custom Hooka `useWorkspaces.js` do folderu `hooks/`.

## [0.10.0] - 2026-06-06
### Dodane
- **Wgrywanie LogotypĂłw (Base64):** Zaimplementowano nowÄ… sekcjÄ™ (Krok 5) umoĹĽliwiajÄ…cÄ… wrzucenie wĹ‚asnego logo do kodu QR (obsĹ‚uga formatĂłw JPG, PNG, SVG). RozwiÄ…zano problem skomplikowanego hostingu plikĂłw poprzez inteligentnÄ… konwersjÄ™ logotypu do Base64 "w locie" i bezstratne zapisanie go w Firestore jako tekst. 
- **Dynamiczna walidacja formularzy w locie:** System rozpoznaje bĹ‚Ä™dnie wpisywane dane juĹĽ w trakcie pisania. Niepoprawny adres E-mail, format numeru telefonu czy bĹ‚Ä™dny link natychmiast podĹ›wietlÄ… formularz na czerwono wyĹ›wietlajÄ…c stosowny komunikat bĹ‚Ä™du.
- PojawiĹ‚ siÄ™ caĹ‚kowicie nowy interfejs weryfikacji pola: dedykowany przycisk czyszczÄ…cy `X` oraz inteligentnie wyĹ‚Ä…czajÄ…cy siÄ™ przycisk "Zapisz kod QR", uniemoĹĽliwiajÄ…cy zapis wadliwego lub caĹ‚kowicie pustego kodu.
- Zaprojektowano od zera nowÄ… sekcjÄ™ "Wybierz styl kodu QR". ZyskaĹ‚a ona kompaktowe, poziome karty stylĂłw wraz z customowymi ikonami wektorowymi (SVG), ktĂłre oddajÄ… wyglÄ…d wybranego ukĹ‚adu kropek (Ĺagodne, Kropki, Kwadraty), w ten sposĂłb podnoszÄ…c przejrzystoĹ›Ä‡ UX.

### Poprawione
- UsuniÄ™to niepotrzebny element nagĹ‚Ăłwka modala "Szkic zapisany", czyszczÄ…c widok przed nowymi, waĹĽniejszymi narzÄ™dziami.

## [0.9.0] - 2026-06-05
### Dodane
- **Architektura Dynamicznych KodĂłw QR:** Obrazki kodĂłw QR teraz domyĹ›lnie zaszywajÄ… w sobie wygenerowany krĂłtki link (np. `qrc-ai.com/Uxyz...`), a nie docelowÄ… zawartoĹ›Ä‡. Zmiana ta gwarantuje, ĹĽe przy edycji docelowego adresu URL, VCard, E-mail czy Telefonu sam fizyczny obrazek kodu nigdy siÄ™ nie zmienia.
- WyjÄ…tek dla typĂłw `WiFi`: Kody WiFi generujÄ… siÄ™ natywnie (statycznie), z odpowiednim pomaraĹ„czowym ostrzeĹĽeniem w interfejsie informujÄ…cym o zmianach ukĹ‚adu kropek przy edycji.
- **Wygodne Kopiowanie LinkĂłw:** Wygenerowany krĂłtki link na listach kodĂłw QR otrzymaĹ‚ mechanizm "Kliknij by SkopiowaÄ‡", zapisujÄ…cy zawartoĹ›Ä‡ do schowka i wyĹ›wietlajÄ…cy animowanÄ… plakietkÄ™ "Skopiowano!".

### Poprawione
- Ulepszono pasek wskaĹşnika SkanowalnoĹ›ci â€“ wylicza teraz procenty proporcjonalnie od skrajnych wartoĹ›ci kontrastu (0-100%), odrzucajÄ…c sztywne przedziaĹ‚y. WdroĹĽono nowy, dokĹ‚adniejszy wyglÄ…d przypominajÄ…cy profesjonalne suwaki.
- PodglÄ…d kodu QR w kreatorze zostaĹ‚ ujednolicony i precyzyjnie zaokrÄ…glony. Renderuje plik SVG dostosowujÄ…cy siÄ™ w 100% do kontenera z zaokrÄ…glonymi krawÄ™dziami. Zablokowano bĹ‚Ä…d traktowania koloru czarnego jako tĹ‚a przezroczystego w obu widokach.
- Zablokowano irytujÄ…ce autouzupeĹ‚nianie haseĹ‚ (autocomplete) w formularzach dodawania sieci WiFi.

## [0.8.0] - 2026-06-05
### Dodane
- **PeĹ‚ny System TagĂłw:** Kompleksowe rozwiÄ…zanie do organizacji i kategoryzacji kodĂłw. Tagi sÄ… powiÄ…zane z danÄ… przestrzeniÄ… roboczÄ…. PosiadajÄ… kolory, nazwy i pozwalajÄ… na potÄ™ĹĽne sortowanie na liĹ›cie kodĂłw. Dodano okna `TagManagerModal`, `TagEditModal` oraz `TagDeleteModal`.
- **Nowoczesny PrĂłbnik KolorĂłw:** Zainstalowano lekkÄ… i stylowÄ… bibliotekÄ™ `react-colorful` zastÄ™pujÄ…cÄ… natywny prĂłbnik Windows we wszystkich opcjach wyboru barw (`QRModal.jsx`).
- **Dynamiczna SkanowalnoĹ›Ä‡:** Oparta o algorytm kontrastu ocena, pokazujÄ…ca na bieĹĽÄ…co, czy dobrany zestaw kolorĂłw tĹ‚a/kropek bÄ™dzie czytelny dla aparatĂłw. Pasek w czasie rzeczywistym odpowiada m.in. komunikatami "SĹ‚aba" lub "DoskonaĹ‚a" skanowalnoĹ›Ä‡.

### Zmienione
- Zoptymalizowano proces poĹ‚Ä…czonych krokĂłw 2 oraz 3 w kreatorze kodĂłw QR (Krok wyboru typu i podania zawartoĹ›ci to teraz jeden spĂłjny punkt).
- Formularz E-mail zostaĹ‚ mocno uproszczony, skupiajÄ…c siÄ™ wĹ‚Ä…cznie na adresacie i tworzÄ…c zgrabny link docelowy bez zbÄ™dnego balastu tematu i treĹ›ci.
- Link docelowy na liĹ›cie kodĂłw staĹ‚ siÄ™ o wiele bardziej przejrzysty: odrzucono niepotrzebny prefiks `mailto:`, ujednolicono estetykÄ™ ikony ze strzaĹ‚kÄ… i podrasowano czcionkÄ™ na jaĹ›niejszÄ….

### Poprawione
- Skompilowano pomyĹ›lnie brakujÄ…ce struktury DOM (usuniÄ™to nadmiarowy tag zamykajÄ…cy), likwidujÄ…c bĹ‚Ä™dy rzutu JSX (`Unterminated regular expression`) i przywracajÄ…c prawy panel przyciskĂłw na wĹ‚aĹ›ciwe, dociÄ…gniÄ™te w prawo miejsce w ukĹ‚adzie kart `QRList.jsx`.
- Zniwelowano problem "wywieszania siÄ™" paska przewidywanej skanowalnoĹ›ci dla poprawnych kolorĂłw, wdraĹĽajÄ…c niezawodny parser wartoĹ›ci szesnastkowych HEX.

## [0.7.0] - 2026-06-05
### Dodane
- **RĂłĹĽne typy zawartoĹ›ci w QRModal:** System rozpoznaje teraz wiele typĂłw kodĂłw. Utworzono odrÄ™bne formularze dla: URL / Link, WizytĂłwki VCard, Sieci WIFI, E-maili i numerĂłw TelefonĂłw.
- **Rozbudowana paleta barw:** Dodano trzeciÄ… zmiennÄ… koloru (Kolor oczka), dziÄ™ki czemu kod pozwala odrĂłĹĽniÄ‡ naroĹĽniki od reszty kropek.
- **System Archiwizacji:** MoĹĽliwoĹ›Ä‡ przenoszenia wybranych kodĂłw do Archiwum wraz ze stworzonym widokiem `Zarchiwizowane` sĹ‚uĹĽÄ…cym ich przeglÄ…daniu i przywracaniu.
- **Reset Analityki:** Implementacja funkcji wyzerowania licznikĂłw skanowaĹ„ poszczegĂłlnego kodu (chroniona modalem bezpieczeĹ„stwa).
- **Zaawansowane menu QRList:** Dodanie rozwijanego menu w `QRList.jsx` sortujÄ…cego elementy wedĹ‚ug daty lub skanĂłw, oraz przycisku "Tagi" do grupowania w bliskiej przyszĹ‚oĹ›ci.

### Poprawione
- Poprawiono zawieszanie siÄ™ okna `QRModal.jsx` podczas klikniÄ™cia przycisku Zapisz (rozwiÄ…zano problem brakujÄ…cych argumentĂłw `initialData` i `mode`).
- WyrĂłwnano wyszukiwarkÄ™ i narzÄ™dzia sortowania tak, aby na staĹ‚e byĹ‚y dostÄ™pne bez wzglÄ™du na liczbÄ™ kodĂłw w systemie i rozciÄ…gaĹ‚y siÄ™ na szerokoĹ›Ä‡ kontenera.
- Skrypt generatora dynamicznie dobiera typ naroĹĽnikĂłw w oparciu o wybranÄ… wizualnÄ… opcjÄ™ gĹ‚ĂłwnÄ….

## [0.6.0] - 2026-06-04
### Dodane
- **Tryby Okna Modalnego:** Okno `QRModal.jsx` potrafi teraz funkcjonowaÄ‡ w trzech dedykowanych trybach: "Tworzenie", "Edycja", "Duplikacja", zachowujÄ…c poprzedni wizualny stan kodĂłw (kolory i ukĹ‚ad punktĂłw).
- Opcja wyĹ›wietlania pustego paska linku przy inicjalizacji "Tworzenia" w celu szybszego wklejania wĹ‚asnego adresu bez kasowania starych napisĂłw.

### Poprawione
- UsuniÄ™cie sztywnych wartoĹ›ci z pĂłl tekstowych i wdroĹĽenie `useState` do ich aktualizacji w tle.
- Udoskonalenie zachowania menu ("trzy kropki") w `QRList.jsx`, w celu automatycznego zamykania po klikniÄ™ciu wybranej akcji lub w innym miejscu ekranu.
- UsuniÄ™cie przycisku "Pobierz" z rozwijanego menu (opcje te zostaĹ‚y zduplikowane na gĹ‚Ăłwny widok jako przyciski [PNG] / [SVG]).

## [0.5.0] - 2026-06-03
### Dodane
- Komponent `QRList.jsx` wdroĹĽony, subskrybuje (`onSnapshot`) bazÄ™ po kodach i filtruje je na podstawie parametru `activeWorkspace`.
- Pobieranie kodĂłw graficznych wektorowo jako SVG, albo w wysokiej rozdzielczoĹ›ci jako PNG przez dedykowane przyciski interfejsu.
- Statyczne zarysy wykresĂłw Sparkline w kodach przy uĹĽyciu `react-chartjs-2`.

### Zmienione
- Optymalizacja Ĺ‚adowania danych Firestore dla szybszej inicjalizacji napisĂłw przy wyĹ›wietlaniu obszarĂłw przestrzeni roboczych (Workspace).

## [0.4.0] - 2026-06-02
### Dodane
- Nowy komponent `QRModal.jsx`, dziaĹ‚ajÄ…cy na warstwie absolutnej (Overlay).
- Implementacja potÄ™ĹĽnej biblioteki konfiguracyjnej `qr-code-styling` Ĺ‚adujÄ…cej kody QR na elemencie Canvas w czasie rzeczywistym.
- Pierwsze kroki wizualnej edytowalnoĹ›ci (ksztaĹ‚t kropek, kwadratĂłw, kolor).

## [0.3.0] - 2026-06-01
### Dodane
- **Workspaces (Przestrzenie robocze):** WdroĹĽono model rozdziaĹ‚u danych w bazie po parametrze `workspaceId`. UĹĽytkownicy otrzymujÄ… domyĹ›lny obszar "Osobisty", z moĹĽliwoĹ›ciÄ… utworzenia nieskoĹ„czonej liczby przestrzeni dla swoich "ZespoĹ‚Ăłw".
- UĹĽytkownicy logujÄ…cy siÄ™ po raz pierwszy otrzymujÄ… w Firebase automatycznie utworzonÄ… personalnÄ… przestrzeĹ„.
- Okno Modal dodawania nowego obszaru.

## [0.2.0] - 2026-05-31
### Dodane
- GĹ‚Ăłwna struktura Layoutowa UI. Sidebar umieszczony na lewo, z opcjami nawigacyjnymi (Kody, Analityka, Domeny, API).
- Integracja interfejsu logowania w komponencie `Auth.jsx` (przejrzysty wyglÄ…d dostosowany do ciemnego motywu `bg-background`).

## [0.1.0] - 2026-05-30
### Dodane
- WstÄ™pna Inicjalizacja projektu przy uĹĽyciu paczki Vite z szablonem React.
- Instalacja Ĺ›rodowiska TailwindCSS w oparciu o niestandardowe zmienne koloru i ciemne motywy.
- PodĹ‚Ä…czenie bazowego rdzenia `firebase.js` Ĺ‚Ä…czÄ…cego Firebase SDK dla funkcji autoryzacyjnych.
- Podstawowa kontrola prywatnego dostÄ™pu (przekierowanie na stronÄ™ autoryzacji z gĹ‚Ăłwnej tablicy).

