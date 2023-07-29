import axios from 'axios'
const BASE_URL = import.meta.env.VITE_API_URL
const API_KEY = import.meta.env.VITE_API_KEY
const useAxios = () => {
    const axiosInstance = axios.create({
        baseURL: BASE_URL,
        params: {
            api_key: API_KEY
        },
        headers: {
            'Content-Type': 'application/json',
        }
    })
    return axiosInstance
}
export default useAxios