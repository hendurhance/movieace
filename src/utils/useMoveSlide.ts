import { ref } from 'vue';

const currentIndex = ref(0);

export const moveSlide = (direction: 'prev' | 'next') => {
    const wrapper = document.querySelector('.swiper-wrapper') as HTMLElement;
    if (wrapper) {
        const slideWidth = wrapper.clientWidth;
        currentIndex.value = direction === 'next' ? currentIndex.value + 1 : currentIndex.value - 1;
        currentIndex.value = Math.min(Math.max(currentIndex.value, 0), wrapper.children.length - 1);

        const maxVisibleSlides = window.innerWidth <= 767 ? 1 : window.innerWidth <= 768 ? 2 : 4;
        if (currentIndex.value > Math.floor(wrapper.children.length / maxVisibleSlides)) {
            return;
        } else {
            const newPosition = (-currentIndex.value * slideWidth) / 2;
            wrapper.style.transform = `translate3d(${newPosition}px, 0, 0)`;
            wrapper.style.transition = 'transform 0.3s ease-in-out';
        }
    }
};