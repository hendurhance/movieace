import { ref } from "vue"
import useAxios from "./useAxios"
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
    return{
        fetchNewShows,
        fetchDiscoverShows
    }
}