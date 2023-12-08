<template>
    <div>
        <BaseHeader />
        <section>
            <div class="actor-hero">
                <div class="container">
                    <div class="actor-hero-grid">
                        <div class="actor-poster" v-if="actorDetails">
                            <img :src="useWebImage(actorDetails.profile_path)" alt="actor poster" />
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
            <div class="container">
                <KnownFor />
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
        const paragraph = ref(`
            Margot Elise Robbie (born July 2, 1990) is an Australian actress and producer. Known for her
            work in both blockbuster and independent films, she has received several accolades,
            including nominations for two Academy Awards, four Golden Globe Awards, and five British
            Academy Film Awards. Time magazine named her one of the 100 most influential people in the
            world in 2017 and she was ranked as one of the world's highest-paid actresses by Forbes in
            2019.

            Born and raised in Queensland, Robbie began her career in 2008 on the television series
            Neighbours, on which she was a regular until 2011. After moving to America, she led the
            television series Pan Am (2011–2012), and had her breakthrough in 2013 with the black comedy
            film The Wolf of Wall Street. She achieved wider recognition with starring roles as Jane
            Porter in The Legend of Tarzan (2016) and Harley Quinn in the DC superhero films Suicide
            Squad (2016), Birds of Prey (2020) and The Suicide Squad (2021).

            Robbie received critical acclaim and a nomination for the Academy Award for Best Actress for
            her portrayal of disgraced figure skater Tonya Harding in the biopic I, Tonya (2017). This
            acclaim continued with her roles as Queen Elizabeth I in the period drama Mary Queen of
            Scots (2018), Sharon Tate in the comedy-drama Once Upon a Time in Hollywood (2019), and a
            fictional Fox News employee in the drama Bombshell (2019); she received BAFTA Award
            nominations for all three and a nomination for the Academy Award for Best Supporting Actress
            for the lattermost.

            Robbie is married to filmmaker Tom Ackerley. They are co-founders of the production company
            LuckyChap Entertainment, under which they have produced several films, including I, Tonya
            and Promising Young Woman (2020), as well as the television series Dollface (2019–2022) and
            the miniseries Maid (2021).
        `)
        
        const imdbLink = ref('');
        const showFullBio = ref(false);
        const actorDetails = ref<ActorDetails>();
        const { fetchActorDetails, fetchActorImages} = useActor();
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
        const toggleFullBio = () => {
            showFullBio.value = !showFullBio.value;
        };
        
        onMounted(() => {
           Promise.all([handleFetchActor(), handleFetchActorImages()]);
        });

        return {
            paragraph,
            showFullBio,
            toggleFullBio,
            actorDetails,
            actorImages,
            useWebImage,
            imdbLink
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
