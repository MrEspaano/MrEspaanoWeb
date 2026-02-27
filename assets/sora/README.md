## Sora Media Pipeline (Hub)

Den här mappen innehåller prompt-filer för Sora-genererade visual assets till hubben.

### Generera media

1. Sätt API-nyckel lokalt:
   `export OPENAI_API_KEY=...`
2. Kör generatorn från projektroten:
   `bash scripts/sora-generate-hub-media.sh`

Output hamnar i:
- `public/sora/*.webp` (thumbnails)
- `tmp/sora/*.json` (jobbmetadata)

### Prompt-filer

- `hero-glass-atrium.txt`
- `featured-crystal-grid.txt`
- `feed-depth-lightway.txt`
- `textreveal-soft-spectrum.txt`
