
const IMAGE_BASEURL = import.meta.env.VITE_IMAGE_BASE_URL;

const selectSize = (size: "medium" | "large" | "small") => {
    const sizeOptions = {
        small: "w300",
        medium: "w500",
        large: "w780",
    }
    return sizeOptions[size] || sizeOptions.medium
}
export const useWebImage = (url: string, size: "medium" | "large" | "small" = "medium") => {
    let imgSize = selectSize(size)
    return `${IMAGE_BASEURL}${imgSize}/${url}`
}