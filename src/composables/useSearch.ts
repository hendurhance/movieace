import { ref } from "vue"
import  useAxios  from "./useAxios"

export interface SearchMovie {
    id: number;
    title?: string;
    original_title?: string;
    poster_path: string | null;
    vote_average?: number;
    release_date?: string;
    genre_ids?: number[];
    adult?: boolean;
    media_type?: string;
}

export interface SearchShow {
    id: number;
    name?: string;
    original_name?: string;
    poster_path: string | null;
    vote_average?: number;
    first_air_date?: string;
    genre_ids?: number[];
    media_type?: string;
}

export interface SearchPerson {
    id: number;
    name: string;
    profile_path: string | null;
    known_for_department?: string;
    media_type?: string;
}

export const reqMetaData = ref<{
    page: number,
    total_pages: number
}>({
    page: 0,
    total_pages: 0
})
export const discoveredMovies = ref<SearchMovie[]>([])
export const discoveredTv = ref<SearchShow[]>([])
export const discoveredPeople = ref<SearchPerson[]>([])
export const useSearch = () => {
    const fetchSearchResults = async (query: string, pageNumber: number =1) => {
        let loading = ref(false)
        let error = ref("")
        try {
            loading.value = true
            const req = await useAxios().get(`https://api.themoviedb.org/3/search/multi?query=${query}&page=${pageNumber}`)
            const res = req.data.results
            reqMetaData.value = {
                page: req.data.page,
                total_pages: req.data.total_pages
            }
            discoveredMovies.value= res.filter((movie: any) => movie.media_type === "movie")
            discoveredTv.value= res.filter((tv: any) => tv.media_type === "tv")
            discoveredPeople.value= res.filter((people: any) => people.media_type === "person")
        } catch (err: any) {
            error.value = err.message
        } finally {
            loading.value = false
        }
        return {
            loading,
            error,
        }
    }

    const clearSearchResults = () => {
        discoveredMovies.value = []
        discoveredTv.value = []
        discoveredPeople.value = []
        reqMetaData.value = {
            page: 0,
            total_pages: 0
        }
    }
    return {
        fetchSearchResults,
        clearSearchResults,
    }
}