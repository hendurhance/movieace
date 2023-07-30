<template>
    <div class="masthead-wrapper">
        <h1>{{ title }}</h1>
        <p>{{ subtitle }}</p>
        <div class="mini-search" v-if="search">
            <form>
                <input 
                type="text" 
                :placeholder="searchPlaceholder" 
                @input="handleInput($event as InputEvent)"
                 v-model="searchValue" 
                @focus="showClearButton = true"
                />
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
import { defineComponent, ref } from 'vue';
export default defineComponent({
    name: 'Hero',
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
    setup(props) {

            // State for the input value and showClearButton flag
        const searchValue = ref('');
        const showClearButton = ref(false);

        // Update the input value when the user types
        const handleInput = (event: InputEvent) => {
        searchValue.value = (event.target as HTMLInputElement).value;
        };

        // Clear the input and hide the clear button
        const clearInput = () => {
            console.log(searchValue.value);
            searchValue.value = '';
            showClearButton.value = false;
        };


        return {
            title: props.title,
            subtitle: props.subtitle,
            search: props.search,
            searchPlaceholder: props.searchPlaceholder,
            searchValue,
            showClearButton,
            handleInput,
            clearInput,
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