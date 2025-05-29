<template>
    <div class="actor-list-item">
        <router-link :to="`/actor/${actorId}`" class="actor-link">
            <div class="actor-image-container">
                <img :src="fullPathImage" :alt="name" loading="lazy" />
                <div class="popularity-overlay">
                    <div class="popularity-badge">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/>
                        </svg>
                        {{ Math.round(popularity) }}
                    </div>
                </div>
                <div class="hover-overlay">
                    <div class="view-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2" fill="none"/>
                            <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" fill="none"/>
                        </svg>
                    </div>
                </div>
            </div>
            
            <div class="actor-content">
                <h3 class="actor-name">{{ name }}</h3>
                <div class="actor-meta">
                    <span class="known-for-badge" v-if="knownFor">
                        {{ knownFor }}
                    </span>
                </div>
            </div>
        </router-link>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useWebImage } from '../../utils/useWebImage';

export default defineComponent({
    name: 'ActorItem',
    props: {
        actorId: {
            type: [Number, String],
            required: true
        },
        name: {
            type: String,
            required: true
        },
        image: {
            type: String,
            default: null
        },
        popularity: {
            type: Number,
            default: 0
        },
        knownFor: {
            type: String,
            default: ''
        }
    },
    setup(props) {
        // Use a fallback image if empty_actor_state doesn't exist
        const fallbackImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDIwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTUwIiBmaWxsPSIjNjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCI+Tm8gSW1hZ2U8L3RleHQ+Cjwvc3ZnPg==';
        
        const fullPathImage = props.image === null || props.image === undefined 
            ? fallbackImage 
            : useWebImage(props.image, "medium");

        return {
            fullPathImage
        };
    }
});
</script>

<style lang="scss" scoped>
.actor-list-item {
    display: flex;
    flex-direction: column;
    height: auto;
    
    .actor-link {
        position: relative;
        display: flex;
        flex-direction: column;
        height: auto;
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
            
            .actor-image-container {
                .hover-overlay {
                    opacity: 1;
                }
                
                img {
                    transform: scale(1.05);
                }
            }
            
            .actor-name {
                color: #f1b722;
            }
        }
    }
    
    .actor-image-container {
        position: relative;
        aspect-ratio: 2/3;
        overflow: hidden;
        border-radius: 0.75rem 0.75rem 0 0;
        
        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: center top;
            transition: transform 0.4s ease;
        }
        
        .popularity-overlay {
            position: absolute;
            top: 0.75rem;
            right: 0.75rem;
            z-index: 2;
            
            .popularity-badge {
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
            
            .view-icon {
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
            }
        }
    }
    
    .actor-content {
        padding: 1rem;
        flex: 0 0 auto;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        
        .actor-name {
            font-size: 1rem;
            margin: 0;
            font-weight: 600;
            color: #fff;
            line-height: 1.3;
            transition: color 0.3s ease;
            text-align: center;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
        
        .actor-meta {
            display: flex;
            justify-content: center;
            align-items: center;
            
            .known-for-badge {
                background: rgba(142, 169, 189, 0.15);
                color: #8ea9bd;
                padding: 0.25rem 0.625rem;
                border-radius: 10px;
                font-size: 0.75rem;
                font-weight: 500;
                border: 1px solid rgba(142, 169, 189, 0.2);
                text-transform: capitalize;
            }
        }
    }
}

// Responsive adjustments
@media (max-width: 768px) {
    .actor-list-item {
        .actor-content {
            padding: 0.75rem;
            gap: 0.375rem;
            
            .actor-name {
                font-size: 0.9rem;
            }
        }
        
        .actor-image-container {
            .popularity-overlay {
                top: 0.5rem;
                right: 0.5rem;
                
                .popularity-badge {
                    padding: 0.25rem 0.5rem;
                    font-size: 0.7rem;
                }
            }
        }
    }
}

@media (max-width: 480px) {
    .actor-list-item {
        .actor-content {
            padding: 0.625rem;
            
            .actor-meta {
                .known-for-badge {
                    font-size: 0.7rem;
                    padding: 0.2rem 0.4rem;
                }
            }
        }
    }
}
</style>