<p align="center">
    <img src="/docs/logo.png" width="200 height="100%">
</p>

## 📚 Table of Contents
- [📚 Table of Contents](#-table-of-contents)
- [📖 Description](#-description)
- [📖 Features](#-features)
- [Screenshots \& Demo](#screenshots--demo)
  - [Home Page](#home-page)
  - [Movies Page](#movies-page)
  - [Search Page](#search-page)
  - [Movie Details Page](#movie-details-page)
- [📺 Demo](#-demo)
- [📖 Technologies Used](#-technologies-used)
- [📄 Installation Guide](#-installation-guide)
- [📁 File Structure (/src)](#-file-structure-src)
- [📑 License](#-license)
- [© Credits](#-credits)
- [🧑‍🤝‍🧑 Contributors](#-contributors)


## 📖 Description
Movieace is a web application that allows users to search for movies, TV shows actors. Users can also watch trailers, and stream their favorite movies and TV shows.

## 📖 Features
- Search for movies, TV shows, and actors
- Watch trailers
- View movie and TV show details
- Stream movies and TV shows using the [Movies7](#)
- View actor details

## Screenshots & Demo
### Home Page
The home page displays the most popular, top rated, and upcoming movies and TV shows.
<p align="center">
    <img src="/docs/screenshot-1.png" width="100%" height="100%">
</p>

### Movies Page
The movies page displays the most popular movies and TV shows. Users can also search for movies and filter by genre.
<p align="center">
    <img src="/docs/screenshot-2.png" width="100%" height="100%">
</p>

### Search Page
The search page allows users to search for movies, TV shows, and actors.
<p align="center">
    <img src="/docs/screenshot-3.png" width="100%" height="100%">
</p>

### Movie Details Page
The movie details page displays the movie's details, cast, and trailers. Users can also stream the movie using the [Movies7](#) app.
<p align="center">
    <img src="/docs/screenshot-4.png" width="100%" height="100%">
</p>

## 📺 Demo

## 📖 Technologies Used
- [Vue 3](https://v3.vuejs.org/)
- [Vite](https://vitejs.dev/)
- [SCSS](https://sass-lang.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [TMDB API](https://www.themoviedb.org/documentation/api)

## 📄 Installation Guide
1. Clone the repository
```bash
git clone https://github.com/hendurhance/movieace.git
```
2. Install dependencies
```bash
npm install
```
3. Copy the `.env.example` file and rename it to `.env`
```bash
cp .env.example .env
```
4. Add your TMDB API & TMDB SECRET key to the `.env` file
```bash
...
VITE_API_KEY=api_key
...
VITE_API_ACCESS_TOKEN=api_access_token
```
5. Run the development server
```bash
npm run dev
```
6. Open [http://localhost:5173](http://localhost:5173) with your browser to see the result.

## 📁 File Structure (/src)
```bash
.
├── App.vue
├── assets
│   ├── img
│   │   ├── empty-actor-state.png
│   │   └── empty-movie-state.png
│   ├── styles
│   │   ├── _background_hero.scss
│   │   └── _masthead.scss
│   └── vue.svg
├── calculation
│   └── vote-to-rating.ts
├── components
│   ├── ModalRoot.vue
│   ├── TrailerModal.vue
│   ├── base
│   │   ├── BaseFooter.vue
│   │   ├── BaseHeader.vue
│   │   └── BaseModal.vue
│   ├── layout
│   │   ├── ActorItem.vue
│   │   ├── CastItem.vue
│   │   ├── EpisodeDialog.vue
│   │   ├── FeaturedMovie.vue
│   │   ├── GenreLists.vue
│   │   └── MovieItem.vue
│   └── svg
│       ├── logo
│       │   └── movieace.vue
│       ├── outline
│       │   ├── arrow-left.vue
│       │   ├── arrow-right.vue
│       │   ├── clock.vue
│       │   ├── menu.vue
│       │   ├── search.vue
│       │   └── tag.vue
│       └── solid
│           ├── popularity.vue
│           └── star.vue
├── composables
│   ├── useActor.ts
│   ├── useAxios.ts
│   ├── useGenre.ts
│   ├── useGenresList.ts
│   ├── useHighlights.ts
│   ├── useModal.ts
│   ├── useMovies.ts
│   ├── useSearch.ts
│   └── useTvShows.ts
├── containers
│   ├── CastWrapper.vue
│   ├── EmptyState.vue
│   ├── Hero.vue
│   ├── KnownFor.vue
│   ├── MoviePicture.vue
│   ├── RatingStar.vue
│   ├── SearchResults.vue
│   ├── SearchWrapper.vue
│   └── SimilarMovie.vue
├── lodash.debounce.d.ts
├── main.ts
├── pages
│   ├── Actor.vue
│   ├── Actors.vue
│   ├── Index.vue
│   ├── Movie.vue
│   ├── Movies.vue
│   ├── NotFound.vue
│   ├── Search.vue
│   ├── TVShow.vue
│   └── TVShows.vue
├── routes
│   └── index.ts
├── style.scss
├── utils
│   ├── button-layout.ts
│   ├── footer-links.ts
│   ├── swiper-options.ts
│   ├── useMoveSlide.ts
│   └── useWebImage.ts
└── vite-env.d.ts
```
- **Components**: The folder contains all the components used in the application. Base components are components that are used throughout the application. Layout components are components that are used in the layout of the application. SVG components are components that are used to display SVG icons.
- **Composables**: The folder contains all the composables used in the application. Composables are functions that are used to perform a specific task mostly related to fetching data.
- **Containers**: The folder contains all the containers used in the application. Containers are components that are used to display data.
- **Routes**: The folder contains all the routes used in the application.
- **Pages**: The folder contains all the pages used in the application. Every route has a corresponding page.
- **Utils**: The folder contains all the utility functions used in performing a specific task.
- **Calculation**: The folder contains all the functions used in performing a specific calculation. e.g. converting vote average to rating.

## 📑 License
[MIT](/LICENSE)

## © Credits
- [TMDB](https://www.themoviedb.org/)
- [Movies7](#)

## 🧑‍🤝‍🧑 Contributors
- [Endurance](https://github.com/hendurhance)
- [Razaq](https://github.com/classyrazy)