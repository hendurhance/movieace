import { ref } from "vue"
import { Movie } from "./useHighlights"
import useAxios from "./useAxios"
export interface Actor {
    adult: boolean,
    gender: number,
    id: number,
    known_for: Movie[],
    known_for_department: string,
    name: string,
    popularity: number,
    profile_path: string
}
interface ActorResponse {
    page: number,
    results: Actor[],
    total_pages: number,
    total_results: number
}
export const useActor = () => {
    const fetchTopActors = async (url: string = "https://api.themoviedb.org/3/trending/person/day" ) => {
        let loading = ref(false)
        let error = ref("")
        let data = ref<ActorResponse>()
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
        fetchTopActors
    }
}