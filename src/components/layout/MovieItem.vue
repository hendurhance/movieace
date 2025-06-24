<template>
    <div class="movie-list-item">
        <router-link :to="type == 'movie' ? `/movie/${movieId}` : `/tv-show/${movieId}`" class="movie-link">
            <div class="movie-poster-container">
                <img :src="fullPathImage" alt="Movie poster" :class="size" loading="lazy" />
                <div class="rating-overlay">
                    <div class="rating-badge">
                        <Star width="14" height="14" fill="currentColor" />
                        {{ rating.toFixed(1) }}
                    </div>
                </div>
                <div class="adult-overlay" v-if="adult">
                    <div class="adult-badge">
                        <XCircle stroke="currentColor" width="12" height="12" />
                        18+
                    </div>
                </div>
                <div class="hover-overlay">
                    <div class="play-icon">
                        <Play stroke="currentColor" />
                    </div>
                </div>
            </div>
            
            <div class="movie-content">
                <h5 class="movie-title">{{ title }}</h5>
                
                <div class="item-meta">
                    <span class="release-year" v-if="releaseDate">
                        {{ getReleaseYear(releaseDate) }}
                    </span>
                    <div class="rating-stars">
                        <RatingStar :count="votingToRating(rating, 5)" :max="5" />
                    </div>
                </div>
                
                <div class="category-section">
                    <div class="category-icon">
                        <tag />
                    </div>
                    <div class="categories">
                        <span v-for="(genre, idx) in genres" :key="idx" class="genre-tag">
                            {{ genre.name }}
                        </span>
                    </div>
                </div>
            </div>
        </router-link>
    </div>
</template>

<script lang="ts">
import { PropType, defineComponent, onMounted, ref } from 'vue';
import RatingStar from '../../containers/RatingStar.vue'
import tag from '../svg/outline/tag.vue';
import Star from '../svg/solid/star.vue';
import XCircle from '../svg/outline/x-circle.vue';
import Play from '../svg/outline/play-circle.vue';
import empty_movie_state from '../../assets/img/empty-movie-state.png';
import votingToRating from '../../calculation/vote-to-rating';
import { useGenresList } from '../../composables/useGenresList';
import { Genre } from '../../composables/useGenre';
import { useRouter } from 'vue-router';
import { useWebImage } from '../../utils/useWebImage';

export default defineComponent({
    name: 'MovieItem',
    components: {
        RatingStar,
        tag,
        Star,
        XCircle,
        Play
    },
    props: {
        type: {
            type: String as PropType<'movie' | 'tv'>,
            default: 'movie'
        },
        movieId: {
            type: [Number, String],
            required: true
        },
        size: {
            type: String,
            default: 'large'
        },
        image: {
            type: String,
            default: empty_movie_state
        },
        title: {
            type: String,
            default: 'Title'
        },
        rating: {
            type: Number,
            default: 8.5
        },
        categories: {
            type: Array as PropType<number[]>,
            default: [12, 16]
        },
        imgSize: {
            type: String,
            default: 'w500'
        },
        releaseDate: {
            type: String,
            default: ''
        },
        adult: {
            type: Boolean,
            default: false
        }
    },
    setup(props) {
        const router = useRouter()
        const fullPathImage = props.image === null ? empty_movie_state : useWebImage(props.image, "large")
        const genres = ref<Genre[]>([])

        onMounted(async () => {
            const { getGenresList } = useGenresList(props.categories.slice(0, 2))
            genres.value = await getGenresList()
        })

        const handleMovieRouting = () => {
            router.push(`/movie/${props.movieId}`)
        }

        const getReleaseYear = (date: string) => {
            return date ? new Date(date).getFullYear() : '';
        }

        return {
            fullPathImage,
            votingToRating,
            genres,
            handleMovieRouting,
            getReleaseYear
        }
    }
})
</script>

<style lang="scss" scoped>
.movie-list-item {
    display: flex;
    flex-direction: column;
    height: 100%;
    
    .movie-link {
        position: relative;
        display: flex;
        flex-direction: column;
        height: 100%;
        text-decoration: none;
        color: #fff;
        transition: all 0.3s ease;
        border-radius: 1rem;
        overflow: hidden;
        background: rgba(255, 255, 255, 0.02);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        
        &:hover {
            transform: translateY(-8px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            background: rgba(255, 255, 255, 0.05);
            border-color: rgba(241, 183, 34, 0.3);
            
            .movie-poster-container {
                .hover-overlay {
                    opacity: 1;
                }
                
                img {
                    transform: scale(1.05);
                }
            }
            
            .movie-title {
                color: #f1b722;
            }
        }
    }
    
    .movie-poster-container {
        position: relative;
        overflow: hidden;
        border-radius: 0.75rem 0.75rem 0 0;
        flex: 0 0 auto;
        
        img {
            width: 100%;
            height: auto;
            display: block;
            object-fit: cover;
            object-position: center;
            transition: transform 0.4s ease;
            aspect-ratio: 2/3;
            
            &.large {
                width: 100%;
                height: auto;
                aspect-ratio: 2/3;
            }

            &.small {
                width: 100%;
                height: 220px;
                object-fit: cover;
                aspect-ratio: unset;
            }
        }
        
        .rating-overlay {
            position: absolute;
            top: 0.75rem;
            right: 0.75rem;
            z-index: 2;
            
            .rating-badge {
                display: flex;
                align-items: center;
                gap: 0.25rem;
                background: rgba(241, 183, 34, 0.95);
                backdrop-filter: blur(10px);
                color: #000;
                padding: 0.375rem 0.625rem;
                border-radius: 12px;
                font-size: 0.75rem;
                font-weight: 700;
                box-shadow: 0 4px 12px rgba(241, 183, 34, 0.3);
                
                svg {
                    width: 12px;
                    height: 12px;
                    color: #000;
                }
            }
        }
        
        .adult-overlay {
            position: absolute;
            top: 0.75rem;
            left: 0.75rem;
            z-index: 2;
            
            .adult-badge {
                display: flex;
                align-items: center;
                gap: 0.25rem;
                background: rgba(239, 68, 68, 0.95);
                backdrop-filter: blur(10px);
                color: #fff;
                padding: 0.375rem 0.625rem;
                border-radius: 12px;
                font-size: 0.7rem;
                font-weight: 700;
                box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
                border: 1px solid rgba(239, 68, 68, 0.6);
                
                svg {
                    width: 10px;
                    height: 10px;
                    color: #fff;
                }
            }
        }
        
        .hover-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, rgba(241, 183, 34, 0.1), rgba(241, 183, 34, 0.2));
            backdrop-filter: blur(2px);
            opacity: 0;
            transition: opacity 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            
            .play-icon {
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
                
                &:hover {
                    transform: scale(1);
                }
                
                svg {
                    margin-left: 2px;
                }
            }
        }
    }
    
    .movie-content {
        padding: 1rem;
        flex: 1 1 auto;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        min-height: 0;
        
        .movie-title {
            font-size: 1.1rem;
            margin: 0;
            font-weight: 600;
            color: #fff;
            line-height: 1.3;
            transition: color 0.3s ease;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            height: 2.6em;
            flex: 0 0 auto;
        }
        
        .item-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 0;
            flex: 0 0 auto;
            
            .release-year {
                background: rgba(142, 169, 189, 0.15);
                color: #8ea9bd;
                padding: 0.25rem 0.625rem;
                border-radius: 10px;
                font-size: 0.75rem;
                font-weight: 500;
                border: 1px solid rgba(142, 169, 189, 0.2);
            }
            
            .rating-stars {
                opacity: 0.9;
                
                :deep(.rating-star) {
                    font-size: 0.9rem;
                }
            }
        }
        
        .category-section {
            display: flex;
            align-items: flex-start;
            gap: 0.5rem;
            flex: 1 1 auto;
            min-height: 0;
            
            .category-icon {
                margin-top: 0.125rem;
                opacity: 0.7;
                flex: 0 0 auto;
                
                svg {
                    width: 14px;
                    height: 14px;
                    color: #8ea9bd;
                }
            }
            
            .categories {
                display: flex;
                flex-wrap: wrap;
                gap: 0.375rem;
                flex: 1;
                align-content: flex-start;
                
                .genre-tag {
                    background: rgba(255, 255, 255, 0.08);
                    color: #8ea9bd;
                    padding: 0.25rem 0.5rem;
                    border-radius: 8px;
                    font-size: 0.75rem;
                    font-weight: 500;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    transition: all 0.3s ease;
                    white-space: nowrap;
                    
                    &:hover {
                        background: rgba(241, 183, 34, 0.1);
                        color: #f1b722;
                        border-color: rgba(241, 183, 34, 0.3);
                    }
                }
            }
        }
    }
}

@media (max-width: 768px) {
    .movie-list-item {
        .movie-content {
            padding: 0.75rem;
            gap: 0.375rem;
            
            .movie-title {
                font-size: 1rem;
                height: 2.4em;
            }
        }
        
        .movie-poster-container {
            .rating-overlay {
                top: 0.5rem;
                right: 0.5rem;
                
                .rating-badge {
                    padding: 0.25rem 0.5rem;
                    font-size: 0.7rem;
                }
            }
            
            .adult-overlay {
                top: 0.5rem;
                left: 0.5rem;
                
                .adult-badge {
                    padding: 0.25rem 0.5rem;
                    font-size: 0.65rem;
                    gap: 0.2rem;
                    
                    svg {
                        width: 8px;
                        height: 8px;
                    }
                }
            }
        }
    }
}

@media (max-width: 480px) {
    .movie-list-item {
        .movie-content {
            padding: 0.625rem;
            gap: 0.25rem;
            
            .item-meta {
                flex-direction: column;
                align-items: flex-start;
                gap: 0.375rem;
            }
            
            .category-section {
                .categories {
                    .genre-tag {
                        font-size: 0.7rem;
                        padding: 0.2rem 0.4rem;
                    }
                }
            }
        }
    }
}
</style>