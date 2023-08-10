<template>
    <div>
        <BaseHeader />
        <section>
            <div class="movie-hero" :style="{ backgroundImage: `url(${computedMovieImages.backdrop})` }">
                <div class="movie-hero-overlay">
                    <div class="container">
                        <div class="movie-header-grid">
                            <div class="movie-poster">
                                <div class="rating-number">8.1</div>
                                <img :src="computedMovieImages.poster" :alt="movie?.title" />
                            </div>
                            <div class="movie-header-content">
                                <h1>{{ movie?.title }}</h1>
                                <div class="info-wrapper">
                                    <RatingStar :count="votingToRating(8.1, 5)" :max="5" />
                                    <div class="category">
                                        <tag />
                                        <div class="categories">
                                            <span v-for="i in movie?.genres" :key="i.id">{{ i.name }}</span>
                                        </div>
                                    </div>
                                    <div class="date-created">
                                        <Clock />
                                        <span>{{fullDate}}</span>
                                    </div>
                                </div>
                                <p>
                                    {{ movie?.overview }}
                                </p>
                                <div class="info-item">
                                    <span><strong>Duration</strong>: {{ computedMovieDuration }}</span>
                                    <span><strong>Director</strong>: Adam Wingard</span>
                                    <span><strong>Country</strong>: {{ computedCountry }}
                                    </span>
                                    <span><strong>Language</strong>: {{computedLanguage}}</span>
                                    <span class="budget" v-if="computedBudget"><strong>Budget</strong>: {{computedBudget}}</span>
                                    <span class="imdb"><strong>Visit on IMDB</strong>:
                                        <a :href="`https://imdb.com/title/${movie?.imdb_id}`" target="_blank">{{movie?.title}}</a></span>
                                </div>
                                <div class="watch-now-wrapper">
                                    <button @click="showTrailer">Watch Trailer</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="container">
                <CastWrapper :title="movie?.title" :casts="movieCredit?.cast" />
            </div>
            <div class="container" v-if="movieImages?.posters.length !== 0">
                <MoviePicture :pictures="movieImages?.posters" />
            </div>
            <div class="container" v-if="similarMovies.length > 0">
                <SimilarMovie :movie-item="similarMovies" />
            </div>
        </section>
        <BaseFooter />
    </div>
</template>

<script lang="ts">
import { Ref, computed, defineComponent, onMounted, ref } from "vue";
import BaseHeader from "../components/base/BaseHeader.vue";
import BaseFooter from "../components/base/BaseFooter.vue";
import RatingStar from "../containers/RatingStar.vue";
import MovieItem from "../components/layout/MovieItem.vue";
import votingToRating from "../calculation/vote-to-rating";
import tag from "../components/svg/outline/tag.vue";
import arrowLeft from "../components/svg/outline/arrow-left.vue";
import arrowRight from "../components/svg/outline/arrow-right.vue";
import Clock from "../components/svg/outline/clock.vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import { SwiperOptions } from "../utils/swiper-options";
import SimilarMovie from "../containers/SimilarMovie.vue";
import MoviePicture from "../containers/MoviePicture.vue";
import CastWrapper from "../containers/CastWrapper.vue";
import { Movie } from "../composables/useHighlights";
import { useMovies, MovieDetails, MovieCredit,MovieImages } from "../composables/useMovies";
import "swiper/css";
import { useRoute } from "vue-router";
export default defineComponent({
    name: "Movie",
    components: {
        BaseHeader,
        BaseFooter,
        RatingStar,
        MovieItem,
        tag,
        arrowLeft,
        arrowRight,
        Clock,
        Swiper,
        SwiperSlide,
        SimilarMovie,
        MoviePicture,
        CastWrapper,
    },
    setup() {
        const route = useRoute();
        const movieId = ref(route.params.id) as Ref<string>;
        const { fetchMovie,fetchMovieCredits, fetchMovieImages,fetchSimilarMovies } = useMovies();
        const movie = ref<MovieDetails>();
        const movieCredit = ref<MovieCredit>()
        const movieImages = ref<MovieImages>()
        const similarMovies = ref<Movie[]>([])
        const handleFetchMovie = async () => {
            const { data } = await fetchMovie(movieId.value);
            movie.value = data.value;
            console.log(movie.value);
        };
        const handleFetchMovieCredits = async () => {
            const { data } = await fetchMovieCredits(movieId.value);
            movieCredit.value = data.value;
            console.log(movieCredit.value);
        };
        const handleFetchMovieImages = async () => {
            const { data } = await fetchMovieImages(movieId.value);
            movieImages.value = data.value;
            console.log(movieImages.value);
        };
        const handleFetchSimilarMovies = async () => {
            const { data } = await fetchSimilarMovies(movieId.value);
            if(!data.value) return;
            similarMovies.value = data.value?.results;
            console.log(similarMovies.value);
        };
        const IMAGE_BASEURL = import.meta.env.VITE_IMAGE_BASE_URL;

        const computedMovieImages = computed(() => {
            return {
                backdrop: `${IMAGE_BASEURL}w500/${movie.value?.backdrop_path}` ?? "",
                poster: `${IMAGE_BASEURL}w300/${movie.value?.poster_path}` ?? "",
            };
        });
        const computedMovieDuration = computed(() => {
            if (!movie.value?.runtime) return "";
            return `${Math.floor(movie.value?.runtime / 60)}hr ${movie.value?.runtime % 60}m`;
        });
        const computedCountry = computed(() => {
            if (!movie.value?.production_countries) return "";
            return movie.value?.production_countries.splice(0,2).map((i) => i.name).join(", ");
        });
        const computedLanguage = computed(() => {
            if (!movie.value?.spoken_languages) return "";
            return movie.value?.spoken_languages.map((i) => i.name).join(", ");
        });
        const fullDate = computed(() => {
            if (!movie.value?.release_date) return "";

            return new Date(movie.value?.release_date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            })
        });
        const computedBudget = computed(() => {
            if (!movie.value?.budget) return "";
            return `$${movie.value?.budget.toLocaleString()}`;
        });

        handleFetchMovie();
        onMounted(() => {
            Promise.all([
                handleFetchMovieCredits(),
                handleFetchMovieImages(),
                handleFetchSimilarMovies()
            ])
        })

        const movieBackgroundImage = ref(
            "https://image.tmdb.org/t/p/w1280/9yBVqNruk6Ykrwc32qrK2TIE5xw.jpg"
        );

        const showTrailer = () => {
            console.log("show provider");
        };
        const prevSlide = () => {
            console.log("prev slide");
        };

        const nextSlide = () => {
            console.log("next slide");
        };

        return {
            movieBackgroundImage,
            votingToRating,
            showTrailer,
            SwiperOptions,
            prevSlide,
            nextSlide,
            computedMovieImages,
            movie,
            computedMovieDuration,
            computedCountry,
            computedLanguage,
            movieCredit,
            movieImages,
            similarMovies,
            fullDate,
            computedBudget
        };
    },
});
</script>

<style lang="scss" scoped>
@import url("../assets/styles/_background_hero.scss");
</style>
