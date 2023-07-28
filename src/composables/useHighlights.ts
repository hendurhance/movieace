import { ref } from "vue"
import useAxios from "./useAxios"
export interface Movie {
    adult: boolean,
    backdrop_path: string,
    id: number,
    title: string,
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

export const useHighlights = () => {
    const getHighlightsToday = async () => {
        let loading = ref(false)
        let error = ref("")
        let data = ref<Movie[]>([])
        try {
            loading.value = true
            const req = useAxios().get('https://api.themoviedb.org/3/trending/movie/day')
            const res = (await req).data
            if (res.results) {
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
    return {
        getHighlightsToday
    }
}