# RateFlix

RateFlix är en mobilapp för filmintresserade. Man kan upptäcka filmer, söka efter titlar och bläddra bland genrer. Med ett konto kan man spara filmer man vill se, markera vad man har sett, välja favoriter, ge betyg (1–5 stjärnor) och skriva egna kommentarer om filmer man har sett.

Appen är byggd med **React Native och Expo** och pratar med två REST API:er: ett externt film-API (tmdb) för filminformation och ett eget backend-API för användare och användardata.

---

### Externt API: The Movie Database (TMDB)

Används för all filmdata, alltså trendande, populära, topprankade och kommande filmer, filmer som går på bio, detaljer med skådespelare, sökning, genrer och affischer. Anropen finns i [`services/externalApi.js`].

### Eget REST API: RateFlix-backend

Byggt med Spring Boot (Groovy), Spring Security med JWT och PostgreSQL. Anropen från appen finns i [`services/api.js`]. Alla endpoints utom `/api/auth/**` kräver en giltig token i headern `Authorization: Bearer <token>`. Backend kontrollerar också att användaren bara kan läsa och ändra sin egen data.

| Metod    | Endpoint                       | Beskrivning                                                       |
| -------- | ------------------------------ | ----------------------------------------------------------------- |
| `POST`   | `/api/auth/register`           | Skapa konto, returnerar token och användare                       |
| `POST`   | `/api/auth/login`              | Logga in, returnerar token och användare                          |
| `GET`    | `/api/users/me`                | Hämta inloggad användare (används när appen startar)              |
| `GET`    | `/api/library`                 | Hämta användarens watchlist, sedda filmer och favoriter           |
| `PATCH`  | `/api/library/{tmdbId}`        | Lägg till eller ta bort en film i watchlist, sett eller favoriter |
| `GET`    | `/api/ratings/{tmdbId}`        | Hämta användarens betyg för en film                               |
| `PUT`    | `/api/ratings/{tmdbId}`        | Sätt eller ändra betyg                                            |
| `DELETE` | `/api/ratings/{tmdbId}`        | Ta bort betyg                                                     |
| `GET`    | `/api/comments/movie/{tmdbId}` | Hämta användarens kommentarer för en film                         |
| `GET`    | `/api/comments/me`             | Hämta alla användarens kommentarer (visas på profilen)            |
| `POST`   | `/api/comments/movie/{tmdbId}` | Skapa kommentar                                                   |
| `PUT`    | `/api/comments/{commentId}`    | Redigera kommentar                                                |
| `DELETE` | `/api/comments/{commentId}`    | Ta bort kommentar                                                 |

---

## Viktigaste funktioner

- **Startsida** med en interaktiv "solfjäder" av veckans trendande filmer som hanterar svep och tryck och karuseller för populära, topprankade, kommande filmer och filmer som går på bio.
- **Sök** efter filmer på titel. Resultaten laddas löpande när man scrollar, och utan sökord visas filmer per genre.
- **Detaljvy** med handling, betyg från TMDB, år, längd, genrer och skådespelare.
- **Mitt bibliotek** med tre flikar: _Vill se_, _Sett_ och _Favoriter_.
- **Betyg** från 1 till 5 stjärnor. Trycker man på samma stjärna igen tas betyget bort.
- **Kommentarer** skapa, redigera, ta bort på filmer man har markerat som sedda. Alla kommentarer samlas också på profilsidan.
- **Återkoppling** med toast-meddelanden när man sparar uppdaterar, tar bort, loggar in och loggar ut. Laddningsindikatorer, felmeddelanden med "Försök igen" och tydliga tomma lägen finns i hela appen.
- **Skyddade funktioner:** en utloggad användare kan bläddra, söka och se detaljer. Försöker man spara, betygsätta eller kommentera skickas man till inloggningen och sedan tillbaka till samma film.

---

## Registrering och inloggning

Registrering och inloggning görs på profilfliken, där man kan växla mellan de två formulären.

1. Användaren fyller i namn som man bara gör vid regestrering, e-post och lösenord. Formuläret valideras direkt i appen med `react-hook-form` e-posten måste vara giltig och lösenordet minst 8 tecken.
2. Appen skickar `POST /api/auth/register` eller `POST /api/auth/login`.
3. Backend hashar lösenordet med BCrypt och svarar med en **JWT-token** som är giltig i 7 dagar.
4. Token sparas i **SecureStore** och skickas sedan med som `Authorization: Bearer <token>` i alla anrop till det egna API:t.
5. När appen startar läses token från SecureStore och kontrolleras med `GET /api/users/me`. Är den giltig är användaren fortfarande inloggad.
6. Vid **utloggning** eller om backend svarar `401` tas token bort från SecureStore och användaren loggas ut.

Misslyckas något får användaren ett begripligt meddelande, till exempel _"Fel e-post eller lösenord"_ eller _"Det finns redan ett konto med den e-postadressen"_.

Logiken finns i [`context/authContext.js`] och [`screens/ProfilePage.js`]

---

## Lokal lagring

| Data                                | Lagring          | Varför                                                                     |
| ----------------------------------- | ---------------- | -------------------------------------------------------------------------- |
| JWT-token                           | **SecureStore**  | Autentiseringsinformation ska lagras krypterat                             |
| Senast vald flik i _Mitt bibliotek_ | **AsyncStorage** | En vanlig preferens som inte behöver skyddas, finns kvar mellan appstarter |

Lösenord sparas aldrig lokalt. Biblioteket, betygen och kommentarerna sparas i backend, så de följer med användaren mellan enheter.

---

## Mobil- och device-funktioner

- **Share:** knappen _Dela film_ på detaljsidan öppnar telefonens delningsmeny.
- **Linking:** knappen _IMDb_ öppnar filmens sida på IMDb i webbläsaren eller IMDb-appen.
- **Haptics:** en kort vibration när man trycker på _Vill se_, _Favorit_ eller _Sett_.

---

## Installation

### 1. Backend

Backend ligger i mappen `Backend/`, bredvid frontend-projektet.

Databasen startas automatiskt via `compose.yaml` (Spring Boot Docker Compose) när backend startar, så Docker måste vara igång. Standardvärdena fungerar direkt för lokal utveckling.

### 2. Frontend

```bash
cd Frontend/my-expo-app
npm install
```

Skapa en `.env` och fyll i tmdb-token

```env
EXPO_PUBLIC_TMDB_TOKEN=tmdb-token
```

Man behöver bara ange backendens adress om den inte körs på samma dator som Expo:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.10:8080/api
```

Utan `EXPO_PUBLIC_API_URL` använder appen automatiskt IP-adressen till datorn som kör Expo, med port `8080`.

---

## Starta projektet

**1. Starta backend** startar PostgreSQL i Docker:

```bash
cd Backend
./gradlew.bat bootRun
```

API:t körs på `http://localhost:8080/api`.

**2. Starta appen:**

```bash
cd Frontend/my-expo-app
npx expo start
```

---

## Kända problem och begränsningar

- **Kommentarer är privata.** Varje användare ser bara sina egna kommentarer, och det finns inga publika recensioner mellan användare.
- **Bara filmer.** Sökningen och allt innehåll gäller filmer. TV-serier stöds inte.
- **Filminformationen är på engelska**, eftersom TMDB-anropen använder `en-US`, medan appens gränssnitt är på svenska.
- **"View all"-knapparna** under karusellerna på startsidan är inte implementerade än.
- **Inget sätt att återställa lösenord**, och inget sätt att ändra eller ta bort sitt konto i appen.
- **Ingen nätverksanslutning vid start.** Kan appen inte nå backend när den startar visas användaren som utloggad, även om token fortfarande finns sparad. Startar man om appen med anslutning är man inloggad igen.
- **Categories sida saknas** Hann inte implementera en hel kategori sida där man kan se t.ex. alla action filmer.
- **Har inte hunnit kommentera alla filer** Försökte vara noga med det i början men tiden sprang lite ifrån mig så fokuserade på annat istället.
- **Ojämna namn** Jag har råkat blandat gemener och versaler samt råkat blanda engelska och svenska på vissa ställen.
- **Categories knapp utan funktionalitet** Jag täntke haft flera categories-knappar ovanför solfjädern på hemskärmen. Tanken var att de skulle vara snabba sätt att komma till lite olika kategorier. Men det hanns inte med. Nu är det bara som en liten label för fjäderns kategori.
