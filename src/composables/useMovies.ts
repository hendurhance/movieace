import { ref } from "vue"
import { Movie } from "./useHighlights"
import {Actor} from "./useActor"
import useAxios from "./useAxios"
import { useRouter } from "vue-router"

export interface MovieResponse {
    page: number,
    results: Movie[],
    total_pages: number,
    total_results: number
}
export interface MovieDetails{
    adult: boolean,
    backdrop_path: string,
    belongs_to_collection: null | object,
    budget: number,
    genres: {
        id: number,
        name: string
    }[],
    homepage: string,
    id: number,
    imdb_id: string,
    original_language: string,
    original_title: string,
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
    release_date: string,
    revenue: number,
    runtime: number,
    spoken_languages: {
        english_name: string,
        iso_639_1: string,
        name: string
    }[],
    status: string,
    tagline: string,
    title: string,
    video: boolean,
    vote_average: number,
    vote_count: number
}

export interface Cast  extends Actor{
    character: string,
    credit_id: string,
    order: number
}
export interface Crew  extends Actor{
    character: string,
    credit_id: string,
    job: string
}
export interface MovieCredit {
    id: number,
    cast: Cast[],
    crew: Crew[]
}
export interface Image {
    aspect_ratio: number,
    height: number,
    iso_639_1: null | string,
    file_path: string,
    vote_average: number,
    vote_count: number,
    width: number
}
export interface MovieImages {
    backdrops:Image[],
    id: number,
    logos: Image[],
    posters: Image[]
}
const router  = useRouter()
export const handleMovieClick = (id: number) => {
    router.push({name: "Movie", params: {id: id.toString()}})
}
export const useMovies = () => {
    const fetchDiscoverMovies = async (url: string = "https://api.themoviedb.org/3/discover/movie" ) => {
        let loading = ref(false)
        let error = ref("")
        let data = ref<MovieResponse>()
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
    const fetchMovie = async (id: string) => {
        let loading = ref(false)
        let error = ref("")
        let data = ref<MovieDetails>()
        try {
            loading.value = true
            const req = useAxios().get(`https://api.themoviedb.org/3/movie/${id}`)
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
    const fetchMovieCredits = async (id: string) => {
        let loading = ref(false)
        let error = ref("")
        let data = ref<MovieCredit>()
        try {
            loading.value = true
            const req = useAxios().get(`https://api.themoviedb.org/3/movie/${id}/credits`)
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
    const fetchMovieImages = async (id:string) => {
        let loading = ref(false)
        let error = ref("")
        let data = ref<MovieImages>()
        try {
            loading.value = true
            const req = useAxios().get(`https://api.themoviedb.org/3/movie/${id}/images?include_image_language=en`)
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
    const fetchSimilarMovies = async (id:string) =>{
        let loading = ref(false)
        let error = ref("")
        let data = ref<MovieResponse>()
        try {
            loading.value = true
            const req = useAxios().get(`https://api.themoviedb.org/3/movie/${id}/similar?language=en-US&page=1`)
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
        fetchDiscoverMovies,
        fetchMovie,
        fetchMovieCredits,
        fetchMovieImages,
        fetchSimilarMovies
    }
}