import { computed, reactive, ref } from "vue"
import useAxios from "./useAxios"
import { MovieResponse } from "./useMovies"

export interface Movie {
    value: MovieResponse | undefined
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
    popularity: number,
    release_date: string,
    video: boolean,
    vote_average: number,
    vote_count: number
}

export const currentHighlightTitle = ref<"featured" | "popular" | "new">("featured")

export const highLightOptions = reactive<
    Record<"featured" | "popular" | "new", {
        title: string,
        url: string,
        data: Movie[]
    }>
>({
    featured: {
        title: "Featured",
        url: "https://api.themoviedb.org/3/trending/movie/day",
        data: []
    },
    popular: {
        title: "Popular",
        url: "https://api.themoviedb.org/3/movie/popular",
        data: []
    },
    new: {
        title: "New",
        url: "https://api.themoviedb.org/3/movie/now_playing",
        data: []
    }
})

export const currentHighLightDetails = computed(() => {
    return highLightOptions[currentHighlightTitle.value]
})

export const useHighlights = () => {
    const loading = ref(false)
    const error = ref("")

    const fetchHighlights = async (highlightType?: "featured" | "popular" | "new") => {
        const targetHighlight = highlightType || currentHighlightTitle.value

        try {
            loading.value = true
            error.value = ""

            const req = useAxios().get(highLightOptions[targetHighlight].url)
            const res = (await req).data

            if (res.results && res.results.length > 0) {
                highLightOptions[targetHighlight].data = res.results
            } else {
                error.value = "No data found"
            }
        } catch (err: any) {
            error.value = err.message || "Failed to fetch highlights"
            console.error("Error fetching highlights:", err)
        } finally {
            loading.value = false
        }

        return {
            loading: loading.value,
            error: error.value,
            data: highLightOptions[targetHighlight].data
        }
    }

    const handleUpdateHighlight = async (highlight: "featured" | "popular" | "new") => {
        currentHighlightTitle.value = highlight
        if (highLightOptions[highlight].data.length === 0) {
            return await fetchHighlights(highlight)
        } else {
            // If data is already available, just return it
            return {
                loading: loading.value,
                error: error.value,
                data: highLightOptions[highlight].data
            }
        }
    }

    // Fetch all highlights at once (useful for initial load)
    const fetchAllHighlights = async () => {
        try {
            loading.value = true
            error.value = ""

            const promises = Object.keys(highLightOptions).map(async (key) => {
                const highlightKey = key as "featured" | "popular" | "new"
                try {
                    const req = useAxios().get(highLightOptions[highlightKey].url)
                    const res = (await req).data
                    if (res.results && res.results.length > 0) {
                        highLightOptions[highlightKey].data = res.results
                    }
                } catch (err) {
                    console.error(`Error fetching ${highlightKey}:`, err)
                }
            })

            await Promise.all(promises)
        } catch (err: any) {
            error.value = err.message || "Failed to fetch highlights"
        } finally {
            loading.value = false
        }
    }

    return {
        fetchHighlights,
        fetchAllHighlights,
        handleUpdateHighlight,
        loading,
        error
    }
}