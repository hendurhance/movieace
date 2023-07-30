<template>
    <div class="container search-wrapper">
        <h3>Looking for something else? Search our database:</h3>
        <form action="">
            <input type="text" name="search" id="search" placeholder="Try 'Lord of the Rings'" class="search-input">
            <button type="submit" class="search-button">
                <search />
            </button>
        </form>
    </div>
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent } from 'vue';

const search = defineAsyncComponent(() => import('../components/svg/outline/search.vue'));

export default defineComponent({
    name: 'SearchWrapper',
    components: {
        search,
    },
})


</script>

<style scoped lang="scss">
.search-wrapper {
    margin: 6rem 0;
    display: grid;
    place-items: center;

    h3 {
        color: #f1b722;
        font-size: 1.2rem;
        font-weight: 400;
        margin-bottom: 1rem;
        text-align: center;

        @media (max-width: 768px) {
            font-size: 1.05rem;
        }

        @media (max-width: 576px) {
            font-size: .825rem;
        }
    }

    form {
        position: relative;
        width: 100%;

        @media (min-width: 780px) {
            width: 75%;
        }

        .search-input {
            width: 100%;
            padding: 1.5rem 1rem;
            border-radius: 2.5rem;
            border: 1px solid #1e445c;
            border-right: none;
            font-size: 1.2rem;
            text-align: center;
            font-weight: 400;
            background-color: #fff;

            @media (max-width: 768px) {
                padding: 1rem .5rem;
                font-size: 1rem;
            }

            @media (max-width: 576px) {
                padding: .5rem .25rem;
                font-size: .825rem;
            }
        }

        .search-button {
            position: absolute;
            top: 0;
            bottom: 0;
            right: 1rem;
            background: none;
            border: none;
            cursor: pointer;

            svg {
                width: 2rem;
                height: 2rem;
                fill: #fff;
                margin: auto;
                transition: all .2s ease-in-out;

                @media (max-width: 768px) {
                    width: 1.5rem;
                    height: 1.5rem;
                }

                @media (max-width: 576px) {
                    width: 1rem;
                    height: 1rem;
                }
            }
        }
    }
}
</style>