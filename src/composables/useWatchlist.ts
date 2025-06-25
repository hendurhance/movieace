import { useStorage } from '@vueuse/core';

export interface WatchlistItem {
  id: number | string;
  title: string;
  image: string | null;
  rating: number;
  categories: number[];
  adult: boolean;
  type: 'movie' | 'tv';
}

const WATCHLIST_KEY = 'watchlist';

export const watchlist = useStorage<WatchlistItem[]>(WATCHLIST_KEY, []);

export function isInWatchlist(id: number | string, type: 'movie' | 'tv'): boolean {
  return watchlist.value.some(item => item.id === id && item.type === type);
}

export function addToWatchlist(item: WatchlistItem): void {
  if (!isInWatchlist(item.id, item.type)) {
    watchlist.value.unshift(item);
  }
}

export function removeFromWatchlist(id: number | string, type: 'movie' | 'tv'): void {
  watchlist.value = watchlist.value.filter(item => !(item.id === id && item.type === type));
}

export function toggleWatchlistItem(item: WatchlistItem): void {
  if (isInWatchlist(item.id, item.type)) {
    removeFromWatchlist(item.id, item.type);
  } else {
    addToWatchlist(item);
  }
}

export function useWatchlist() {
  return {
    watchlist,
    isInWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    toggleWatchlistItem
  };
}
