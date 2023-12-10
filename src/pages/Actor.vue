<template>
    <div>
        <BaseHeader />
        <section>
            <div class="actor-hero">
                <div class="container">
                    <div class="actor-hero-grid">
                        <div class="actor-poster" v-if="actorDetails">
                            <img :src="useWebImage(actorDetails.profile_path)" alt="actor poster" loading="lazy" />
                            <div class="actor-info">
                                <h1>{{actorDetails?.name}}</h1>
                                <div class="actor-imdb">
                                    <a :href="imdbLink" target="_blank">View on IMDB</a>
                                </div>
                            </div>
                        </div>
                        <div class="actor-details">
                            <h3>Biography</h3>
                            <p class="bio" :class="{ expanded: showFullBio }">
                                {{ showFullBio ? actorDetails?.biography : actorDetails?.biography.slice(0, 400) + '...' }}
                                <span class="read-more" @click="toggleFullBio">
                                    {{ showFullBio ? 'Read Less' : 'Read More' }}
                                </span>
                            </p>
                            <div class="actor-info-group">
                                <span><strong>Known For:</strong> {{actorDetails?.known_for_department}}</span>
                                <span><strong>Gender:</strong> {{ actorDetails?.gender == 1? 'Female': 'Male' }}</span>
                                <span v-if="actorDetails?.birthday"><strong>Birthday:</strong> {{actorDetails?.birthday}}</span>
                                <span v-if="actorDetails?.place_of_birth"><strong>Place of Birth:</strong> {{actorDetails?.place_of_birth}}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="container" v-if="actorCombinedCredits && actorCombinedCredits.length > 0">
                <KnownFor :movie-items="actorCombinedCredits" />
            </div>
            <div class="container">
                <MoviePicture :title="'Actor Pictures'" :pictures="actorImages?.profiles" />
            </div>
        </section>
        <BaseFooter />
    </div>
</template>

<script lang="ts">
import { Ref, defineComponent, onMounted, ref } from 'vue';
import BaseHeader from '../components/base/BaseHeader.vue';
import BaseFooter from '../components/base/BaseFooter.vue';
import { RouterLink, useRoute } from 'vue-router';
import KnownFor from '../containers/KnownFor.vue';
import MoviePicture from '../containers/MoviePicture.vue';
import { ActorDetails, ActorImages, useActor } from '../composables/useActor';
import { useWebImage } from '../utils/useWebImage';
import { TVShowType } from '../composables/useTvShows';
import { Movie } from '../composables/useHighlights';


export default defineComponent({
    name: 'Actor',
    components: {
    BaseHeader,
    BaseFooter,
    RouterLink,
    KnownFor,
    MoviePicture
},
    setup() {
        const route = useRoute();
        const actorId = ref(route.params.id) as Ref<string>;
        
        const imdbLink = ref('');
        const showFullBio = ref(false);
        const actorDetails = ref<ActorDetails>();
        const { fetchActorDetails, fetchActorImages, fetchCombinedCredits} = useActor();
        const actorImages = ref<ActorImages>();
        const handleFetchActor = async () => {
            const { data } = await fetchActorDetails(Number(actorId.value));
            actorDetails.value = data.value;

            imdbLink.value = `https://www.imdb.com/name/${actorDetails.value?.imdb_id}`;
        };
        const handleFetchActorImages = async () => {
            const { data } = await fetchActorImages(Number(actorId.value));
            actorImages.value = data.value;
        };
        const actorCombinedCredits = ref<Movie[] | TVShowType[]>();
        const handleFetchActorCombinedCredits = async () => {
            const { data } = await fetchCombinedCredits(Number(actorId.value));
            actorCombinedCredits.value = data.value?.cast;
        };
        const toggleFullBio = () => {
            showFullBio.value = !showFullBio.value;
        };
        
        onMounted(() => {
           Promise.all([handleFetchActor(), handleFetchActorImages(), handleFetchActorCombinedCredits()]);
           window.scrollTo(0, 0);
        });

        return {
            showFullBio,
            toggleFullBio,
            actorDetails,
            actorImages,
            useWebImage,
            imdbLink,
            actorCombinedCredits
        }
    }
});
</script>

<style lang="scss" scoped>
.actor-hero {

    .actor-hero-grid {
        display: grid;
        grid-template-columns: 2fr 3fr;
        grid-gap: 2rem;
        align-items: center;
        margin-top: 2rem;

        @media screen and (max-width: 768px) {
            grid-template-columns: 1fr;
        }
    }

    .actor-poster {
        position: relative;
        overflow: hidden;

        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 0.5rem;
        }

        .actor-info {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            padding: 1rem;
            background-color: linear-gradient(0deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0) 100%);
            color: #fff;

            h1 {
                font-size: 2rem;
                margin-bottom: 0.5rem;
            }

            .actor-imdb {
                display: flex;
                align-items: center;

                a {
                    display: inline-block;
                    height: 2rem;
                    background-color: #f1b722;
                    color: #000000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-right: 0.5rem;
                    padding: 1rem;
                    border-radius: 5px;
                    cursor: pointer;

                    @keyframes juggled {
                        0% {
                            transform: translateX(0);
                        }
                        50% {
                            transform: translateX(0.5rem);
                        }
                        100% {
                            transform: translateX(0);
                        }
                    }

                    &:hover {
                        animation: juggled 0.3s ease-in-out;
                    }
                }
            }
        }
    }

    .actor-details {
        position: relative;
        overflow: hidden;
        color: #fff;

        h3 {
            font-size: 2rem;
            margin-bottom: 0.5rem;
        }

        .bio {
            max-height: max-content;
            overflow: hidden;
            transition: max-height 0.3s ease-out;
            letter-spacing: 0.5px;

            &.expanded {
                max-height: 100%;
            }

            .read-more {
                cursor: pointer;
                color: #f1b722;
            }
        }

        .actor-info-group {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 0.25rem 1rem;
            font-size: 0.875rem;
        }

    }
}
</style>
