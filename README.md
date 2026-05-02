<p align="center">
    <img src="/docs/logo.png" width="220" alt="Movieace">
</p>

<p align="center">
    <em>An editorial-feeling streaming UI for movies, TV, and the people who make them — built on TMDB.</em>
</p>

<p align="center">
    <a href="#license"><img alt="License" src="https://img.shields.io/badge/license-MIT-blue.svg"></a>
    <img alt="Vue 3" src="https://img.shields.io/badge/Vue-3.5-42b883?logo=vue.js&logoColor=white">
    <img alt="Vite" src="https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white">
    <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white">
    <img alt="SCSS" src="https://img.shields.io/badge/SCSS-CC6699?logo=sass&logoColor=white">
</p>

---

## Contents

- [Contents](#contents)
- [About](#about)
- [Highlights](#highlights)
- [Screenshots](#screenshots)
  - [Home](#home)
  - [Movies](#movies)
  - [Movie detail](#movie-detail)
  - [TV shows](#tv-shows)
  - [TV show detail](#tv-show-detail)
  - [Actors](#actors)
- [Tech stack](#tech-stack)
- [Design system](#design-system)
- [Getting started](#getting-started)
- [Environment](#environment)
- [Project structure](#project-structure)
- [Streaming sources](#streaming-sources)
- [Roadmap](#roadmap)
- [Disclaimer](#disclaimer)
- [License](#license)
- [Credits](#credits)
  - [Contributors](#contributors)

---

## About

Movieace is a Vue 3 + Vite single-page application that turns the TMDB catalogue into an editorially-styled, cinema-themed browsing and viewing experience. It pairs a custom design system (**LUMIÈRE**) with rich detail pages, multi-server streaming, watch-history syncing, and small flourishes — auto-playing background trailers, an ambient color bloom keyed off poster art, a command palette, an Up Next drawer with autoplay countdown, and more.

It is built primarily as a portfolio project to push the front-end further than a typical "TMDB clone" — focusing on motion, typography, and the small interactions that make a media app feel premium.

## Highlights

**Discover**
- Editorial home page with a billboard hero (live trailer playback over the backdrop), Top 10 marquee rail, mixed media rails, and curated shelves
- Movies, TV shows, and Actors listing pages with sort / filter / genre chips and a year-range slider
- Universal search across movies, TV, and people
- A keyboard-driven **command palette** for navigation and quick searches

**Detail surfaces**
- Cinematic title masthead with ambient color bloom (extracted from the poster), drop-cap synopsis, meta bar (director, writer, country, language, IMDb, Letterboxd), stats block (budget / revenue / profit), cast grid, reviews pull-quote, and similar titles
- Multi-trailer dialog with a numbered "reel" strip (switch between Trailer / Teaser / Clip / Featurette)
- Season tabs and per-season episode browsing for TV

**Watch**
- Multi-server streaming with persistent server preference per title
- Episode navigator (prev / next / season jump) on TV
- **Up Next drawer** with autoplay countdown
- **Mini player** that follows you between routes
- Continue-watching shelf backed by a local progress / history store

**Design language**
- LUMIÈRE design system — warm-near-black ink palette, ember spot accent, gold-leaf reserved for ratings/awards, Fraunces display + General Sans UI + JetBrains Mono
- Reduced-motion-aware animations, intersection / visibility-aware trailer playback, ambient bloom that recolors the page based on each title's poster

**Personalization**
- Watchlist (add / remove from any card)
- Continue-watching shelf with progress bars
- Toast notifications for state changes
- Local persistence (no account needed) via `@vueuse/core`'s `useStorage`

## Screenshots

### Home

<p align="center">
    <img src="/docs/index_page.png" width="100%" alt="Home page">
</p>

### Movies

<p align="center">
    <img src="/docs/movie_page.png" width="100%" alt="Movies listing">
</p>

### Movie detail

<p align="center">
    <img src="/docs/movie_detail_page.png" width="100%" alt="Movie detail">
</p>

### TV shows

<p align="center">
    <img src="/docs/tv_page.png" width="100%" alt="TV shows listing">
</p>

### TV show detail

<p align="center">
    <img src="/docs/tv_detail_page.png" width="100%" alt="TV show detail">
</p>

### Actors

<p align="center">
    <img src="/docs/actor_page.png" width="100%" alt="Actors page">
</p>

## Tech stack

| Area              | Choice                                  |
| ----------------- | --------------------------------------- |
| Framework         | [Vue 3.5](https://vuejs.org/) (Options + `setup()` composition) |
| Build / dev       | [Vite 5](https://vitejs.dev/)           |
| Language          | [TypeScript 5](https://www.typescriptlang.org/) |
| Styling           | [SCSS](https://sass-lang.com/) + CSS custom properties (LUMIÈRE tokens) |
| Routing           | [vue-router 4](https://router.vuejs.org/) |
| State / utilities | [@vueuse/core](https://vueuse.org/) (storage, intersection, etc.) |
| HTTP              | [axios](https://axios-http.com/)        |
| Carousels         | [swiper](https://swiperjs.com/)         |
| Data              | [TMDB API](https://developer.themoviedb.org/) |

## Design system

The visual language — internally referred to as **LUMIÈRE** — lives in `src/assets/styles/_tokens.scss` and is exposed as CSS custom properties for runtime theming.

Key tokens:

```scss
--ink-{500..900}    // warm near-black stage
--bone-{50..500}    // off-white text scale
--ember             // primary accent (cinema marquee orange)
--gold-leaf         // reserved for ratings / awards / official trailers
--ambient           // overridden per-page from poster artwork
--font-display      // Fraunces (variable, opsz + SOFT axes)
--font-ui           // General Sans
--font-mono         // JetBrains Mono
--s-{0..10}         // 8-pt spacing scale
--r-{sm,md,lg,pill} // radii
--dur-{fast,base,slow}, --ease-out  // motion
```

The ambient bloom you see behind hero artwork and detail mastheads is computed at runtime from each title's poster (`useAmbientColor`) and written into `--ambient`, which the scrim gradients consume.

## Getting started

**Prerequisites:** Node 18+ and a TMDB API key + read access token (free at [themoviedb.org](https://www.themoviedb.org/settings/api)).

```bash
# 1. clone
git clone https://github.com/hendurhance/movieace.git
cd movieace

# 2. install
yarn install        # or: npm install

# 3. configure environment
cp .env.example .env
# fill in VITE_API_KEY and VITE_API_ACCESS_TOKEN (see below)

# 4. run
yarn dev            # http://localhost:5173

# 5. typecheck + production bundle
yarn build
yarn preview        # serves the built bundle locally
```

## Environment

`.env` (see `.env.example`):

```bash
VITE_API_BASE_URL=https://api.themoviedb.org/
VITE_API_VERSION=3
VITE_IMAGE_BASE_URL=https://image.tmdb.org/t/p/

VITE_API_KEY=<your TMDB v3 API key>
VITE_API_ACCESS_TOKEN=<your TMDB v4 read access token>
```

Both keys are issued from the same TMDB account: the v3 key is used for most legacy endpoints, the v4 read token for newer ones. Movieace uses both depending on the call.

## Project structure

```
src/
├── App.vue
├── main.ts
├── assets/
│   ├── img/                 — Empty-state illustrations
│   └── styles/              — Tokens, base styles, mixins (LUMIÈRE)
├── components/
│   ├── cards/               — PosterCard, PersonCard, EpisodeCard, KeyartTile, CollectionTile
│   ├── detail/              — TitleMasthead, MetaBar, StatsBlock, CastGrid, SeasonTabs,
│   │                          DropCapSynopsis, ReviewsPullQuote, TrailerDialog
│   ├── discover/            — FilterPanel, GenreChips, YearRangeSlider
│   ├── feedback/            — Toast
│   ├── hero/                — BillboardHero, SpotlightModule, TrailerIframe, TrailerControls
│   ├── navigation/          — SiteHeader, SiteFooter, CommandPalette
│   ├── player/              — StreamFrame, ServerAccordion, EpisodeNavigator,
│   │                          UpNextDrawer, MiniPlayer, ShareScreen
│   ├── primitives/          — Button, Chip, Pill, Dialog, Drawer, Tabs, Tooltip,
│   │                          Skeleton, Spinner
│   ├── rails/               — Rail, CuratedRail, MixedRail, TopTenRail,
│   │                          UpcomingRail, ContinueShelf
│   └── svg/                 — Logo + outline / solid icon set
├── composables/
│   ├── useAxios.ts          — Configured axios with TMDB auth
│   ├── useMovies.ts / useTvShows.ts / useActor.ts — TMDB endpoints
│   ├── useSearch.ts         — Multi-search (movies + TV + people)
│   ├── useGenreLookup.ts    — Cached genre id → name resolver
│   ├── useHighlights.ts     — Home-page rails (top 10, trending, etc.)
│   ├── useStream.ts         — Server registry + persisted preference
│   ├── useTrailer.ts        — TMDB videos → embed URL (youtube-nocookie)
│   ├── useTrailerEmbed.ts   — Trailer state machine (dwell, postMessage, visibility, intersection)
│   ├── useWatchlist.ts      — Local watchlist store
│   ├── useHistory.ts        — Recently viewed titles
│   ├── useProgress.ts       — Per-episode/movie progress
│   ├── useMiniPlayer.ts     — Cross-route mini player
│   ├── useCommandPalette.ts — Keyboard-driven nav
│   ├── useAmbientColor.ts   — Poster → ambient hex/rgb
│   ├── useReveal.ts         — Intersection-based reveal animations
│   └── useToast.ts          — Toast queue
├── pages/
│   ├── Home.vue
│   ├── Movies.vue / Movie.vue
│   ├── TVShows.vue / TVShow.vue
│   ├── Actors.vue / Actor.vue
│   ├── Search.vue
│   ├── Watchlist.vue
│   ├── StreamMovie.vue / StreamTVShow.vue
│   └── NotFound.vue
├── routes/
│   └── index.ts             — vue-router config + scrollBehavior
└── utils/
```

## Streaming sources

Movieace itself does not host any video. The `<StreamFrame>` component embeds third-party providers which will not be listed in this README to avoid any endorsement implications. Each viewer's chosen server is persisted locally per title.

If you fork the project for your own use, you can add / remove / reorder servers freely — the registry is a single editable array.

## Roadmap

Not promises, just a punch list of things on the table:

- [ ] Server-side rendered link previews (OG meta) per title
- [ ] PWA shell + offline poster caching
- [ ] Better keyboard control inside the stream player
- [ ] Optional account-backed sync (replacing the local-only stores)
- [ ] More robust subtitle / audio-track UI
- [ ] Localization (i18n) of the editorial copy

## Disclaimer

This project is a non-commercial portfolio piece. It is not affiliated with The Movie Database or with any of the embed providers it links to. Catalogue metadata and artwork are sourced from [TMDB](https://www.themoviedb.org/) under their developer terms; please review TMDB's [terms of use](https://www.themoviedb.org/documentation/api/terms-of-use) before reusing this code.

The streaming embeds are external services. Movieace does not host, scrape, or distribute video content; it only renders provider-supplied iframes the same way a typical web embed would. Use the project responsibly and in line with the laws of your jurisdiction.

## License

[MIT](/LICENSE)

## Credits

- [TMDB](https://www.themoviedb.org/) — catalogue metadata and artwork
- [Fraunces](https://fonts.google.com/specimen/Fraunces) — display typeface
- [General Sans](https://www.fontshare.com/fonts/general-sans) — UI typeface
- [JetBrains Mono](https://www.jetbrains.com/lp/mono/) — monospace typeface

### Contributors

- [Endurance](https://github.com/hendurhance) — design + engineering
- [Razaq](https://github.com/classyrazy) — design + engineering
