import { useStorage } from "@vueuse/core";
import { ref } from "vue";

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