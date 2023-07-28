<template>
    <div class="featured">
        <img src="https://assets.website-files.com/59f5ae906a27c400013267f0/5c3d9d0742cd15748c5a3c19_pexels-photo-312491.jpeg"
            alt="">
        <div class="featured-overlay">
            <div class="container w-container">
                <div class="featured-content">
                    <span class="large-rating-number">7.3</span>
                    <h1>Silent Hill</h1>
                    <div class="info-wrapper">
                        <RatingStar :count="4" />
                        <div class="category">
                            <span>Thriller</span>
                        </div>
                        <div class="date-created">
                            <clock />
                            <span>July 24th, 2023</span>
                        </div>
                    </div>
                    <p class="featured-paragraph">
                        The film takes place in the near future, with Earth in the grip of The Blight, an
                        airborne disease that causes food crops to turn to grey-brown powder. It rolls and
                        billows across the land, piling up around houses and cars like the dust-drifts in Andrei
                        Tarkovsky’s Stalker, another film in which the characters slip between time’s cogs.
                    </p>
                    <a href="#" class="button w-button">Watch now</a>
                </div>
            </div>
        </div>
        <div class="author-block">
            <img src="https://assets.website-files.com/59f5ae906a27c400013267f0/5a097100d65a2f0001bcecad_Portrait-1.jpg"
                alt="">
            <h6>Jonathan Lewis</h6>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import clock from '../../components/svg/outline/clock.vue';
import RatingStar from '../../containers/RatingStar.vue';

export default defineComponent({
    name: 'FeaturedMovie',
    components: {
        clock,
        RatingStar
    }
})
</script>

<style scoped lang="scss">
.featured {
    position: relative;

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .featured-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.1);
        background-image: -webkit-gradient(linear, left top, left bottom, color-stop(64%, rgba(18, 26, 32, 0)), to(#081b27));

        .w-container {

            &::before,
            &::after {
                content: " ";
                display: table;
                grid-column-start: 1;
                grid-row-start: 1;
                grid-column-end: 2;
                grid-row-end: 2;
            }

            .featured-content {
                width: 510px;
                margin: 6rem 0;
                color: #fff;

                .large-rating-number {
                    display: inline-block;
                    margin-bottom: 1rem;
                    padding: 0 1rem;
                    border-radius: 3rem;
                    background-color: #f1b722;
                    color: #323232;
                    font-size: 1.5rem;
                    line-height: 2rem;
                    font-weight: 700;
                }

                h1 {
                    max-width: 90%;
                    margin: 1rem 0;
                    font-size: 5rem;
                }

                .info-wrapper {
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    justify-content: flex-start;
                    margin-bottom: 1rem;

                    .category {
                        margin-left: 1rem;
                        margin-right: 1rem;
                        padding: 0.5rem 1rem;
                        border-radius: 3rem;
                        background-color: #f1b722;
                        color: #323232;
                        font-size: 1rem;
                        line-height: 1.5rem;
                        font-weight: 700;
                    }

                    .date-created {
                        display: flex;
                        flex-direction: row;
                        align-items: center;
                        font-size: 1rem;
                        line-height: 1.5rem;
                        font-weight: 400;
                        color: #8ea9bd;

                        span {
                            margin-left: 0.5rem;
                            color: #fff;
                        }
                    }
                }

                p {
                    margin-bottom: 2rem;
                    color: #fff;
                    font-size: 1rem;
                    line-height: 2rem;
                }

                a {
                    padding: 1rem 2rem;
                    border: 1px solid #fff;
                    font-size: 1rem;
                    font-weight: 400;
                    color: #fff;
                    cursor: pointer;
                    text-decoration: none;
                }
            }
        }
    }

    .author-block {
        position: absolute;
        right: 20px;
        top: calc(50% + 100px);
        width: 145px;

        &::before,
        &::after {
            content: " ";
            display: table;
            grid-column-start: 1;
            grid-row-start: 1;
            grid-column-end: 2;
            grid-row-end: 2;
        }

        img {
            width: 50px;
            height: 40px;
            object-fit: cover;
            border-radius: 20%;
            float: left;
        }

        h6 {
            margin-left: 60px;
            margin-top: 0px;
            font-size: 1rem;
            font-weight: 700;
            color: #fff;
        }
    }
}
</style>