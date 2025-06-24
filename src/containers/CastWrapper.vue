<template>
    <div class="cast-wrapper">
        <div class="cast-wrapper-header">
            <div class="header-content">
                <h2>Cast</h2>
                <span class="item-count">{{ casts.length }} cast members</span>
            </div>
            <div class="navigation-controls">
                <button
                    class="nav-button prev-button"
                    @click="prevSlide"
                    :disabled="isBeginning"
                    :class="{ disabled: isBeginning }"
                >
                    <ArrowLeft stroke="currentColor" width="20" height="20" />
                </button>
                <button
                    class="nav-button next-button"
                    @click="nextSlide"
                    :disabled="isEnd"
                    :class="{ disabled: isEnd }"
                >
                    <ArrowRight stroke="currentColor" width="20" height="20" />
                </button>
            </div>
        </div>
        
        <div class="swiper-container">
            <Swiper 
                ref="swiperRef"
                :slides-per-view="slidesPerView"
                :space-between="spaceBetween"
                :breakpoints="breakpoints"
                @swiper="onSwiper"
                @slide-change="onSlideChange"
                class="cast-swiper"
            >
                <SwiperSlide v-for="cast in casts" :key="cast.id" class="cast-slide">
                    <div class="cast-item-wrapper">
                        <CastItem :cast="cast" />
                    </div>
                </SwiperSlide>
            </Swiper>
            
            <!-- Custom Navigation Dots -->
            <div class="navigation-dots" v-if="showDots">
                <button 
                    v-for="(_, index) in Math.ceil(casts.length / slidesPerView)" 
                    :key="index"
                    @click="goToSlide(index * slidesPerView)"
                    class="dot"
                    :class="{ active: currentSlideGroup === index }"
                ></button>
            </div>
        </div>
        
        <!-- Empty State -->
        <EmptyState v-if="casts.length === 0" 
            icon="🎭"
            :show-reset-button="false"
            title="No Cast Members Found"
            description="It seems like there are no cast members available for this movie or TV show."
        />
            
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, computed, onMounted } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import CastItem from '../components/layout/CastItem.vue';
import { Cast } from "../composables/useMovies";
import 'swiper/css';
import EmptyState from './EmptyState.vue';
import ArrowLeft from '../components/svg/outline/arrow-left.vue';
import ArrowRight from '../components/svg/outline/arrow-right.vue';

export default defineComponent({
    name: 'CastWrapper',
    components: {
        Swiper,
        SwiperSlide,
        CastItem,
        EmptyState,
        ArrowLeft,
        ArrowRight,
    },
    props: {
        title: {
            type: String,
            default: 'Cast'
        },
        casts: {
            type: Array as PropType<Cast[]>,
            default: () => []
        }
    },
    setup(props) {
        const swiperRef = ref<any>(null);
        const swiperInstance = ref<any>(null);
        const isBeginning = ref(true);
        const isEnd = ref(false);
        const currentSlide = ref(0);

        const breakpoints = {
            320: { slidesPerView: 2.2, spaceBetween: 10 },
            480: { slidesPerView: 3.2, spaceBetween: 15 },
            640: { slidesPerView: 4.2, spaceBetween: 15 },
            768: { slidesPerView: 4.5, spaceBetween: 20 },
            1024: { slidesPerView: 5.5, spaceBetween: 20 },
            1280: { slidesPerView: 6.5, spaceBetween: 25 },
            1536: { slidesPerView: 7.5, spaceBetween: 30 }
        };

        const slidesPerView = ref(6.5);
        const spaceBetween = ref(25);

        const currentSlideGroup = computed(() => {
            return Math.floor(currentSlide.value / slidesPerView.value);
        });

        const showDots = computed(() => {
            return props.casts.length > slidesPerView.value;
        });

        const onSwiper = (swiper: any) => {
            swiperInstance.value = swiper;
            updateNavigationState();
        };

        const onSlideChange = () => {
            if (swiperInstance.value) {
                currentSlide.value = swiperInstance.value.activeIndex;
                updateNavigationState();
            }
        };

        const updateNavigationState = () => {
            if (swiperInstance.value) {
                isBeginning.value = swiperInstance.value.isBeginning;
                isEnd.value = swiperInstance.value.isEnd;
            }
        };

        const prevSlide = () => {
            if (swiperInstance.value && !isBeginning.value) {
                swiperInstance.value.slidePrev();
            }
        };

        const nextSlide = () => {
            if (swiperInstance.value && !isEnd.value) {
                swiperInstance.value.slideNext();
            }
        };

        const goToSlide = (index: number) => {
            if (swiperInstance.value) {
                swiperInstance.value.slideTo(index);
            }
        };

        onMounted(() => {
            const updateSlidesPerView = () => {
                const width = window.innerWidth;
                if (width < 480) {
                    slidesPerView.value = 2.2;
                } else if (width < 640) {
                    slidesPerView.value = 3.2;
                } else if (width < 768) {
                    slidesPerView.value = 4.2;
                } else if (width < 1024) {
                    slidesPerView.value = 4.5;
                } else if (width < 1280) {
                    slidesPerView.value = 5.5;
                } else {
                    slidesPerView.value = 6.5;
                }
            };

            updateSlidesPerView();
            window.addEventListener('resize', updateSlidesPerView);

            return () => {
                window.removeEventListener('resize', updateSlidesPerView);
            };
        });

        return {
            swiperRef,
            prevSlide,
            nextSlide,
            goToSlide,
            onSwiper,
            onSlideChange,
            isBeginning,
            isEnd,
            currentSlideGroup,
            showDots,
            slidesPerView,
            spaceBetween,
            breakpoints
        };
    }
});
</script>

<style lang="scss" scoped>
.cast-wrapper {
    padding: 3rem 0;
    background-color: #081b27;
    overflow: hidden;

    @media screen and (max-width: 750px) {
        padding: 2rem 0;
    }

    .cast-wrapper-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 2rem;
        padding: 0 1rem;
        
        @media (max-width: 768px) {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
        }
        
        .header-content {
            display: flex;
            align-items: center;
            gap: 1rem;
            
            h2 {
                font-size: 2.5rem;
                font-weight: 700;
                color: #fff;
                margin: 0;
                position: relative;
                padding-left: 1rem;
                
                &::before {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 50%;
                    transform: translateY(-50%);
                    height: 70%;
                    width: 4px;
                    background: linear-gradient(135deg, #f1b722 0%, #e6a71a 100%);
                    border-radius: 2px;
                }

                @media screen and (max-width: 1185px) {
                    font-size: 2rem;
                }

                @media screen and (max-width: 768px) {
                    font-size: 1.5rem;
                }

                @media screen and (max-width: 576px) {
                    font-size: 1.25rem;
                    padding-left: 0;
                    
                    &::before {
                        display: none;
                    }
                }
            }
            
            .item-count {
                background: rgba(241, 183, 34, 0.1);
                color: #f1b722;
                padding: 0.5rem 1rem;
                border-radius: 20px;
                font-size: 0.9rem;
                font-weight: 500;
                border: 1px solid rgba(241, 183, 34, 0.3);
            }
        }
        
        .navigation-controls {
            display: flex;
            gap: 0.5rem;
            
            @media (max-width: 768px) {
                order: -1;
            }
        }
        
        .nav-button {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            border: 2px solid rgba(241, 183, 34, 0.3);
            background: rgba(241, 183, 34, 0.1);
            color: #f1b722;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s ease;
            
            &:hover:not(.disabled) {
                background: rgba(241, 183, 34, 0.2);
                border-color: rgba(241, 183, 34, 0.5);
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(241, 183, 34, 0.2);
            }
            
            &.disabled {
                opacity: 0.4;
                cursor: not-allowed;
                transform: none;
                box-shadow: none;
            }
            
            svg {
                transition: transform 0.3s ease;
            }
            
            &:hover:not(.disabled) svg {
                transform: scale(1.1);
            }
        }
    }
}

.swiper-container {
    position: relative;
    margin: 0 -1rem;
    padding: 0 1rem;
    
    .cast-swiper {
        overflow: visible;
        padding: 1rem 0 3rem 0;
        
        .cast-slide {
            height: auto;
            
            .cast-item-wrapper {
                position: relative;
                height: 100%;
                width: 100%;

                :deep(.cast-item) {
                    width: 100%;
                    height: auto;
                }
            }
        }
    }
    
    .navigation-dots {
        display: flex;
        justify-content: center;
        gap: 0.5rem;
        margin-top: 1.5rem;
        
        .dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            border: none;
            background: rgba(255, 255, 255, 0.3);
            cursor: pointer;
            transition: all 0.3s ease;
            
            &:hover {
                background: rgba(241, 183, 34, 0.6);
                transform: scale(1.2);
            }
            
            &.active {
                background: #f1b722;
                transform: scale(1.4);
            }
        }
    }
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    text-align: center;
    color: #8ea9bd;
    
    .empty-icon {
        font-size: 4rem;
        margin-bottom: 1rem;
        opacity: 0.7;
    }
    
    h3 {
        font-size: 1.5rem;
        color: #fff;
        margin: 0 0 0.5rem 0;
    }
    
    p {
        font-size: 1rem;
        margin: 0;
        max-width: 400px;
        line-height: 1.5;
    }
}

@media (max-width: 576px) {
    .cast-wrapper {
        .cast-wrapper-header {
            .header-content {
                flex-direction: column;
                gap: 0.5rem;
            }
        }
    }
    
    .swiper-container .cast-swiper {
        padding: 0.5rem 0 1.5rem 0;
    }
}
</style>