<template>
    <div class="genre-grid">
        <span v-for="(genre, index) in genres" :key="index">{{ genre.name }}</span>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Genre } from '../../composables/useGenre';
export default defineComponent({
    name: 'GenreLists',
    props: {
        genres: {
            type: Array as () => Genre[],
            required: true
        }
    },
    setup(props) {
        return {
            genres: props.genres
        }
    }
});

</script>

<style lang="scss" scoped>
.genre-grid {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    span {
        padding: 0.5rem 1rem;
        border-radius: 0.5rem;
        background-color: #f1b722;
        color: #000;
        margin: 0.5rem;
        cursor: pointer;
        transition: all 0.2s ease-in-out;
        &:hover {
            background-color: #f1b722;
            color: #fff;
        }
    }
}
</style>