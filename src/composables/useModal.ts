import { Component, ref } from 'vue';

export const modalOpen = ref(false)
export const compRef = ref<Component>()
export const modalTitle = ref("")
export const modalOptions = ref<any>()
export const useModal = (comp: Component, options?: {
    [key: string] : any
}) => {
    modalOpen.value = true
    compRef.value = comp
    modalTitle.value = options?.title || ""
    modalOptions.value = options?.props
    // provide('modalOpen', {
    //     slot: comp,
    //     options
    // })
    // return {
    //     modalOpen,
    // }
}
export const closeModal = (data: any) => {
    modalOpen.value = false
    return data
}