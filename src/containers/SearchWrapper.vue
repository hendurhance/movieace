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
    margin: 5rem auto;
    width: 500px;
    

    h3 {
        color: #f1b722;
        font-size: 1.2rem;
        font-weight: 400;
        margin-bottom: 1rem;
        text-align: center;
        margin-left: calc(0% + 30px);
    }

    form {
        position: relative;

        .search-input {
            width: 100%;
            padding: 1.5rem 1rem;
            border-radius: 2.5rem;
            border: 1px solid #1e445c;
            border-right: none;
            font-size: 1.2rem;
            text-align: center;
            font-weight: 400;
            color: #fff;
            background-color: #fff;
        }

        .search-button {
            position: absolute;
            top: 0;
            bottom: 0;
            right: 0;
            background: none;
            border: none;
            cursor: pointer;
        }
    }
}
</style>