import { ref } from "vue"
import  useAxios  from "./useAxios"

export const reqMetaData = ref<{
    page: number,
    total_pages: number
}>({
    page: 0,
    total_pages: 0
})
export const discoveredMovies = ref([])
export const discoveredTv = ref([])
export const discoveredPeople = ref([])
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
            console.log(reqMetaData)
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
    return {
        fetchSearchResults
    }
}