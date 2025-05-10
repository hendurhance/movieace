import { useStorage } from "@vueuse/core";
import { ref } from "vue";
import { MovieDetails } from "./useMovies";

interface MovieServer {
  serverIndex: number;
  type: 'movie' | 'tv';
  season: number;
  episode: number;
}

interface StreamData {
  movieServerMap: Record<string, MovieServer>;
}

interface Server {
  name: string;
  urlTemplate: string;
}

const defaultStreamData: StreamData = {
  movieServerMap: {}
};

export const streamData = useStorage<StreamData>('streamData', defaultStreamData);

export const movieServers = ref<Server[]>([
  { name: 'VidEasy', urlTemplate: 'https://player.videasy.net/movie/{tmdbId}?color=#4eb5ff' },
  { name: 'VidSrc CC', urlTemplate: 'https://vidsrc.cc/v2/embed/movie/{tmdbId}' },
  { name: 'VidSrc XYZ', urlTemplate: 'https://vidsrc.xyz/embed/movie?tmdb={tmdbId}' },
  { name: 'VidSrc In', urlTemplate: 'https://vidsrc.in/embed/movie?tmdb={tmdbId}' },
  { name: 'MultiEmbed', urlTemplate: 'https://multiembed.mov/?video_id={tmdbId}&tmdb=1' },
  { name: 'EmbedSU', urlTemplate: 'https://embed.su/embed/movie/{tmdbId}' },
  { name: 'VidLink', urlTemplate: 'https://vidlink.pro/movie/{tmdbId}' },
  { name: 'AutoEmbed', urlTemplate: 'https://player.autoembed.cc/embed/movie/{tmdbId}' },
  { name: 'VidFast', urlTemplate: 'https://vidfast.pro/movie/{tmdbId}' },
  { name: '111Movies', urlTemplate: 'https://111movies.com/movie/{tmdbId}' },
  { name: 'Vidora', urlTemplate: 'https://vidora.su/movie/{tmdbId}?parameters' },
  { name: 'Smashy', urlTemplate: 'https://player.smashy.stream/movie/{tmdbId}?autoplay=true' }
]);

export const tvServers = ref<Server[]>([
  { name: 'VidEasy', urlTemplate: 'https://player.videasy.net/tv/{externalId}/{season}/{episode}?color=#4eb5ff&nextEpisode=true&autoplayNextEpisode=true&episodeSelector=true' },
  { name: 'VidSrc CC', urlTemplate: 'https://vidsrc.cc/v2/embed/tv/{externalId}/{season}/{episode}' },
  { name: 'VidSrc XYZ', urlTemplate: 'https://vidsrc.xyz/embed/tv?tmdb={externalId}&season={season}&episode={episode}' },
  { name: 'VidSrc In', urlTemplate: 'https://vidsrc.in/embed/tv?tmdb={externalId}&season={season}&episode={episode}' },
  { name: 'MultiEmbed', urlTemplate: 'https://multiembed.mov/?video_id={externalId}&tmdb=1&s={season}&e={episode}' },
  { name: 'Embed.su', urlTemplate: 'https://embed.su/embed/tv/{externalId}/{season}/{episode}' },
  { name: 'Vidlink', urlTemplate: 'https://vidlink.pro/tv/{externalId}/{season}/{episode}' },
  { name: 'AutoEmbed', urlTemplate: 'https://player.autoembed.cc/embed/tv/{externalId}/{season}/{episode}' },
  { name: 'VidFast', urlTemplate: 'https://vidfast.pro/tv/{externalId}/{season}/{episode}' },
  { name: '111Movies', urlTemplate: 'https://111movies.com/tv/{externalId}/{season}/{episode}' },
  { name: 'Vidora', urlTemplate: 'https://vidora.su/tv/{externalId}/{season}/{episode}?autoplay=true' },
  { name: 'Smashy', urlTemplate: 'https://player.smashy.stream/tv/{externalId}?s={season}&e={episode}' }
]);

export const currentStreamData = ref({
  currentStreamId: 0,
  currentServer: 0,
  currentType: 'movie' as 'movie' | 'tv',
  currentSeason: 0,
  currentEpisode: 0
});

export function getPreferredStreamData(mediaId: number | string, type: 'movie' | 'tv' = 'movie'): MovieServer | null {
  const id = String(mediaId);

  if (!id) {
    console.warn('Invalid media ID provided');
    return null;
  }

  const savedData = streamData.value.movieServerMap[id];

  if (savedData) {
    currentStreamData.value = {
      currentStreamId: Number(id),
      currentServer: savedData.serverIndex,
      currentType: savedData.type,
      currentSeason: savedData.season,
      currentEpisode: savedData.episode
    };
    return savedData;
  }

  // Set defaults for new media
  currentStreamData.value = {
    currentStreamId: Number(id),
    currentServer: 0,
    currentType: type,
    currentSeason: type === 'tv' ? 1 : 0,
    currentEpisode: type === 'tv' ? 1 : 0
  };

  return null;
}

export function savePreferredServer(mediaId: string | number, serverIndex: number, type: 'movie' | 'tv' = 'movie'): void {
  if (serverIndex < 0 || serverIndex >= (type === 'movie' ? movieServers.value : tvServers.value).length) {
    console.warn('Invalid server index');
    return;
  }

  const id = String(mediaId);

  streamData.value.movieServerMap[id] = {
    serverIndex,
    type,
    season: type === 'tv' ? (streamData.value.movieServerMap[id]?.season || 1) : 0,
    episode: type === 'tv' ? (streamData.value.movieServerMap[id]?.episode || 1) : 0
  };

  currentStreamData.value.currentServer = serverIndex;
  currentStreamData.value.currentType = type;
}

export function saveLastWatchedMetaData(
  mediaId: string | number,
  type: 'movie' | 'tv',
  meta: {
    season: number;
    episode: number;
  }
): void {
  if (type === 'tv' && (meta.season < 1 || meta.episode < 1)) {
    console.warn('Invalid season or episode number');
    return;
  }

  const id = String(mediaId);

  streamData.value.movieServerMap[id] = {
    serverIndex: streamData.value.movieServerMap[id]?.serverIndex || 0,
    type,
    season: meta.season,
    episode: meta.episode
  };

  currentStreamData.value.currentType = type;
  currentStreamData.value.currentSeason = meta.season;
  currentStreamData.value.currentEpisode = meta.episode;
}

export function getLastWatchedMetaData(mediaId: string | number): MovieServer | null {
  const id = String(mediaId);
  return streamData.value.movieServerMap[id] || null;
}

export function getServers(type: 'movie' | 'tv' = 'movie'): Server[] {
  return type === 'movie' ? movieServers.value : tvServers.value;
}

export function buildStreamUrl(
  mediaId: string | number,
  type: 'movie' | 'tv' = 'movie',
  serverIndex: number = 0,
  season: number = 1,
  episode: number = 1
): string {
  const id = String(mediaId);
  const servers = getServers(type);

  if (serverIndex < 0 || serverIndex >= servers.length) {
    console.warn('Invalid server index, using default');
    serverIndex = 0;
  }

  const server = servers[serverIndex] || servers[0];

  if (type === 'movie') {
    return server.urlTemplate.replace('{tmdbId}', id);
  }

  return server.urlTemplate
    .replace('{externalId}', id)
    .replace('{season}', String(Math.max(1, season)))
    .replace('{episode}', String(Math.max(1, episode)));
}

interface WatchPartyStream {
  [quality: string]: string;
}

interface WatchPartySubtitle {
  file: string;
  label: string;
}

export interface WatchPartyResponse {
  available_qualities: string[];
  has_subtitles: boolean;
  status: string;
  streams: WatchPartyStream;
  subtitles: WatchPartySubtitle[];
  title: string;
}

// Add watch party state
export const watchPartyData = ref<{
  isLoading: boolean;
  error: string | null;
  response: WatchPartyResponse | null;
  selectedQuality: string;
  currentMovieId: number | null;
}>({
  isLoading: false,
  error: null,
  response: null,
  selectedQuality: '',
  currentMovieId: null
});

// Add function to fetch watch party data
export async function fetchWatchPartyData(movie: MovieDetails): Promise<void> {
  // Skip if it's the same movie we already have data for
  if (watchPartyData.value.currentMovieId === movie.id && watchPartyData.value.response) {
    return;
  }

  if (!movie?.title || !movie?.release_date) {
    watchPartyData.value.error = "Missing movie information";
    return;
  }

  watchPartyData.value.isLoading = true;
  watchPartyData.value.error = null;
  
  try {
    // Extract year from release_date
    const releaseYear = new Date(movie.release_date).getFullYear();
    const fallbackYear = releaseYear - 1;
    
    // Encode movie title for URL
    const encodedTitle = encodeURIComponent(movie.title);
    
    const url = `https://xprime.tv/primebox?name=${encodedTitle}&year=${releaseYear}&fallback_year=${fallbackYear}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status !== "ok" || !data.streams || Object.keys(data.streams).length === 0) {
      watchPartyData.value.error = "Watch party not available for this movie";
      return;
    }
    
    watchPartyData.value.response = data;
    watchPartyData.value.currentMovieId = movie.id;
    
    // Set default selected quality to the highest available
    if (data.available_qualities && data.available_qualities.length > 0) {
      watchPartyData.value.selectedQuality = data.available_qualities[0];
    }
    
  } catch (error) {
    watchPartyData.value.error = "Failed to fetch watch party data";
    console.error("Watch party fetch error:", error);
  } finally {
    watchPartyData.value.isLoading = false;
  }
}

// Add function to create watch party URL
export function createWatchPartyUrl(): string | null {
  const { response, selectedQuality } = watchPartyData.value;
  
  if (!response || !response.streams || !selectedQuality) {
    return null;
  }
  
  const streamUrl = response.streams[selectedQuality];
  if (!streamUrl) {
    return null;
  }
  
  return `https://www.watchparty.me/create?video=${encodeURIComponent(streamUrl)}`;
}

// Add function to open watch party in new tab
export function openWatchParty(): void {
  const watchPartyUrl = createWatchPartyUrl();
  
  if (watchPartyUrl) {
    window.open(watchPartyUrl, '_blank');
  }
}

// Add function to change quality selection
export function setWatchPartyQuality(quality: string): void {
  watchPartyData.value.selectedQuality = quality;
}

// Add function to reset watch party data (useful when changing movies)
export function resetWatchPartyData(): void {
  watchPartyData.value = {
    isLoading: false,
    error: null,
    response: null,
    selectedQuality: '',
    currentMovieId: null
  };
}

// Export a Vue composable to use in components
export function useWatchParty() {
  return {
    watchPartyData,
    fetchWatchPartyData,
    createWatchPartyUrl,
    openWatchParty,
    setWatchPartyQuality,
    resetWatchPartyData
  };
}