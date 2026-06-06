# Changelog
Wszystkie najważniejsze zmiany w tym projekcie dokumentowane są w tym pliku.

Format pliku bazuje na standardzie [Keep a Changelog](https://keepachangelog.com/pl/1.0.0/), a wersjonowanie odpowiada standardowi [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

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
