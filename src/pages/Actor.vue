<template>
    <div>
        <BaseHeader />
        
        <!-- Loading State -->
        <LoadingState 
            v-if="isLoading" 
            message="Loading actor details..."
            size="large"
        />
        
        <!-- Error State -->
        <ErrorState 
            v-else-if="hasError" 
            title="Failed to load actor"
            :message="errorMessage"
            @retry="retryFetch"
        />
        
        <!-- Actor Content -->
        <section v-else-if="actorDetails" class="remove-padding">
            <!-- Hero Section -->
            <div class="actor-hero">
                <div class="container">
                    <div class="actor-hero-grid">
                        <div class="actor-poster-section">
                            <div class="actor-poster">
                                <img :src="useWebImage(actorDetails.profile_path)" :alt="actorDetails.name" loading="lazy" />
                                <div class="actor-overlay">
                                    <div class="actor-basic-info">
                                        <h1>{{ actorDetails.name }}</h1>
                                        <div class="actor-department">
                                            {{ actorDetails.known_for_department }}
                                        </div>
                                        <a :href="imdbLink" target="_blank" class="imdb-btn">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                                <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                            </svg>
                                            View on IMDB
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="actor-details">
                            <div class="actor-header">
                                <h2>Biography</h2>
                                <div class="actor-stats">
                                    <div class="stat-item">
                                        <span class="stat-label">Known For</span>
                                        <span class="stat-value">{{ actorDetails.known_for_department }}</span>
                                    </div>
                                    <div class="stat-item">
                                        <span class="stat-label">Gender</span>
                                        <span class="stat-value">{{ actorDetails.gender === 1 ? 'Female' : 'Male' }}</span>
                                    </div>
                                    <div class="stat-item" v-if="actorDetails.birthday">
                                        <span class="stat-label">Age</span>
                                        <span class="stat-value">{{ calculateAge(actorDetails.birthday) }} years</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="biography-section">
                                <div class="bio-content" :class="{ expanded: showFullBio }">
                                    <p v-if="actorDetails.biography">
                                        {{ showFullBio ? actorDetails.biography : actorDetails.biography.slice(0, 500) + '...' }}
                                    </p>
                                    <p v-else class="no-bio">
                                        No biography available for {{ actorDetails.name }}.
                                    </p>
                                </div>
                                <button 
                                    v-if="actorDetails.biography && actorDetails.biography.length > 500"
                                    @click="toggleFullBio" 
                                    class="read-more-btn"
                                >
                                    {{ showFullBio ? 'Read Less' : 'Read More' }}
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" :class="{ rotated: showFullBio }">
                                        <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                </button>
                            </div>
                            
                            <div class="actor-info-grid">
                                <div class="info-item" v-if="actorDetails.birthday">
                                    <span class="info-label">Birthday</span>
                                    <span class="info-value">{{ formatDate(actorDetails.birthday) }}</span>
                                </div>
                                <div class="info-item" v-if="actorDetails.place_of_birth">
                                    <span class="info-label">Place of Birth</span>
                                    <span class="info-value">{{ actorDetails.place_of_birth }}</span>
                                </div>
                                <div class="info-item" v-if="actorDetails.deathday">
                                    <span class="info-label">Death</span>
                                    <span class="info-value">{{ formatDate(actorDetails.deathday) }}</span>
                                </div>
                                <div class="info-item" v-if="actorDetails.also_known_as && actorDetails.also_known_as.length > 0">
                                    <span class="info-label">Also Known As</span>
                                    <span class="info-value">{{ actorDetails.also_known_as.slice(0, 3).join(', ') }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Content Sections -->
            <div class="actor-content">
                <!-- Known For Section -->
                <div class="container section" v-if="actorCombinedCredits && actorCombinedCredits.length > 0">
                    <KnownFor :movie-items="actorCombinedCredits" />
                </div>
                
                <!-- Actor Images Section -->
                <div class="container section" v-if="actorImages?.profiles && actorImages.profiles.length > 0">
                    <div class="section-header">
                        <h2>Photos</h2>
                        <span class="section-count">{{ actorImages.profiles.length }} images</span>
                    </div>
                    <MoviePicture :title="''" :pictures="actorImages.profiles" />
                </div>
            </div>
        </section>

        <ErrorState 
            v-else 
            title="Actor not found"
            message="The actor you are looking for does not exist or has been removed."
            @retry="goToHome"
            :retry-text="'Go to Home'"
            backgroundColor="#081b27"
        />
        
        <BaseFooter />
    </div>
</template>

<script lang="ts">
import { Ref, defineComponent, onMounted, ref } from 'vue';
import BaseHeader from '../components/base/BaseHeader.vue';
import BaseFooter from '../components/base/BaseFooter.vue';
import { useRoute } from 'vue-router';
import KnownFor from '../containers/KnownFor.vue';
import MoviePicture from '../containers/MoviePicture.vue';
import { ActorDetails, ActorImages, useActor } from '../composables/useActor';
import { useWebImage } from '../utils/useWebImage';
import { TVShowType } from '../composables/useTvShows';
import { Movie } from '../composables/useHighlights';
import LoadingState from '../containers/LoadingState.vue';
import ErrorState from '../containers/ErrorState.vue';
import { router } from '../routes';

export default defineComponent({
    name: 'Actor',
    components: {
        BaseHeader,
        BaseFooter,
        LoadingState,
        ErrorState,
        KnownFor,
        MoviePicture
    },
    setup() {
        const route = useRoute();
        const actorId = ref(route.params.id) as Ref<string>;
        
        // State
        const actorDetails = ref<ActorDetails>();
        const actorImages = ref<ActorImages>();
        const actorCombinedCredits = ref<Movie[] | TVShowType[]>();
        const imdbLink = ref('');
        const showFullBio = ref(false);
        const isLoading = ref(true);
        const hasError = ref(false);
        const errorMessage = ref('');
        
        const { fetchActorDetails, fetchActorImages, fetchCombinedCredits } = useActor();
        
        const handleFetchActor = async () => {
            try {
                const { data } = await fetchActorDetails(Number(actorId.value));
                actorDetails.value = data.value;
                imdbLink.value = `https://www.imdb.com/name/${actorDetails.value?.imdb_id}`;
            } catch (error: any) {
                throw new Error('Failed to fetch actor details');
            }
        };
        
        const handleFetchActorImages = async () => {
            try {
                const { data } = await fetchActorImages(Number(actorId.value));
                actorImages.value = data.value;
            } catch (error: any) {
                console.error('Failed to fetch actor images:', error);
            }
        };
        
        const handleFetchActorCombinedCredits = async () => {
            try {
                const { data } = await fetchCombinedCredits(Number(actorId.value));
                actorCombinedCredits.value = data.value?.cast;
            } catch (error: any) {
                console.error('Failed to fetch actor credits:', error);
            }
        };

        const fetchAllData = async () => {
            isLoading.value = true;
            hasError.value = false;
            errorMessage.value = '';

            try {
                await handleFetchActor();
                await Promise.all([
                    handleFetchActorImages(),
                    handleFetchActorCombinedCredits()
                ]);
            } catch (error: any) {
                hasError.value = true;
                errorMessage.value = error.message || 'Failed to load actor details';
            } finally {
                isLoading.value = false;
            }
        };

        const retryFetch = () => {
            fetchAllData();
        };
        
        const toggleFullBio = () => {
            showFullBio.value = !showFullBio.value;
        };

        const calculateAge = (birthday: string): number => {
            const today = new Date();
            const birthDate = new Date(birthday);
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            
            return age;
        };

        const formatDate = (dateString: string): string => {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        };

        const goToHome = () => {
            router.push('/');
        };
        
        onMounted(() => {
            window.scrollTo(0, 0);
            fetchAllData();
        });

        return {
            showFullBio,
            toggleFullBio,
            actorDetails,
            actorImages,
            useWebImage,
            imdbLink,
            actorCombinedCredits,
            isLoading,
            hasError,
            errorMessage,
            retryFetch,
            calculateAge,
            formatDate,
            goToHome
        };
    }
});
</script>

<style lang="scss" scoped>
.actor-hero {
    padding: 4rem 0;
    background: linear-gradient(135deg, rgba(8, 27, 39, 0.95) 0%, rgba(15, 20, 25, 0.9) 100%);
    
    .actor-hero-grid {
        display: grid;
        grid-template-columns: 400px 1fr;
        gap: 4rem;
        align-items: start;
        
        @media (max-width: 1024px) {
            grid-template-columns: 350px 1fr;
            gap: 3rem;
        }
        
        @media (max-width: 768px) {
            grid-template-columns: 1fr;
            gap: 2rem;
            text-align: center;
        }
    }
}

.actor-poster-section {
    position: relative;
}

.actor-poster {
    position: relative;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
    transition: transform 0.3s ease;
    
    &:hover {
        transform: translateY(-5px);
        
        .actor-overlay {
            opacity: 1;
        }
    }
    
    img {
        width: 100%;
        height: auto;
        display: block;
    }
    
    .actor-overlay {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: linear-gradient(transparent, rgba(0, 0, 0, 0.9));
        padding: 2rem;
        opacity: 0;
        transition: opacity 0.3s ease;
        
        @media (max-width: 768px) {
            opacity: 1;
        }
        
        .actor-basic-info {
            h1 {
                font-size: 1.8rem;
                font-weight: 700;
                color: #fff;
                margin: 0 0 0.5rem 0;
            }
            
            .actor-department {
                color: #f1b722;
                font-weight: 500;
                margin-bottom: 1rem;
            }
            
            .imdb-btn {
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.75rem 1.5rem;
                background: rgba(241, 183, 34, 0.9);
                color: #000;
                text-decoration: none;
                border-radius: 25px;
                font-weight: 600;
                transition: all 0.3s ease;
                
                &:hover {
                    background: #f1b722;
                    transform: translateY(-2px);
                }
            }
        }
    }
}

.actor-details {
    color: #fff;
    
    .actor-header {
        margin-bottom: 2rem;
        
        h2 {
            font-size: 2.5rem;
            font-weight: 700;
            margin: 0 0 1.5rem 0;
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
        }
    }
    
    .actor-stats {
        display: flex;
        gap: 2rem;
        margin-bottom: 2rem;
        
        @media (max-width: 768px) {
            justify-content: center;
            gap: 1rem;
        }
        
        .stat-item {
            text-align: center;
            
            .stat-label {
                display: block;
                font-size: 0.8rem;
                color: #8ea9bd;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin-bottom: 0.25rem;
            }
            
            .stat-value {
                display: block;
                font-size: 1.1rem;
                font-weight: 600;
                color: #f1b722;
            }
        }
    }
}

.biography-section {
    margin-bottom: 3rem;
    
    .bio-content {
        max-height: 150px;
        overflow: hidden;
        transition: max-height 0.4s ease;
        
        &.expanded {
            max-height: none;
        }
        
        p {
            font-size: 1.1rem;
            line-height: 1.8;
            color: rgba(255, 255, 255, 0.9);
            margin: 0;
        }
        
        .no-bio {
            color: #8ea9bd;
            font-style: italic;
        }
    }
    
    .read-more-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        background: none;
        border: none;
        color: #f1b722;
        font-weight: 600;
        cursor: pointer;
        margin-top: 1rem;
        padding: 0.5rem 0;
        transition: all 0.3s ease;
        
        &:hover {
            color: #fff;
            transform: translateX(5px);
        }
        
        svg {
            transition: transform 0.3s ease;
            
            &.rotated {
                transform: rotate(180deg);
            }
        }
    }
}

.actor-info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
    
    .info-item {
        .info-label {
            display: block;
            font-size: 0.85rem;
            color: #8ea9bd;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 0.5rem;
        }
        
        .info-value {
            display: block;
            font-size: 1rem;
            color: #fff;
            font-weight: 500;
            line-height: 1.4;
        }
    }
}

.actor-content {
    .section {
        .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
            
            @media (max-width: 768px) {
                flex-direction: column;
                gap: 1rem;
                text-align: center;
            }
            
            h2 {
                font-size: 2rem;
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
            }
            
            .section-count {
                background: rgba(241, 183, 34, 0.1);
                color: #f1b722;
                padding: 0.5rem 1rem;
                border-radius: 20px;
                font-size: 0.9rem;
                font-weight: 500;
                border: 1px solid rgba(241, 183, 34, 0.3);
            }
        }
    }
}

@media (max-width: 576px) {
    .actor-hero {
        padding: 2rem 0;
        
        .actor-hero-grid {
            gap: 1.5rem;
        }
    }
    
    .actor-details {
        .actor-header h2 {
            font-size: 2rem;
        }
        
        .actor-stats {
            flex-direction: column;
            gap: 0.5rem;
        }
    }
    
    .actor-info-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
    }
}
</style>