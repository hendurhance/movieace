export interface ViewedItem {
  id: number | string;
  title: string;
  image: string | null;
  rating: number;
  categories: number[];
  adult: boolean;
  type: 'movie' | 'tv';
}
const MAX_HISTORY_LENGTH = 5;

import { useStorage } from '@vueuse/core';

export const searchHistory = useStorage<string[]>('searchHistory', []);
export const viewHistory = useStorage<ViewedItem[]>('viewHistory', []);

export function addSearchTerm(term: string): void {
  const value = term.trim();
  if (!value) return;
  const index = searchHistory.value.indexOf(value);
  if (index !== -1) searchHistory.value.splice(index, 1);
  searchHistory.value.unshift(value);
  if (searchHistory.value.length > MAX_HISTORY_LENGTH) {
    searchHistory.value = searchHistory.value.slice(0, 5);
  }
}

export function addViewedItem(item: ViewedItem): void {
  const index = viewHistory.value.findIndex(
    i => i.id === item.id && i.type === item.type
  );
  if (index !== -1) viewHistory.value.splice(index, 1);
  viewHistory.value.unshift(item);
  if (viewHistory.value.length > MAX_HISTORY_LENGTH) {
    viewHistory.value = viewHistory.value.slice(0, 5);
  }
}

export function useHistory() {
  return {
    searchHistory,
    viewHistory,
    addSearchTerm,
    addViewedItem
  };
}
