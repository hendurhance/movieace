import { useStorage } from "@vueuse/core";
import { ref } from "vue";
interface StreamData {
    currentStreamId: number;
    currentServer: number;
}
export const streamData  = useStorage('streamData', {
    currentStreamId: 0,
    currentServer: 0
} as StreamData);
export const servers = ref([
    { name: 'VidSrc CC', urlTemplate: 'https://vidsrc.cc/v2/embed/movie/{tmdbId}' },
    { name: 'VidSrc XYZ', urlTemplate: 'https://vidsrc.xyz/embed/movie?tmdb={tmdbId}' },
    { name: 'VidSrc In', urlTemplate: 'https://vidsrc.in/embed/movie?tmdb={tmdbId}' },
    { name: 'MultiEmbed', urlTemplate: 'https://multiembed.mov/?video_id={tmdbId}&tmdb=1' },
    { name: 'EmbedSU', urlTemplate: 'https://embed.su/embed/movie/{tmdbId}' },
    { name: 'VidLink', urlTemplate: 'https://vidlink.pro/movie/{tmdbId}' },
    { name: 'AutoEmbed', urlTemplate: 'https://player.autoembed.cc/embed/movie/{tmdbId}' }
  ])