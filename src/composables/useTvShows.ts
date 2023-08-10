import { ref } from "vue"
import useAxios from "./useAxios"
import { MovieCredit, MovieImages } from "./useMovies"
export interface TVShowType {
    adult: boolean,
    backdrop_path: string,
    id: number,
    name: string,
    original_language: string,
    original_title: string,
    overview: string,
    poster_path: string,
    media_type: string,
    genre_ids: number[],
    popularity: number
    release_date: string,
    video: boolean,
    vote_average: number,
    vote_count: number
}
export interface TVShowDetails {
    backdrop_path: string,
    created_by: {
        id: number,
        credit_id: string,
        name: string,
        gender: number,
        profile_path: string
    }[],
    episode_run_time: number[],
    first_air_date: string,
    genres: {
        id: number,
        name: string
    }[],
    homepage: string,
    id: number,
    in_production: boolean,
    languages: string[],
    last_air_date: string,
    last_episode_to_air: {
        air_date: string,
        episode_number: number,
        id: number,
        name: string,
        overview: string,
        production_code: string,
        season_number: number,
        still_path: string,
        vote_average: number,
        vote_count: number,
        runtime: number,
        show_id: number,
    },
    name: string,
    next_episode_to_air: null | object,
    networks: {
        name: string,
        id: number,
        logo_path: string,
        origin_country: string
    }[],
    number_of_episodes: number,
    number_of_seasons: number,
    origin_country: string[],
    original_language: string,
    original_name: string,
    overview: string,
    popularity: number,
    poster_path: string,
    production_companies: {
        id: number,
        logo_path: string,
        name: string,
        origin_country: string
    }[],
    production_countries: {
        iso_3166_1: string,
        name: string
    }[],
    seasons: {
        air_date: string,
        episode_count: number,
        id: number,
        name: string,
        overview: string,
        poster_path: string,
        season_number: number
    }[],
    spoken_languages: {
        english_name: string,
        iso_639_1: string,
        name: string
    }[],
    status: string,
    tagline: string,
    type: string,
    vote_average: number,
    vote_count: number
}
interface TVShowResponse {
    page: number,
    results: TVShowType[],
    total_pages: number,
    total_results: number
}

export const newShows = ref<TVShowType[]>([])
export const useTvShows = () => {
    const fetchNewShows = async () => {
        let loading = ref(false)
        let error = ref("")
        let data = ref<TVShowType[]>([])
        try {
            loading.value = true
            const req = useAxios().get('https://api.themoviedb.org/3/trending/tv/day')
            const res = (await req).data
            if (res.results) {
                newShows.value = res.results
                data.value = res.results 
            }
        } catch (err: any) {
            error.value = err.message
        } finally {
            loading.value = false
        }
        return {
            loading,
            error,
            data
        }
    }
    const fetchDiscoverShows = async (url: string = "https://api.themoviedb.org/3/discover/tv" ) => {
        let loading = ref(false)
        let error = ref("")
        let data = ref<TVShowResponse>()
        try {
            loading.value = true
            const req = useAxios().get(url)
            const res = (await req).data
            if (res.results) {
                data.value = res
            }
        } catch (err: any) {
            error.value = err.message
        } finally {
            loading.value = false
        }
        return {
            loading,
            error,
            data
        }
    }
    const fetchTvShow = async (id: string) => {
        let loading = ref(false)
        let error = ref("")
        let data = ref<TVShowDetails>()
        try {
            loading.value = true
            const req = useAxios().get(`https://api.themoviedb.org/3/tv/${id}`)
            const res = (await req).data
            if (res) {
                data.value = res
            }
        } catch (err: any) {
            error.value = err.message
        } finally {
            loading.value = false
        }
        return {
            loading,
            error,
            data
        }
    }
    const fetchTvShowCredit = async (id: string) => {
        let loading = ref(false)
        let error = ref("")
        let data = ref<MovieCredit>()
        try {
            loading.value = true
            const req = useAxios().get(`https://api.themoviedb.org/3/tv/${id}/credits`)
            const res = (await req).data
            if (res) {
                data.value = res
            }
        } catch (err: any) {
            error.value = err.message
        } finally {
            loading.value = false
        }
        return {
            loading,
            error,
            data
        }
    }
    const fetchTvShowImages = async (id:string) => {
        let loading = ref(false)
        let error = ref("")
        let data = ref<MovieImages>()
        try {
            loading.value = true
            const req = useAxios().get(`https://api.themoviedb.org/3/tv/${id}/images?include_image_language=en`)
            const res = (await req).data
            if (res) {
                data.value = res
            }
        } catch (err: any) {
            error.value = err.message
        } finally {
            loading.value = false
        }
        return {
            loading,
            error,
            data
        }
    }
    const fetchSimilarTvShows = async (id:string) =>{
        let loading = ref(false)
        let error = ref("")
        let data = ref<TVShowResponse>()
        try {
            loading.value = true
            const req = useAxios().get(`https://api.themoviedb.org/3/tv/${id}/similar?language=en-US&page=1`)
            const res = (await req).data
            if (res) {
                data.value = res
            }
        } catch (err: any) {
            error.value = err.message
        } finally {
            loading.value = false
        }
        return {
            loading,
            error,
            data
        }
    }
    return{
        fetchNewShows,
        fetchDiscoverShows,
        fetchTvShow,
        fetchTvShowCredit,
        fetchTvShowImages,
        fetchSimilarTvShows
    }
}