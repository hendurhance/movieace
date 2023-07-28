import axios from 'axios'
const BASE_URL = import.meta.env.VITE_API_URL
const ACCESS_TOKEN = import.meta.env.VITE_API_ACCESS_TOKEN
const useAxios = () => {
    const axiosInstance = axios.create({
        baseURL: BASE_URL,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${ACCESS_TOKEN}`
        }
    })
    return axiosInstance
}
export default useAxios