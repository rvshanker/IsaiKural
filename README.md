# திருக்குறள் — Thirukkural Digital Treasury

All 1,330 Kurals with commentaries and the இசையில் திருக்குறள் videos.
This is a **static site**: no server, no API keys, nothing to pay per visitor.

## Run on your computer

```bash
npm install
npm run dev        # http://localhost:3000  (video editor is available here)
npm run build      # creates the dist/ folder that gets published
npm run preview    # check the built site at http://localhost:4173
```

## Adding a video

1. Run `npm run dev`. The **காணொளி சேர்க்க** (add video) button appears only on your own computer.
2. Add the YouTube link, then click **kuralMedia.ts-க்கு நகலெடு** to copy the lines.
3. Paste them inside `KURAL_MEDIA` in `src/data/kuralMedia.ts`, commit, and push.
   The live site updates on the next deploy.

(Or just add a line to `src/data/kuralMedia.ts` by hand.)

## Adding the recitation audio (later)

1. Put one MP3 per Kural in `public/audio/`, named `0001.mp3` … `1330.mp3`
   (mono, 64 kbps keeps the total around 150 MB).
2. In `src/config.ts` set `AUDIO_ENABLED = true`.

## Deploy to Cloudflare Pages (free, unlimited bandwidth)

1. Push this folder to a GitHub repository.
2. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git** → pick the repo.
3. Build settings:
   - Framework preset: **Vite** (or None)
   - Build command: `npm run build`
   - Build output directory: `dist`
4. **Save and Deploy**. You get a `*.pages.dev` link; add your own domain under **Custom domains**.

Every `git push` redeploys automatically.
