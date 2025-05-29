<template>
    <div class="movie-pictures-wrapper">
        <div class="movie-picture-header">
            <div class="header-content">
                <h2>{{ title }}</h2>
                <span class="item-count">{{ pictures.length }} images</span>
            </div>
            <div class="view-controls">
                <button 
                    @click="toggleViewMode" 
                    class="view-toggle-btn"
                    :class="{ active: viewMode === 'masonry' }"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="3" width="7" height="7" stroke="currentColor" stroke-width="2" fill="none"/>
                        <rect x="14" y="3" width="7" height="7" stroke="currentColor" stroke-width="2" fill="none"/>
                        <rect x="3" y="14" width="7" height="7" stroke="currentColor" stroke-width="2" fill="none"/>
                        <rect x="14" y="14" width="7" height="7" stroke="currentColor" stroke-width="2" fill="none"/>
                    </svg>
                    <span>{{ viewMode === 'grid' ? 'Masonry' : 'Grid' }}</span>
                </button>
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="loading-state">
            <div class="loading-spinner"></div>
            <p>Loading images...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="pictures.length === 0" class="empty-state">
            <div class="empty-icon">🖼️</div>
            <h3>No images available</h3>
            <p>Images for this content are not currently available.</p>
        </div>

        <!-- Pictures Grid -->
        <div v-else class="movie-pictures" :class="viewMode">
            <div 
                v-for="(picture, idx) in pictures" 
                :key="picture.iso_639_1 || idx" 
                class="picture-item"
                @click="openLightbox(idx)"
            >
                <div class="picture-container">
                    <img 
                        :src="useWebImage(picture.file_path,'medium')" 
                        :alt="`Movie image ${idx + 1}`"  
                        loading="lazy"
                        @load="onImageLoad"
                        @error="onImageError"
                    />
                    <div class="picture-overlay">
                        <div class="zoom-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
                                <path d="21 21l-4.35-4.35" stroke="currentColor" stroke-width="2"/>
                                <line x1="11" y1="8" x2="11" y2="14" stroke="currentColor" stroke-width="2"/>
                                <line x1="8" y1="11" x2="14" y2="11" stroke="currentColor" stroke-width="2"/>
                            </svg>
                        </div>
                        <div class="picture-info">
                            <span class="picture-number">{{ idx + 1 }} / {{ pictures.length }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Lightbox Modal -->
        <div v-if="showLightbox" class="lightbox-overlay" @click="closeLightbox">
            <div class="lightbox-container">
                <button class="lightbox-close" @click="closeLightbox">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
                        <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
                    </svg>
                </button>
                
                <button class="lightbox-nav prev" @click="previousImage" :disabled="currentImageIndex === 0">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2"/>
                    </svg>
                </button>
                
                <div class="lightbox-content" @click.stop>
                    <img 
                        :src="useWebImage(pictures[currentImageIndex]?.file_path, 'large')" 
                        :alt="`Movie image ${currentImageIndex + 1}`"
                        class="lightbox-image"
                    />
                    <div class="lightbox-info">
                        <span class="image-counter">{{ currentImageIndex + 1 }} / {{ pictures.length }}</span>
                    </div>
                </div>
                
                <button class="lightbox-nav next" @click="nextImage" :disabled="currentImageIndex === pictures.length - 1">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2"/>
                    </svg>
                </button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted } from 'vue';
import { Image } from '../composables/useMovies';
import { useWebImage } from '../utils/useWebImage';

export default defineComponent({
    name: 'MoviePicture',
    props: {
        pictures: {
            type: Array as () => Image[],
            default: () => []
        },
        title: {
            type: String,
            default: 'Movie Pictures'
        },
        isLoading: {
            type: Boolean,
            default: false
        }
    },
    setup(props) {
        const viewMode = ref<'grid' | 'masonry'>('grid');
        const showLightbox = ref(false);
        const currentImageIndex = ref(0);
        const loadedImages = ref(0);

        const toggleViewMode = () => {
            viewMode.value = viewMode.value === 'grid' ? 'masonry' : 'grid';
        };

        const openLightbox = (index: number) => {
            currentImageIndex.value = index;
            showLightbox.value = true;
            document.body.style.overflow = 'hidden';
        };

        const closeLightbox = () => {
            showLightbox.value = false;
            document.body.style.overflow = 'auto';
        };

        const nextImage = () => {
            if (currentImageIndex.value < props.pictures.length - 1) {
                currentImageIndex.value++;
            }
        };

        const previousImage = () => {
            if (currentImageIndex.value > 0) {
                currentImageIndex.value--;
            }
        };

        const onImageLoad = () => {
            loadedImages.value++;
        };

        const onImageError = (event: Event) => {
            const img = event.target as HTMLImageElement;
            img.style.display = 'none';
        };

        const handleKeyPress = (event: KeyboardEvent) => {
            if (!showLightbox.value) return;
            
            switch (event.key) {
                case 'Escape':
                    closeLightbox();
                    break;
                case 'ArrowLeft':
                    previousImage();
                    break;
                case 'ArrowRight':
                    nextImage();
                    break;
            }
        };

        onMounted(() => {
            document.addEventListener('keydown', handleKeyPress);
        });

        onUnmounted(() => {
            document.removeEventListener('keydown', handleKeyPress);
            document.body.style.overflow = 'auto';
        });

        return {
            viewMode,
            showLightbox,
            currentImageIndex,
            toggleViewMode,
            openLightbox,
            closeLightbox,
            nextImage,
            previousImage,
            onImageLoad,
            onImageError,
            useWebImage
        };
    }
});
</script>

<style scoped lang="scss">
.movie-pictures-wrapper {
    padding: 3rem 0;
    overflow: hidden;

    .movie-picture-header {
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
                    padding-left: 0;
                    
                    &::before {
                        display: none;
                    }
                }

                @media screen and (max-width: 576px) {
                    font-size: 1.25rem;
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
        
        .view-controls {
            .view-toggle-btn {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                background: rgba(255, 255, 255, 0.08);
                border: 1px solid rgba(255, 255, 255, 0.1);
                color: #fff;
                padding: 0.75rem 1rem;
                border-radius: 12px;
                cursor: pointer;
                transition: all 0.3s ease;
                font-size: 0.9rem;
                
                &:hover {
                    background: rgba(241, 183, 34, 0.1);
                    border-color: rgba(241, 183, 34, 0.3);
                    color: #f1b722;
                }
                
                &.active {
                    background: rgba(241, 183, 34, 0.2);
                    border-color: rgba(241, 183, 34, 0.5);
                    color: #f1b722;
                }
            }
        }
    }
}

.loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    color: #8ea9bd;
    
    .loading-spinner {
        width: 40px;
        height: 40px;
        border: 3px solid rgba(241, 183, 34, 0.3);
        border-top: 3px solid #f1b722;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 1rem;
    }
    
    p {
        font-size: 1rem;
        margin: 0;
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

.movie-pictures {
    display: grid;
    gap: 1.5rem;
    margin: 0 1rem;
    
    &.grid {
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        
        .picture-item {
            aspect-ratio: 16/9;
        }
    }
    
    &.masonry {
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        grid-auto-rows: 10px;
        
        .picture-item {
            grid-row-end: span 30;
            
            &:nth-child(5n) {
                grid-row-end: span 40;
            }
            
            &:nth-child(7n) {
                grid-row-end: span 25;
            }
        }
    }
    
    .picture-item {
        position: relative;
        cursor: pointer;
        border-radius: 1rem;
        overflow: hidden;
        background: rgba(255, 255, 255, 0.02);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        transition: all 0.3s ease;
        
        &:hover {
            transform: translateY(-8px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            border-color: rgba(241, 183, 34, 0.3);
            
            .picture-overlay {
                opacity: 1;
            }
            
            img {
                transform: scale(1.05);
            }
        }
    }
    
    .picture-container {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
        
        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: center;
            transition: transform 0.4s ease;
        }
        
        .picture-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.7));
            opacity: 0;
            transition: opacity 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            gap: 1rem;
            
            .zoom-icon {
                width: 60px;
                height: 60px;
                background: rgba(241, 183, 34, 0.9);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #000;
                transform: scale(0.8);
                transition: transform 0.3s ease;
            }
            
            .picture-info {
                .picture-number {
                    background: rgba(0, 0, 0, 0.8);
                    color: #fff;
                    padding: 0.5rem 1rem;
                    border-radius: 20px;
                    font-size: 0.85rem;
                    font-weight: 500;
                }
            }
        }
    }
}

.lightbox-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.95);
    backdrop-filter: blur(10px);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    
    .lightbox-container {
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        
        .lightbox-close {
            position: absolute;
            top: 2rem;
            right: 2rem;
            width: 48px;
            height: 48px;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            color: #fff;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            z-index: 10;
            
            &:hover {
                background: rgba(241, 183, 34, 0.2);
                border-color: rgba(241, 183, 34, 0.5);
            }
        }
        
        .lightbox-nav {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            width: 60px;
            height: 60px;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            color: #fff;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            z-index: 10;
            
            &:hover:not(:disabled) {
                background: rgba(241, 183, 34, 0.2);
                border-color: rgba(241, 183, 34, 0.5);
            }
            
            &:disabled {
                opacity: 0.3;
                cursor: not-allowed;
            }
            
            &.prev {
                left: 2rem;
            }
            
            &.next {
                right: 2rem;
            }
        }
        
        .lightbox-content {
            max-width: 90%;
            max-height: 90%;
            position: relative;
            
            .lightbox-image {
                max-width: 100%;
                max-height: 100%;
                object-fit: contain;
                border-radius: 1rem;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            }
            
            .lightbox-info {
                position: absolute;
                bottom: -3rem;
                left: 50%;
                transform: translateX(-50%);
                
                .image-counter {
                    background: rgba(0, 0, 0, 0.8);
                    color: #fff;
                    padding: 0.75rem 1.5rem;
                    border-radius: 25px;
                    font-size: 1rem;
                    font-weight: 500;
                }
            }
        }
    }
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
    .movie-pictures {
        margin: 0 0.5rem;
        gap: 1rem;
        
        &.grid {
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        }
        
        &.masonry {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        }
    }
    
    .lightbox-overlay .lightbox-container {
        padding: 1rem;
        
        .lightbox-close {
            top: 1rem;
            right: 1rem;
            width: 40px;
            height: 40px;
        }
        
        .lightbox-nav {
            width: 50px;
            height: 50px;
            
            &.prev {
                left: 1rem;
            }
            
            &.next {
                right: 1rem;
            }
        }
    }
}

@media (max-width: 480px) {
    .movie-pictures {
        &.grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        }
        
        &.masonry {
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        }
    }
}
</style>