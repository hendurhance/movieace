import { defineComponent } from 'vue';
<template>
    <div class="movie-list-item">
        <a href="#">
            <img src="https://image.tmdb.org/t/p/w500/6CoRTJTmijhBLJTUNoVSUNxZMEI.jpg" alt="Movie poster" />
            <h5>Title</h5>
            <div class="rating-number">
                <span>8.5</span>
            </div>
        </a>
        <div class="info-block">
            <RatingStar :count="3" />
            <div class="category">
                <tag />
                <div class="categories">
                    <span>Category</span>
                    <span>Category</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import RatingStar from '../../containers/RatingStar.vue'

export default defineComponent({
    name: 'MovieItem',
    components: {
        RatingStar
    }
})
</script>

<style lang="scss" scoped>
.movie-list-item {
    display: flex;
    flex-direction: column;
    justify-content: center;

    a {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        text-decoration: none;
        color: #fff;

        .rating-number {
            position: absolute;
            top: 0;
            right: 0;
            padding: 0.5rem 1rem;
            border-radius: 0 0 0 0.5rem;
            background-color: #f1b722;
            font-size: 1.2rem;
            font-weight: 400;
            color: #323232;
        }

        img {
            width: 100%;
            height: 100%;
            border-radius: 0.5rem;

            &:hover {
                transition: all 0.3s ease-in-out;
                transform: scale(1.05);
            }
        }

        h5 {
            font-size: 1.2rem;
            margin: .5rem 0;
            text-align: left;
            font-weight: 400;
            color: #fff;
            font-weight: 600;
        }
    }

    .info-block {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;

        .category {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: center;
            margin-top: .5rem;

            .categories {
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: center;

                span {
                    font-size: 1rem;
                    font-weight: 400;
                    color: #8ea9bd;
                    margin-left: .2rem;
                }
            }
        }
    }
}
</style>