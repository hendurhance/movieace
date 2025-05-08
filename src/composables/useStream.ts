import { useStorage } from "@vueuse/core";
import { ref } from "vue";
interface MovieServer {
        serverIndex: number;
        type: 'movie' | 'tv';
        season: number;
        episode: number;
}
interface StreamData {
  movieServerMap: {
    [key: string]: MovieServer; 
  };
}

export const streamData = useStorage('streamData', {
  movieServerMap: {}
} as StreamData);


export const servers = ref([
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
export const currentStreamData = ref({
  currentStreamId: 0,
    currentServer: 0,
});
export function getPreferredStreamData(movieId: number): MovieServer | number {
  if (movieId in streamData.value.movieServerMap) {
    currentStreamData.value.currentStreamId = movieId;
    currentStreamData.value.currentServer = streamData.value.movieServerMap[movieId].serverIndex;
    return streamData.value.movieServerMap[movieId];
  }
  return 0; 
}

export function savePreferredServer(movieId: string, serverIndex: number): void {
    if (movieId in streamData.value.movieServerMap) {
        streamData.value.movieServerMap[movieId].serverIndex = serverIndex;
    } else {
        streamData.value.movieServerMap[movieId] = {
            serverIndex,
            type: 'movie',
            season: 0,
            episode: 0
        };
    }
}

export function saveLastWatchedMetaData(
  movieId: string,
  type: 'movie' | 'tv',
  meta: {
    season: number;
    episode: number;
  }
): void {
    if (movieId in streamData.value.movieServerMap) {
        streamData.value.movieServerMap[movieId].season = meta.season;
        streamData.value.movieServerMap[movieId].episode = meta.episode;
    } else {
        streamData.value.movieServerMap[movieId] = {
        serverIndex: 0,
        type,
        season: meta.season,
        episode: meta.episode
        };
    }
}
export function getLastWatchedMetaData(movieId: string): MovieServer | null {
    if (movieId in streamData.value.movieServerMap) {
        return streamData.value.movieServerMap[movieId];
    }
    return null;
}