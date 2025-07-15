import { ref } from "vue";
import { MovieDetails } from "./useMovies";
import { TVShowDetails } from "./useTvShows";

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

export const watchPartyData = ref<{
  isLoading: boolean;
  error: string | null;
  response: WatchPartyResponse | null;
  selectedQuality: string;
  currentId: number | null;
}>({
  isLoading: false,
  error: null,
  response: null,
  selectedQuality: '',
  currentId: null
});

export async function fetchWatchPartyMovieData(movie: MovieDetails): Promise<void> {
  if (watchPartyData.value.currentId === movie.id && watchPartyData.value.response) {
    return;
  }
  
  if (!movie?.title || !movie?.release_date) {
    watchPartyData.value.error = "Missing movie information";
    return;
  }
  
  watchPartyData.value.isLoading = true;
  watchPartyData.value.error = null;
  
  try {
    const releaseYear = new Date(movie.release_date).getFullYear();
    const fallbackYear = releaseYear - 1;
    
    const encodedTitle = encodeURIComponent(movie.title);
    
    const url = `https://backend.xprime.tv/phoenix?name=${encodedTitle}&year=${releaseYear}&fallback_year=${fallbackYear}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status !== "ok" || !data.streams || Object.keys(data.streams).length === 0) {
      watchPartyData.value.error = "Watch party not available for this movie";
      return;
    }
    
    watchPartyData.value.response = data;
    watchPartyData.value.currentId = movie.id;

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

export async function fetchWatchPartyTVShowData(
  show: TVShowDetails,
  seasonNumber: number,
  episodeNumber: number
): Promise<void> {
  if (
    watchPartyData.value.currentId === show.id && 
    watchPartyData.value.response &&
    watchPartyData.value.response.title.includes(`S${seasonNumber}:E${episodeNumber}`)
  ) {
    return;
  }
  
  if (!show?.name || !show?.first_air_date) {
    watchPartyData.value.error = "Missing show information";
    return;
  }
  
  watchPartyData.value.isLoading = true;
  watchPartyData.value.error = null;
  
  try {
    const airYear = new Date(show.first_air_date).getFullYear();
    const fallbackYear = airYear - 1;
    const currentYear = new Date().getFullYear();

    const year = airYear > 2020 ? currentYear : airYear;
    
    const encodedTitle = encodeURIComponent(show.name);
    
    const url = `https://backend.xprime.tv/phoenix?name=${encodedTitle}&year=${year}&fallback_year=${fallbackYear}&season=${seasonNumber}&episode=${episodeNumber}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status !== "ok" || !data.streams || Object.keys(data.streams).length === 0) {
      watchPartyData.value.error = "Watch party not available for this episode";
      return;
    }
    
    data.title = `${data.title} S${seasonNumber}:E${episodeNumber}`;
    
    watchPartyData.value.response = data;
    watchPartyData.value.currentId = show.id;

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

export function getCurrentStreamUrl(): string | null {
  const { response, selectedQuality } = watchPartyData.value;
  
  if (!response || !response.streams || !selectedQuality) {
    return null;
  }
  
  return response.streams[selectedQuality] || null;
}

export function openWatchParty(): void {
  const watchPartyUrl = createWatchPartyUrl();
  
  if (watchPartyUrl) {
    window.open(watchPartyUrl, '_blank');
  }
}

export function setWatchPartyQuality(quality: string): void {
  watchPartyData.value.selectedQuality = quality;
}

export function resetWatchPartyData(): void {
  watchPartyData.value = {
    isLoading: false,
    error: null,
    response: null,
    selectedQuality: '',
    currentId: null
  };
}

export function useWatchParty() {
  return {
    watchPartyData,
    fetchWatchPartyMovieData,
    fetchWatchPartyTVShowData,
    createWatchPartyUrl,
    getCurrentStreamUrl,
    openWatchParty,
    setWatchPartyQuality,
    resetWatchPartyData
  };
}