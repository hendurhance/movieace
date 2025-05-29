<template>
    <div class="known-for-wrapper">
        <div class="known-for-header">
            <div class="header-content">
                <h2>Known For</h2>
                <span class="item-count">{{ movieItems.length }} credits</span>
            </div>
            <div class="navigation-controls">
                <button 
                    class="nav-button prev-button" 
                    @click="prevSlide"
                    :disabled="isBeginning"
                    :class="{ disabled: isBeginning }"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
                <button 
                    class="nav-button next-button" 
                    @click="nextSlide"
                    :disabled="isEnd"
                    :class="{ disabled: isEnd }"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
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
                class="known-for-swiper"
            >
                <SwiperSlide v-for="item in movieItems" :key="item.id" class="known-for-slide">
                    <div class="movie-item-wrapper">
                        <MovieItem 
                            :title="getMovieOrTVTitle(item)" 
                            :image="item.poster_path" 
                            :movie-id="item.id"
                            :rating="item.vote_average" 
                            :categories="item.genre_ids" 
                            :type="getItemType(item)"
                            :adult="item.adult"
                        />
                        <div class="item-meta">
                            <span class="media-type-badge">
                                {{ item.media_type === 'movie' ? 'Movie' : 'TV Show' }}
                            </span>
                            <span class="release-year" v-if="getReleaseYear(item)">
                                {{ getReleaseYear(item) }}
                            </span>
                        </div>
                    </div>
                </SwiperSlide>
            </Swiper>
            
            <!-- Custom Navigation Dots -->
            <div class="navigation-dots" v-if="showDots">
                <button 
                    v-for="(_, index) in Math.ceil(movieItems.length / slidesPerView)" 
                    :key="index"
                    @click="goToSlide(index * slidesPerView)"
                    class="dot"
                    :class="{ active: currentSlideGroup === index }"
                ></button>
            </div>
        </div>
        
        <!-- Empty State -->
        <div v-if="movieItems.length === 0" class="empty-state">
            <div class="empty-icon">🎭</div>
            <h3>No credits available</h3>
            <p>This actor doesn't have any known credits in our database yet.</p>
        </div>
    </div>
</template>

<script lang="ts">
import { PropType, defineComponent, ref, computed, onMounted } from 'vue';
import MovieItem from '../components/layout/MovieItem.vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Movie } from '../composables/useHighlights';
import { TVShowType } from '../composables/useTvShows';
import 'swiper/css';

export default defineComponent({
    name: 'KnownFor',
    components: {
        MovieItem,
        Swiper,
        SwiperSlide,
    },
    props: {
        movieItems: {
            type: Array as PropType<Movie[] | TVShowType[]>,
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
            320: { slidesPerView: 1.2, spaceBetween: 15 },
            480: { slidesPerView: 2.2, spaceBetween: 15 },
            640: { slidesPerView: 2.5, spaceBetween: 20 },
            768: { slidesPerView: 3.2, spaceBetween: 20 },
            1024: { slidesPerView: 4.2, spaceBetween: 25 },
            1280: { slidesPerView: 5.2, spaceBetween: 30 },
            1536: { slidesPerView: 6.2, spaceBetween: 30 }
        };

        const slidesPerView = ref(5.2);
        const spaceBetween = ref(30);

        const currentSlideGroup = computed(() => {
            return Math.floor(currentSlide.value / slidesPerView.value);
        });

        const showDots = computed(() => {
            return props.movieItems.length > slidesPerView.value;
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

        const getMovieOrTVTitle = (item: any) => {
            if (item.media_type === 'movie') {
                return item.title || item.original_title;
            } else {
                return item.name || item.original_name;
            }
        };

        const getItemType = (item: any): 'movie' | 'tv' => {
            return item.media_type === 'movie' ? 'movie' : 'tv';
        };

        const getReleaseYear = (item: any): string => {
            const date = item.release_date || item.first_air_date;
            if (date) {
                return new Date(date).getFullYear().toString();
            }
            return '';
        };

        onMounted(() => {
            const updateSlidesPerView = () => {
                const width = window.innerWidth;
                if (width < 480) {
                    slidesPerView.value = 1.2;
                } else if (width < 640) {
                    slidesPerView.value = 2.2;
                } else if (width < 768) {
                    slidesPerView.value = 2.5;
                } else if (width < 1024) {
                    slidesPerView.value = 3.2;
                } else if (width < 1280) {
                    slidesPerView.value = 4.2;
                } else {
                    slidesPerView.value = 5.2;
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
            breakpoints,
            getMovieOrTVTitle,
            getItemType,
            getReleaseYear
        };
    }
});
</script>

<style scoped lang="scss">
.known-for-wrapper {
    padding: 3rem 0;
    
    .known-for-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 2rem;
        
        @media (max-width: 768px) {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
        }
        
        .header-content {
            display: flex;
            align-items: baseline;
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
                
                @media (max-width: 768px) {
                    font-size: 2rem;
                }
                
                @media (max-width: 480px) {
                    font-size: 1.5rem;
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
    
    .known-for-swiper {
        overflow: visible;
        padding: 1rem 0 2rem 0;
        
        .known-for-slide {
            height: auto;
            
            .movie-item-wrapper {
                position: relative;
                height: 100%;
                
                .item-meta {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 1rem;
                    
                    .media-type-badge {
                        background: rgba(241, 183, 34, 0.2);
                        color: #f1b722;
                        padding: 0.25rem 0.75rem;
                        border-radius: 12px;
                        font-size: 0.75rem;
                        font-weight: 600;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    }
                    
                    .release-year {
                        color: #8ea9bd;
                        font-size: 0.85rem;
                        font-weight: 500;
                    }
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
    .known-for-wrapper {
        padding: 2rem 0;
        
        .known-for-header {
            .header-content {
                flex-direction: column;
                gap: 0.5rem;
                
                h2 {
                    padding-left: 0;
                    
                    &::before {
                        display: none;
                    }
                }
            }
        }
    }
    
    .swiper-container .known-for-swiper {
        padding: 0.5rem 0 1.5rem 0;
    }
}
</style>