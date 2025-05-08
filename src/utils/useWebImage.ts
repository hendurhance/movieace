import empty_movie_state from '../assets/img/empty-movie-state.png';
import { Movie } from '../composables/useHighlights';
import { TVShowDetails, TVShowType } from '../composables/useTvShows';

const IMAGE_BASEURL = import.meta.env.VITE_IMAGE_BASE_URL;

const selectSize = (size: "medium" | "large" | "small") => {
    const sizeOptions = {
        small: "w300",
        medium: "w500",
        large: "w780",
    }
    return sizeOptions[size] || sizeOptions.medium
}
export const useWebImage = (url: string, size: "medium" | "large" | "small" = "medium") => {
    let imgSize = selectSize(size)
    return `${IMAGE_BASEURL}${imgSize}/${url}`
}
// return {
//     backdrop: movie.value?.backdrop_path === null ? empty_movie_state : `${IMAGE_BASEURL}w1280${movie.value?.backdrop_path}`,
//     poster: movie.value?.poster_path === null ? empty_movie_state : `${IMAGE_BASEURL}w780${movie.value?.poster_path}`
// };
export const getMovieImageUrl = (data: Movie| TVShowDetails) => {
    const backdrop = data.backdrop_path === null ? empty_movie_state : `${IMAGE_BASEURL}w1280${data.backdrop_path}`;
    const poster = data.poster_path === null ? empty_movie_state : `${IMAGE_BASEURL}w780${data.poster_path}`;
    return {
        backdrop,
        poster
    } as const;
}
