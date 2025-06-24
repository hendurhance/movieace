<template>
    <div class="masthead-wrapper">
        <h1>{{ title }}</h1>
        <p>{{ subtitle }}</p>
        <div class="mini-search" v-if="search">
            <form @submit.prevent="submitSearch">
                <input
                type="text"
                :placeholder="searchPlaceholder"
                v-model="searchValue"
                list="recent-searches"
                @focus="showClearButton = true"
                />
                <datalist id="recent-searches">
                    <option v-for="term in searchHistory" :key="term" :value="term" />
                </datalist>
                <button
                    v-if="showClearButton && searchValue"
                    @click="clearInput"
                    type="button"
                    class="clear-button"
                >
                    &times;
                </button>
            </form>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { searchHistory, addSearchTerm } from '../composables/useHistory';
export default defineComponent({
    name: 'Hero',
    emits: ['search'],
    props: {
        title: {
            type: String,
            default: 'Discover Movies'
        },
        subtitle: {
            type: String,
            default: 'Find your favorite movies and explore new ones'
        },
        search: {
            type: Boolean,
            default: true
        },
        searchPlaceholder: {
            type: String,
            default: 'Search for a movie'
        }
    },
    setup(props, { emit }) {
        const searchValue = ref('');
        const showClearButton = ref(false);

        // // Update the input value when the user types
        // const handleInput = (event: InputEvent) => {
        // searchValue.value = (event.target as HTMLInputElement).value;

        // };

        const clearInput = () => {
            searchValue.value = '';
            showClearButton.value = false;
        };

        const submitSearch = () => {
            const term = searchValue.value.trim();
            if (!term) return;
            addSearchTerm(term);
            emit('search', term);
        };
        const route = useRoute();
        onMounted(() => {
            const searchQuery = route.query.search as string;
            searchValue.value = searchQuery;
        });


        return {
            title: props.title,
            subtitle: props.subtitle,
            search: props.search,
            searchPlaceholder: props.searchPlaceholder,
            searchValue,
            showClearButton,
            // handleInput,
            clearInput,
            submitSearch,
            searchHistory
        }
    }
});

</script>

<style lang="scss" scoped>
.masthead-wrapper {
    padding: 2rem 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #fff;

    h1 {
        font-size: 4rem;
        font-weight: 700;
        line-height: 0;

        @media (max-width: 576px) {
            font-size: 3rem;
        }

        @media (max-width: 448px) {
            font-size: 2rem;
            line-height: 1;
        }
    }
    p {
        font-size: 1.2rem;
        font-weight: 400;

        @media (max-width: 448px) {
            font-size: 1rem;
            text-align: center;
        }
    }
    .mini-search {
        width: 100%;
        max-width: 600px;

        form {
            position: relative;

            input {
            width: 100%;
            padding: 1rem;
            border-radius: 0.5rem;
            outline: none;
            outline: none;
            font-size: 1rem;
            border: 0;
            font-weight: 400;
            color: #000;

            &:focus {
                box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
                
            }
            
        }

        .clear-button {
            position: absolute;
            top: 50%;
            right: 10px;
            transform: translateY(-50%);
            cursor: pointer;
            font-size: 1.2rem;
            color: #999;
            background-color: transparent;
            border: none;
            outline: none;
        }
        }
    }
}

</style>