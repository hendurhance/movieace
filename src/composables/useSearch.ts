export const useSearch = () => {
    const fetchSearchResults = async (query: string) => {
        let loading = ref(false)
        let error = ref("")
        let data = ref<>()
        try {
            loading.value = true
            const req = useAxios().get(`https://api.themoviedb.org/3/search/multi?query=${query}`)
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
    return {
        fetchSearchResults
    }
}