<template>
    <div class="genres-section">
        <div class="genres-header">
            <h3 class="genres-title">Browse by Genre</h3>
            <p class="genres-subtitle">Discover {{ type }} by your favorite categories</p>
            <button 
                v-if="activeGenres.length > 0" 
                @click="clearAllGenres"
                class="clear-all-btn"
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                Clear All ({{ activeGenres.length }})
            </button>
        </div>
        
        <!-- Scroll Controls -->
        <div class="genre-scroll-container">
            <button 
                @click="scrollLeft"
                class="scroll-btn scroll-left"
                :class="{ 'visible': canScrollLeft }"
                ref="scrollLeftBtn"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
            
            <div 
                class="genre-grid" 
                ref="genreGrid"
                @scroll="checkScrollButtons"
            >
                <button
                    v-for="genre in genres" 
                    :key="genre.id"
                    @click="handleGenreClick(genre)"
                    :class="[
                        'genre-tag',
                        { 'active': isGenreActive(genre.id) }
                    ]"
                >
                    <span class="genre-name">{{ genre.name }}</span>
                    <svg 
                        v-if="isGenreActive(genre.id)"
                        class="check-icon" 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill="none"
                    >
                        <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
            </div>
            
            <button 
                @click="scrollRight"
                class="scroll-btn scroll-right"
                :class="{ 'visible': canScrollRight }"
                ref="scrollRightBtn"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
        </div>
        
        <div v-if="activeGenres.length > 0" class="active-filters">
            <span class="filters-label">Active filters:</span>
            <div class="active-genre-tags">
                <span 
                    v-for="genreId in activeGenres" 
                    :key="genreId"
                    class="active-genre-chip"
                >
                    {{ getGenreName(genreId) }}
                    <button 
                        @click="removeGenre(genreId)"
                        class="remove-genre-btn"
                    >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                    </button>
                </span>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, onMounted, nextTick } from 'vue';
import { Genre } from '../../composables/useGenre';

export default defineComponent({
    name: 'GenreLists',
    props: {
        genres: {
            type: Array as PropType<Genre[]>,
            required: true
        },
        activeGenres: {
            type: Array as PropType<number[]>,
            default: () => []
        },
        type: {
            type: String as PropType<'movies' | 'tv shows'>,
            default: 'movie'
        }
    },
    emits: ['genreClick', 'clearAll'],
    setup(props, { emit }) {
        const genreGrid = ref<HTMLElement>();
        const canScrollLeft = ref(false);
        const canScrollRight = ref(true);

        const handleGenreClick = (genre: Genre) => {
            emit('genreClick', genre);
        };

        const isGenreActive = (genreId: number): boolean => {
            return props.activeGenres.includes(genreId);
        };

        const getGenreName = (genreId: number): string => {
            const genre = props.genres.find(g => g.id === genreId);
            return genre?.name || '';
        };

        const removeGenre = (genreId: number) => {
            const genre = props.genres.find(g => g.id === genreId);
            if (genre) {
                emit('genreClick', genre);
            }
        };

        const clearAllGenres = () => {
            emit('clearAll');
        };

        const scrollLeft = () => {
            if (genreGrid.value) {
                genreGrid.value.scrollBy({
                    left: -300,
                    behavior: 'smooth'
                });
            }
        };

        const scrollRight = () => {
            if (genreGrid.value) {
                genreGrid.value.scrollBy({
                    left: 300,
                    behavior: 'smooth'
                });
            }
        };

        const checkScrollButtons = () => {
            if (genreGrid.value) {
                const { scrollLeft: left, scrollWidth, clientWidth } = genreGrid.value;
                canScrollLeft.value = left > 0;
                canScrollRight.value = left < scrollWidth - clientWidth - 1;
            }
        };

        onMounted(async () => {
            await nextTick();
            checkScrollButtons();

            window.addEventListener('resize', checkScrollButtons);
        });

        return {
            genreGrid,
            canScrollLeft,
            canScrollRight,
            handleGenreClick,
            isGenreActive,
            getGenreName,
            removeGenre,
            clearAllGenres,
            scrollLeft,
            scrollRight,
            checkScrollButtons
        };
    }
});
</script>

<style lang="scss" scoped>
.genres-section {
    margin: 3rem 0;
    padding: 2rem;
    background: linear-gradient(135deg, rgba(15, 20, 25, 0.6) 0%, rgba(26, 35, 50, 0.4) 100%);
    border-radius: 24px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    position: relative; /* For fade effect positioning */
    
    @media (max-width: 768px) {
        margin: 2rem 0;
        padding: 1.5rem;
        border-radius: 16px;
    }
}

.genres-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1rem;
    
    @media (max-width: 768px) {
        flex-direction: column;
        text-align: center;
        margin-bottom: 1.5rem;
    }
}

.genres-title {
    font-size: 1.8rem;
    font-weight: 700;
    color: #ffffff;
    margin: 0;
    
    @media (max-width: 768px) {
        font-size: 1.5rem;
    }
}

.genres-subtitle {
    font-size: 1rem;
    color: #8ea9bd;
    margin: 0;
    font-weight: 400;
    
    @media (max-width: 768px) {
        font-size: 0.9rem;
        margin-top: 0.5rem;
    }
}

.clear-all-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 50px;
    color: #ef4444;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
        background: rgba(239, 68, 68, 0.2);
        border-color: rgba(239, 68, 68, 0.5);
        transform: translateY(-2px);
    }
    
    svg {
        width: 14px;
        height: 14px;
    }
}

/* Scroll container and controls */
.genre-scroll-container {
    position: relative;
    margin-bottom: 1.5rem;
}

.scroll-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 40px;
    height: 40px;
    background: rgba(241, 183, 34, 0.9);
    border: none;
    border-radius: 50%;
    color: #fff;
    cursor: pointer;
    z-index: 3;
    transition: all 0.3s ease;
    opacity: 0;
    visibility: hidden;
    
    &.visible {
        opacity: 1;
        visibility: visible;
    }
    
    &:hover {
        background: #f1b722;
        transform: translateY(-50%) scale(1.1);
        box-shadow: 0 5px 15px rgba(241, 183, 34, 0.4);
    }
    
    &.scroll-left {
        left: -50px;
        
        @media (max-width: 768px) {
            left: -35px;
        }
    }
    
    &.scroll-right {
        right: -50px;
        
        @media (max-width: 768px) {
            right: -35px;
        }
    }
    
    @media (max-width: 768px) {
        width: 35px;
        height: 35px;
        
        svg {
            width: 16px;
            height: 16px;
        }
    }
}

.genre-grid {
    display: flex;
    gap: 1rem;
    overflow-x: auto;
    padding: 0.5rem 0 1.5rem 0;
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
    
    /* Hide scrollbar but keep functionality */
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE and Edge */
    
    &::-webkit-scrollbar {
        display: none; /* Chrome, Safari, Opera */
    }
    
    @media (max-width: 768px) {
        gap: 0.75rem;
    }
}

.genre-tag {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 1rem 1.5rem;
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    color: #ffffff;
    font-size: 0.95rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    white-space: nowrap;
    flex-shrink: 0; /* Prevent shrinking in flex container */
    min-width: 120px; /* Minimum width for consistency */
    
    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(241, 183, 34, 0.1), transparent);
        transition: left 0.5s ease;
    }
    
    &:hover {
        border-color: rgba(241, 183, 34, 0.4);
        background: rgba(241, 183, 34, 0.1);
        transform: translateY(-3px);
        box-shadow: 0 8px 25px rgba(241, 183, 34, 0.2);
        
        &::before {
            left: 100%;
        }
    }
    
    &.active {
        background: linear-gradient(135deg, rgba(241, 183, 34, 0.2) 0%, rgba(230, 167, 26, 0.3) 100%);
        border-color: #f1b722;
        color: #f1b722;
        box-shadow: 
            0 5px 20px rgba(241, 183, 34, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
        
        .check-icon {
            animation: checkPop 0.3s ease-out;
        }
    }
    
    @media (max-width: 768px) {
        padding: 0.875rem 1.25rem;
        font-size: 0.85rem;
        min-width: 100px;
    }
    
    @media (max-width: 480px) {
        padding: 0.75rem 1rem;
        font-size: 0.8rem;
        min-width: 90px;
    }
}

.genre-name {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.check-icon {
    flex-shrink: 0;
    width: 16px;
    height: 16px;
    stroke-width: 3;
}

.active-filters {
    padding-top: 1.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    
    .filters-label {
        display: block;
        font-size: 0.9rem;
        color: #8ea9bd;
        font-weight: 500;
        margin-bottom: 1rem;
    }
}

.active-genre-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
}

.active-genre-chip {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: rgba(241, 183, 34, 0.15);
    border: 1px solid rgba(241, 183, 34, 0.3);
    border-radius: 50px;
    color: #f1b722;
    font-size: 0.85rem;
    font-weight: 500;
    
    .remove-genre-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        background: rgba(239, 68, 68, 0.2);
        border: none;
        border-radius: 50%;
        color: #ef4444;
        cursor: pointer;
        transition: all 0.2s ease;
        
        &:hover {
            background: rgba(239, 68, 68, 0.3);
            transform: scale(1.1);
        }
        
        svg {
            width: 10px;
            height: 10px;
        }
    }
}

@keyframes checkPop {
    0% {
        transform: scale(0);
        opacity: 0;
    }
    50% {
        transform: scale(1.2);
    }
    100% {
        transform: scale(1);
        opacity: 1;
    }
}
</style>