<template>
    <div class="featured-movie">
        <!-- Background Image with Parallax Effect -->
        <div class="featured-bg">
            <img 
                :src="fullPathImage" 
                :alt="`${name} banner`" 
                loading="lazy"
                class="featured-image"
            >
            <div class="image-overlay"></div>
        </div>

        <!-- Floating Particles -->
        <div class="floating-particles">
            <div class="particle" v-for="n in 8" :key="n"></div>
        </div>

        <!-- Main Content -->
        <div class="featured-content">
            <div class="content-wrapper">
                <!-- Rating Badge -->
                <div class="rating-badge">
                    <div class="rating-icon">
                        <Star :stroke="'currentColor'" fill="currentColor" />
                    </div>
                    <span class="rating-number">{{ rating.toFixed(1) }}</span>
                </div>

                <!-- Movie Title -->
                <h1 class="movie-title">{{ name }}</h1>

                <!-- Movie Info -->
                <div class="movie-info">
                    <div class="info-row">
                        <RatingStar :count="Math.round(rating / 2)" :max="5" />
                        <div class="info-divider"></div>
                        <div class="genre-tags">
                            <span 
                                v-for="genre in displayGenres" 
                                :key="genre" 
                                class="genre-tag"
                            >
                                {{ genre }}
                            </span>
                        </div>
                    </div>
                    
                    <div class="info-row secondary">
                        <div class="release-date">
                            <Clock :stroke="'currentColor'" />
                            <span>{{ fullDate }}</span>
                        </div>
                    </div>
                </div>

                <!-- Movie Description -->
                <p class="movie-description">{{ truncatedDetails }}</p>

                <!-- Action Buttons -->
                <div class="action-buttons">
                    <router-link :to="`/movie/${movieId}`" class="primary-button">
                        <Play :stroke="'currentColor'" fill="currentColor" />
                        <span>Watch Now</span>
                    </router-link>
                    <button class="secondary-button" @click="toggleWatchlist">
                        <Bookmark :stroke="'currentColor'" />
                        <span>{{ inWatchlist ? 'Remove' : 'Add to Watchlist' }}</span>
                    </button>
                </div>
            </div>
        </div>

        <!-- Scroll Indicator -->
        <div class="scroll-indicator">
            <div class="scroll-line"></div>
            <ChevronDown :stroke="'currentColor'" />
        </div>
    </div>
</template>

<script lang="ts">
import { PropType, computed, defineComponent, ref, onMounted } from 'vue';
import Clock from '../../components/svg/outline/clock.vue';
import Star from '../../components/svg/solid/star.vue';
import Play from '../../components/svg/solid/play.vue';
import Bookmark from '../../components/svg/outline/bookmark.vue';
import ChevronDown from '../../components/svg/outline/chevron-down.vue';
import RatingStar from '../../containers/RatingStar.vue';
import { useGenresList } from '../../composables/useGenresList';
import { toggleWatchlistItem, isInWatchlist } from '../../composables/useWatchlist';

export default defineComponent({
    name: 'FeaturedMovie',
    components: {
        Clock,
        Star,
        Play,
        Bookmark,
        ChevronDown,
        RatingStar
    },
    props: {
        movieId: {
            type: Number,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        details: {
            type: String,
            required: true
        },
        image: {
            type: String,
            required: true
        },
        rating: {
            type: Number,
            required: true
        },
        categories: {
            type: Array as PropType<number[]>,
            required: true
        },
        imgSize: {
            type: String,
            default: 'original'
        },
        date: {
            type: String,
            required: true
        }
    },
    setup(props) {
        const IMAGE_BASEURL = import.meta.env.VITE_IMAGE_BASE_URL;
        const categoryNames = ref('');
        const displayGenres = ref<string[]>([]);

        const fullPathImage = computed(() => {
            return `${IMAGE_BASEURL}${props.imgSize}/${props.image}`;
        });

        const fullDate = computed(() => {
            return new Date(props.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        });

        const truncatedDetails = computed(() => {
            return props.details.length > 200 
                ? props.details.substring(0, 200) + '...' 
                : props.details;
        });

        const { getGenresList } = useGenresList(props.categories.slice(0, 3));

        const inWatchlist = computed(() => isInWatchlist(props.movieId, 'movie'));

        const toggleWatchlist = () => {
            toggleWatchlistItem({
                id: props.movieId,
                title: props.name,
                image: props.image,
                rating: props.rating,
                categories: props.categories,
                adult: false,
                type: 'movie'
            });
        };

        onMounted(async () => {
            const genres = await getGenresList();
            const genreNames = genres
                .filter((genre: { id: number; name: string }) => props.categories.includes(genre.id))
                .map((genre: { id: number; name: string }) => genre.name)
                .slice(0, 3);
            
            categoryNames.value = genreNames.join(', ');
            displayGenres.value = genreNames;
        });

        return {
            fullPathImage,
            fullDate,
            truncatedDetails,
            categoryNames,
            displayGenres,
            toggleWatchlist,
            inWatchlist
        };
    }
});
</script>

<style scoped lang="scss">
.featured-movie {
    position: relative;
    width: 100%;
    height: 100vh;
    overflow: hidden;
    display: flex;
    align-items: center;
    
    @media (max-width: 768px) {
        height: 80vh;
    }
}

.featured-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    
    .featured-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center;
        transition: transform 8s ease-out;
        
        &:hover {
            transform: scale(1.05);
        }
    }
    
    .image-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(
            135deg,
            rgba(0, 0, 0, 0.7) 0%,
            rgba(0, 0, 0, 0.4) 40%,
            rgba(0, 0, 0, 0.8) 100%
        );
    }
}

.floating-particles {
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 2;
    pointer-events: none;
    
    .particle {
        position: absolute;
        width: 3px;
        height: 3px;
        background: rgba(241, 183, 34, 0.7);
        border-radius: 50%;
        animation: float 12s infinite ease-in-out;
        
        &:nth-child(1) { top: 10%; left: 20%; animation-delay: 0s; }
        &:nth-child(2) { top: 80%; left: 10%; animation-delay: 2s; }
        &:nth-child(3) { top: 30%; left: 80%; animation-delay: 4s; }
        &:nth-child(4) { top: 70%; left: 70%; animation-delay: 6s; }
        &:nth-child(5) { top: 20%; left: 60%; animation-delay: 8s; }
        &:nth-child(6) { top: 90%; left: 30%; animation-delay: 10s; }
        &:nth-child(7) { top: 50%; left: 15%; animation-delay: 3s; }
        &:nth-child(8) { top: 60%; left: 85%; animation-delay: 7s; }
    }
}

.featured-content {
    position: relative;
    z-index: 3;
    width: 100%;
    padding: 0 4rem;
    
    @media (max-width: 768px) {
        padding: 0 2rem;
    }
    
    @media (max-width: 480px) {
        padding: 0 1.5rem;
    }
    
    .content-wrapper {
        max-width: 600px;
        animation: slideInLeft 1s ease-out;
        
        @media (max-width: 768px) {
            max-width: 100%;
        }
    }
}

.rating-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(241, 183, 34, 0.95);
    backdrop-filter: blur(10px);
    color: #000;
    padding: 0.75rem 1.5rem;
    border-radius: 50px;
    font-weight: 700;
    font-size: 1.1rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 10px 30px rgba(241, 183, 34, 0.3);
    
    .rating-icon {
        display: flex;
        align-items: center;
        
        svg {
            width: 18px;
            height: 18px;
            color: #000;
        }
    }
    
    @media (max-width: 768px) {
        font-size: 1rem;
        padding: 0.5rem 1rem;
    }
}

.movie-title {
    font-size: 4.5rem;
    font-weight: 700;
    color: #fff;
    margin: 0 0 2rem 0;
    line-height: 1.1;
    letter-spacing: -0.02em;
    text-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    
    @media (max-width: 1024px) {
        font-size: 3.5rem;
    }
    
    @media (max-width: 768px) {
        font-size: 2.5rem;
        margin-bottom: 1.5rem;
    }
    
    @media (max-width: 480px) {
        font-size: 2rem;
        margin-bottom: 1rem;
    }
}

.movie-info {
    margin-bottom: 2rem;
    
    .info-row {
        display: flex;
        align-items: center;
        gap: 1.5rem;
        margin-bottom: 1rem;
        
        &.secondary {
            margin-bottom: 0;
        }
        
        @media (max-width: 768px) {
            flex-wrap: wrap;
            gap: 1rem;
        }
    }
    
    .info-divider {
        width: 2px;
        height: 20px;
        background: rgba(255, 255, 255, 0.3);
        
        @media (max-width: 768px) {
            display: none;
        }
    }
    
    .genre-tags {
        display: flex;
        gap: 0.75rem;
        flex-wrap: wrap;
        
        .genre-tag {
            background: rgba(255, 255, 255, 0.15);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: #fff;
            padding: 0.5rem 1rem;
            border-radius: 25px;
            font-size: 0.9rem;
            font-weight: 500;
            transition: all 0.3s ease;
            
            &:hover {
                background: rgba(241, 183, 34, 0.2);
                border-color: rgba(241, 183, 34, 0.4);
            }
            
            @media (max-width: 768px) {
                font-size: 0.8rem;
                padding: 0.4rem 0.8rem;
            }
        }
    }
    
    .release-date {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #8ea9bd;
        font-size: 1rem;
        
        svg {
            width: 16px;
            height: 16px;
        }
        
        span {
            color: #fff;
            font-weight: 500;
        }
        
        @media (max-width: 768px) {
            font-size: 0.9rem;
        }
    }
}

.movie-description {
    color: #e0e0e0;
    font-size: 1.1rem;
    line-height: 1.7;
    margin-bottom: 2.5rem;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
    
    @media (max-width: 768px) {
        font-size: 1rem;
        line-height: 1.6;
        margin-bottom: 2rem;
    }
    
    @media (max-width: 480px) {
        display: none;
    }
}

.action-buttons {
    display: flex;
    gap: 1rem;
    align-items: center;
    
    @media (max-width: 768px) {
        flex-direction: column;
        width: 100%;
    }
    
    .primary-button {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        background: linear-gradient(135deg, #f1b722 0%, #e6a71a 100%);
        color: #000;
        padding: 1rem 2rem;
        border-radius: 50px;
        font-weight: 600;
        font-size: 1rem;
        text-decoration: none;
        transition: all 0.3s ease;
        box-shadow: 0 10px 30px rgba(241, 183, 34, 0.3);
        
        svg {
            width: 20px;
            height: 20px;
        }
        
        &:hover {
            transform: translateY(-3px);
            box-shadow: 0 15px 40px rgba(241, 183, 34, 0.4);
            background: linear-gradient(135deg, #e6a71a 0%, #d49b15 100%);
        }
        
        @media (max-width: 768px) {
            width: 100%;
            justify-content: center;
            padding: 1rem 1.5rem;
        }
    }
    
    .secondary-button {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        border: 2px solid rgba(255, 255, 255, 0.3);
        color: #fff;
        padding: 1rem 2rem;
        border-radius: 50px;
        font-weight: 600;
        font-size: 1rem;
        cursor: pointer;
        transition: all 0.3s ease;
        
        svg {
            width: 20px;
            height: 20px;
        }
        
        &:hover {
            background: rgba(255, 255, 255, 0.2);
            border-color: rgba(255, 255, 255, 0.5);
            transform: translateY(-2px);
        }
        
        @media (max-width: 768px) {
            width: 100%;
            justify-content: center;
            padding: 1rem 1.5rem;
        }
    }
}

.scroll-indicator {
    position: absolute;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    z-index: 3;
    animation: bounce 2s infinite;
    
    .scroll-line {
        width: 2px;
        height: 30px;
        background: linear-gradient(to bottom, transparent, #f1b722);
        border-radius: 1px;
    }
    
    svg {
        width: 20px;
        height: 20px;
        color: #f1b722;
    }
    
    @media (max-width: 768px) {
        bottom: 1rem;
    }
}

@keyframes slideInLeft {
    from {
        opacity: 0;
        transform: translateX(-50px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

@keyframes float {
    0%, 100% { 
        transform: translateY(0px) rotate(0deg); 
        opacity: 0.4;
    }
    50% { 
        transform: translateY(-30px) rotate(180deg); 
        opacity: 1;
    }
}

@keyframes bounce {
    0%, 20%, 50%, 80%, 100% { 
        transform: translateX(-50%) translateY(0); 
    }
    40% { 
        transform: translateX(-50%) translateY(-10px); 
    }
    60% { 
        transform: translateX(-50%) translateY(-5px); 
    }
}
</style>