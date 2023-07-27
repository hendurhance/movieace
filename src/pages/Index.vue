<template>
    <div>
        <AppHeader />
        <section>
            <div class="container">
                <div class="highlights">
                    <div class="title-wrapper">
                        <h1>Highlights today</h1>
                        <p>Be sure not to miss todays highlight.</p>
                    </div>
                    <div class="button-tabs">
                        <button v-for="button in highlightsButtons" :key="button.name">
                            {{ button.name }}
                        </button>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import AppHeader from '../components/layout/AppHeader.vue'
import { highlightsButtons } from '../utils/button-layout.ts'
export default defineComponent({
    name: 'Index',
    components: {
        AppHeader
    },
    setup() {
        return {
            highlightsButtons,
        }
    }
});
</script>

<style lang="scss" scoped>
.highlights {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    .title-wrapper {
        text-align: left;
        h1 {
            font-size: 3rem;
            color: #fff;
            font-weight: 700;
            margin-bottom: 1rem;
        }
        p {
            font-size: 1.5rem;
            font-weight: 400;
            color: #8ea9bd;
            margin-top: 1rem;
        }
    }
    .button-tabs {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        margin-top: 2rem;
        button {
            background-color: #fff;
            border: 1px solid #ebebeb;
            border-radius: 0.5rem;
            padding: 0.5rem 1rem;
            margin: 0 0.5rem;
            font-size: 1rem;
            font-weight: 400;
            color: #7a7a7a;
            cursor: pointer;
            &:hover {
                background-color: #ebebeb;
            }
        }
    }
}
</style>