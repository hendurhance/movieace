<template>
    <div>
        <BaseHeader />
        <section>
            <div class="actor-hero">
                <div class="container">
                    <div class="actor-hero-grid">
                        <div class="actor-poster">
                            <img src="https://image.tmdb.org/t/p/h632/euDPyqLnuwaWMHajcU3oZ9uZezR.jpg" alt="actor poster" />
                            <div class="actor-info">
                                <h1>Margot Robbie</h1>
                                <div class="actor-socials">
                                    <a v-for="social in socials" :href="social.link" :key="social.name">{{ social.title }}</a>
                                </div>
                            </div>
                        </div>
                        <div class="actor-details">
                            <h3>Biography</h3>
                            <p class="bio" :class="{ expanded: showFullBio }">
                                {{ showFullBio ? paragraph : paragraph.slice(0, 400) + '...' }}
                                <span class="read-more" @click="toggleFullBio">
                                    {{ showFullBio ? 'Read Less' : 'Read More' }}
                                </span>
                            </p>
                            <div class="actor-info-group">
                                <span><strong>Known For:</strong> Acting</span>
                                <span><strong>Gender:</strong> Female</span>
                                <span><strong>Birthday:</strong> 1990-07-02</span>
                                <span><strong>Place of Birth:</strong> Acting</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="container">
                <KnownFor />
            </div>
            <div class="container">
                <MoviePicture :title="'Actor Pictures'" />
            </div>
        </section>
        <BaseFooter />
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import BaseHeader from '../components/base/BaseHeader.vue';
import BaseFooter from '../components/base/BaseFooter.vue';
import { RouterLink } from 'vue-router';
import KnownFor from '../containers/KnownFor.vue';
import MoviePicture from '../containers/MoviePicture.vue';

interface Social {
    name: string;
    link: string;
    title: string;
}

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
        const socials = [
            {
                name: 'facebook',
                link: 'https://www.facebook.com/MargotRobbie/',
                title: 'FB',
            },
            {
                name: 'instagram',
                link: 'https://www.instagram.com/margotrobbieofficial',
                title: 'IG'
            }
        ] as Social[];

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

        const showFullBio = ref(false);

        const toggleFullBio = () => {
            showFullBio.value = !showFullBio.value;
        };

        return {
            socials: socials.filter(social => social.link !== null),
            paragraph,
            showFullBio,
            toggleFullBio
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

            .actor-socials {
                display: flex;
                align-items: center;

                a {
                    display: inline-block;
                    width: 2rem;
                    height: 2rem;
                    border-radius: 50%;
                    background-color: #f1b722;
                    color: #000000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-right: 0.5rem;
                    
                    // i want it to juggled around when hovered
                    transition: transform 0.3s ease-out;

                    &:hover {
                        transform: scale(1.1);
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
            max-height: 10rem;
            overflow: hidden;
            transition: max-height 0.3s ease-out;
            letter-spacing: 0.5px;

            &.expanded {
                max-height: 1000px;
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
