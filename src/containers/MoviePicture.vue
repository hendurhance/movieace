<template>
    <div class="movie-pictures-wrapper">
        <div class="movie-picture-header">
            <h2>Movie Pictures</h2>
        </div>
        <div class="movie-pictures">
            <img v-for="picture in pictures" :key="picture.id" :src="picture.image" alt="movie-picture" />
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
interface Pictures {
    id: number;
    image: string;
}
export default defineComponent({
    name: 'MoviePicture',
    props: {
        pictures: {
            type: Array as () => Pictures[],
            default: () => [
                {
                    id: 1,
                    image: 'https://image.tmdb.org/t/p/w185/UkOuelsjrz36RpZTBWnPw0xE8w.png'
                },
                {
                    id: 2,
                    image: 'https://image.tmdb.org/t/p/w185/n7LFDtQRzEQJbwnURUAGBZzZAQo.png'
                },
                {
                    id: 3,
                    image: 'https://image.tmdb.org/t/p/w185/amzfVURwhxZFwYnctsluJNTejE3.jpg'
                },
                {
                    id: 4,
                    image: 'https://image.tmdb.org/t/p/w185/vxDIPfY2UCxSzuoxliuqyt57IoQ.jpg'
                },
                {
                    id: 5,
                    image: 'https://image.tmdb.org/t/p/w185/UkOuelsjrz36RpZTBWnPw0xE8w.png'
                },
                {
                    id: 6,
                    image: 'https://image.tmdb.org/t/p/w185/n7LFDtQRzEQJbwnURUAGBZzZAQo.png'
                },
                {
                    id: 7,
                    image: 'https://image.tmdb.org/t/p/w185/amzfVURwhxZFwYnctsluJNTejE3.jpg'
                },
                {
                    id: 8,
                    image: 'https://image.tmdb.org/t/p/w185/vxDIPfY2UCxSzuoxliuqyt57IoQ.jpg'
                },
            ]
        }
    },
});
</script>

<style scoped lang="scss">
.movie-pictures-wrapper {
    padding: 4rem 0;

    .movie-picture-header {
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: space-between;

        h2 {
            font-size: 2.5rem;
            font-weight: 700;

            @media screen and (max-width: 1185px) {
                font-size: 2rem;
            }

            @media screen and (max-width: 768px) {
                font-size: 1.5rem;
            }

            @media screen and (max-width: 576px) {
                font-size: 1.25rem;
            }
        }
    }

    .movie-pictures {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 1rem;
        margin-top: 2rem;

        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: center;
            border-radius: 0.5rem;
        }
    }
}
</style>