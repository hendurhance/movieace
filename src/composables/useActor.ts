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
export interface ActorDetails extends Actor {
    also_known_as: string[],
    biography: string,
    birthday: string,
    deathday: string,
    homepage: string,
    imdb_id: string,
    place_of_birth: string
}
export interface ActorImages {
    profiles: {
        aspect_ratio: number,
        file_path: string,
        height: number,
        iso_639_1: string,
        vote_average: number,
        vote_count: number,
        width: number
    }[],
    id: number
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
    const fetchActorDetails = async (id: number) => {
        let loading = ref(false)
        let error = ref("")
        let data = ref<ActorDetails>()
        try {
            loading.value = true
            const req = useAxios().get(`https://api.themoviedb.org/3/person/${id}`)
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
    const fetchActorImages = async (id: number) => {
        let loading = ref(false)
        let error = ref("")
        let data = ref<ActorImages>()
        try {
            loading.value = true
            const req = useAxios().get(`https://api.themoviedb.org/3/person/${id}/images`)
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
        fetchTopActors,
        fetchActorDetails,
        fetchActorImages
    }
}