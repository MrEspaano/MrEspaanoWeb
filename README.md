# MrEspaano Hub

Hypermodern personlig hubb byggd med Next.js App Router, TypeScript, Tailwind CSS, Framer Motion, Lenis och Supabase.

## Funktioner

- Publik premium-hubb med scroll-driven animationer
- Hero moments:
  - Sticky Category Morph
  - Project Feed Snap + Progress
  - Shared layout detail transition (modal + full route)
- Filter, sök och sort för projekt-feed
- Adminyta med Supabase Auth (email/password)
- CRUD för projekt + media-upload till Supabase Storage
- Redigering av site settings i admin
- RLS policies för säkra writes
- Seeddata med 12 projekt

## Tech stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Framer Motion
- Lenis smooth scroll
- Supabase (Auth + Postgres + Storage)
- React Hook Form + Zod

## Lokalt: körning

1. Installera dependencies:

```bash
npm install
```

2. Skapa `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

3. Starta appen:

```bash
npm run dev
```

Öppna [http://localhost:3000](http://localhost:3000).

## Supabase setup

### 1) Skapa projekt i Supabase

- Skapa ett nytt Supabase-projekt i dashboard.
- Kopiera `Project URL` och `anon public key` till `.env.local`.

### 2) Kör schema SQL

Kör innehållet i:

- `supabase/schema.sql`

Det skapar:

- Enums: `project_category`, `project_status`
- Tabeller: `projects`, `site_settings`, `profiles`
- Trigger för `updated_at`
- Funktion `is_admin(uuid)`
- RLS + policies
- Bucket `project-media` + storage policies

### 3) Kör seed SQL

Kör innehållet i:

- `supabase/seed.sql`

Det lägger in:

- 12 projekt (blandade kategorier och status)
- default data i `site_settings`

## Sätt dig själv som admin

1. Skapa användare i Supabase Auth (Dashboard > Authentication > Users).
2. Hämta user-id (`id`) från `auth.users`.
3. Kör SQL:

```sql
insert into public.profiles (id, is_admin)
values ('DIN-USER-UUID-HÄR', true)
on conflict (id)
do update set is_admin = true;
```

Efter detta kan du logga in på `/admin`.

## Storage-struktur

Bucket: `project-media` (private)

- `project-covers/{projectId}/{filename}`
- `project-gallery/{projectId}/{filename}`

Publik vy använder signed URLs via server.

## Routes

- `/` - Hero + category morph + featured + story feed
- `/projects` - Full feed med filter/sök/sort + modal detail
- `/projects/[slug]` - Full detaljroute
- `/admin` - Login
- `/admin/projects` - CRUD + upload
- `/admin/settings` - Site settings

## RLS sammanfattning

- Public read:
  - `projects`: `select using (true)`
  - `site_settings`: `select using (true)`
- Admin write (`insert/update/delete`):
  - Kräver `profiles.is_admin = true` via `public.is_admin(auth.uid())`
- Profiles:
  - User kan läsa egen profil
  - Admin kan läsa/uppdatera profiler

## Deploy till Vercel

1. Pusha repo till GitHub.
2. Importera repo i Vercel.
3. Sätt env vars i Vercel (Production + Preview):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. Deploy.
5. Verifiera:

- `/` laddar projekt
- `/projects` filter/sök/sort fungerar
- `/admin` login + CRUD fungerar

## GitHub push (exempel)

```bash
git init
git add .
git commit -m "feat: hypermodern personal hub with supabase admin"
git branch -M main
git remote add origin git@github.com:<username>/<repo>.git
git push -u origin main
```

## Miljövariabler

Se `.env.example`.

## Sora media (premium visuals)

Du kan generera extra premium-bilder till hubben via Sora-skillen (thumbnails från videojobb):

1. Sätt API-nyckel lokalt:

```bash
export OPENAI_API_KEY=...
```

2. Kör generatorn:

```bash
bash scripts/sora-generate-hub-media.sh
```

3. Resultat sparas i:

- `public/sora/*.webp`
- `tmp/sora/*.json`

Om `public/sora/hero-glass-atrium.webp` finns används den automatiskt i hero-ytan.

## Kvalitetscheck

```bash
npm run lint
npm run typecheck
```

> Om du saknar env-vars kommer appen visa en setup-notis i UI.
