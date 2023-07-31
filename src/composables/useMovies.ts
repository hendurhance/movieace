import { ref } from "vue"
import { Movie } from "./useHighlights"
import useAxios from "./useAxios"

interface MovieResponse {
    page: number,
    results: Movie[],
    total_pages: number,
    total_results: number
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
    return{
        fetchDiscoverMovies
    }
}