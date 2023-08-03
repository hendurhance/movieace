
const IMAGE_BASEURL = import.meta.env.VITE_IMAGE_BASE_URL;

const selectSize = (si: "medium" | "large" | "small") => {
    let size = "w500"
    switch (si){
        case "small":
           size=  "w300"
           break

        case "large":
            size = "w780"
           break

        case "medium":
           size =  "w500"
           break
        default :
        size =   "w500"
        break

    }
    return size

}
export const useWebImage = (url: string, size: "medium" | "large" | "small" = "medium") => {
    let imgSize = selectSize(size)
    return `${IMAGE_BASEURL}${imgSize}/${url}`
}