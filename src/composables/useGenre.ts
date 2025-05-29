import { ref } from "vue";
import useAxios from "./useAxios";

export interface Genre {
  id: number;
  name: string;
}

const CACHE_KEY_PREFIX = "genres-cache-";

const getCacheKey = (type: string): string => CACHE_KEY_PREFIX + type;

const cacheData = (type: string, data: Genre[]): void => {
  const cacheKey = getCacheKey(type);
  localStorage.setItem(cacheKey, JSON.stringify(data));
};

const getCachedData = (type: string): Genre[] => {
  const cacheKey = getCacheKey(type);
  const cachedData = localStorage.getItem(cacheKey);
  return cachedData ? JSON.parse(cachedData) : [];
};

export const useGenres = (type: string) => {
  const getGenres = async () => {
    const loading = ref(false);
    const error = ref("");
    const data = ref<Genre[]>(getCachedData(type));

    if (data.value.length === 0) {
      try {
        loading.value = true;
        const req = useAxios().get(`https://api.themoviedb.org/3/genre/${type}/list`);
        const res = await req;
        const fetchedGenres: Genre[] = res.data.genres || [];
        cacheData(type, fetchedGenres);
        data.value = fetchedGenres
      } catch (err: any) {
        error.value = err.message;
      } finally {
        loading.value = false;
      }
    } else {
      data.value = data.value;
    }

    return {
      loading,
      error,
      data,
    };
  };

  return {
    getGenres,
  };
};
