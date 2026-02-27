# BoardFlow

BoardFlow är en offline-first PWA för lärare: en snabb digital anslagstavla som ersätter post-it-lappar.

## Teknik

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Zustand (state)
- IndexedDB via `idb` med `localStorage`/minnes-fallback
- `@dnd-kit/core` för drag-and-drop
- Native service worker + web app manifest
- Vitest (unit tests för parser + storelogik)

## Funktioner (MVP)

- Snabb skapa lapp (`Ny lapp` + tangent `N`)
- Lokal snabbtolkning av text (utan extern AI/API-nycklar)
- Inline-edit med autospara
- Tre vyer: fri tavla, kolumner, klassvy
- Drag-and-drop mellan kolumner/fri tavla + dra till vecka (v1-v52)
- Filtrering och sök
- Lokala browser-notiser + inbyggd påminnelselista
- Arkivläge (återställ/radera)
- Export/import till JSON med ID-konflikthantering
- Mörkt/ljust/systemläge
- PWA/offline via service worker

## Kom igång lokalt

```bash
npm i
npm run dev
```

Öppna [http://localhost:3000](http://localhost:3000).

## Test och kvalitet

```bash
npm run test
npm run lint
npm run build
```

## GitHub: init och push

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <GITHUB_REPO_URL>
git push -u origin main
```

## Deploy på Vercel

1. Importera repot i Vercel.
2. Framework preset: `Next.js`.
3. Build command: `next build`.
4. Output: default.
5. Inga environment variables behövs.

## Driftnoteringar

- v1 använder ingen backend/databas.
- All data lagras lokalt i webbläsaren.
- Inga externa AI-tjänster används.
- PWA/service worker fungerar i production (t.ex. på Vercel över HTTPS).
