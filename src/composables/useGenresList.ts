
import { Genre, useGenres } from "./useGenre";

export function useGenresList(ids: number[]) {
  const { getGenres } = useGenres('movie');

  const getGenresList = async () => {
    const { data } = await getGenres();
    return data.value.filter((genre: Genre) => ids.includes(genre.id));
  }

  return {
    getGenresList
  }
}
