<template>
    <div>
        <BaseHeader />
        <section>
            <div class="container">
                <Hero 
                    :title="'Discover Actors'" 
                    :subtitle="'Find your favorite actors and explore new ones'" 
                    :search="true" 
                    :searchPlaceholder="'Search for an actor'" 
                />
            </div>
            <div class="container">
                <div class="actor-meta-grid">
                    <div class="actor-item-grid">
                        <ActorItem />
                        <ActorItem />
                        <ActorItem />
                        <ActorItem />
                        <ActorItem />
                        <ActorItem />
                        <ActorItem />
                        <ActorItem />
                    </div>
                    <div class="pagination">
                        <button>Load More</button>
                    </div>
                </div>
            </div>
        </section>
        <BaseFooter />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import BaseHeader from '../components/base/BaseHeader.vue';
import Hero from '../containers/Hero.vue';
import ActorItem from '../components/layout/ActorItem.vue';
import BaseFooter from '../components/base/BaseFooter.vue';
export default defineComponent({
    name: 'Actors',
    components: {
    BaseHeader,
    Hero,
    ActorItem,
    BaseFooter
}
});
</script>

<style lang="scss" scoped>
.actor-meta-grid {
    display: grid;
    grid-gap: 2rem;
    margin: 2rem 0;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
    .actor-item-grid {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        grid-gap: 2rem;

        @media (max-width: 1196px) {
            grid-template-columns: repeat(4, 1fr);
        }

        @media (max-width: 960px) {
            grid-template-columns: repeat(3, 1fr);
        }
        @media (max-width: 668px) {
            grid-template-columns: repeat(2, 1fr);
        }

        @media (max-width: 448px) {
            grid-template-columns: repeat(1, 1fr);
        }

        .actor-list-item {
            position: relative;
            overflow: hidden;
            border-radius: 0.5rem;
            box-shadow: inset 0 1px 1px 0 hsla(0, 0%, 100%, 0.1);

            a {
                display: block;
                position: relative;
                overflow: hidden;
                border-radius: 0.5rem;

                &:hover {
                    img {
                        transform: scale(1.1);
                    }

                    .actor-overlay {
                        background-image: linear-gradient(180deg, transparent -3%, #000 99%);
                    }
                }

                img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: all 0.2s ease-in-out;
                }

                .actor-overlay {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    padding: 1rem;
                    background-image: linear-gradient(180deg, transparent -3%, #000 99%);
                    color: #fff;
                    transition: all 0.2s ease-in-out;

                    h3 {
                        font-size: 1.2rem;
                        font-weight: 400;
                        text-align: center;
                    }
                }
            }
        }
    }
    .pagination {
        display: flex;
        align-items: start;
        justify-content: center;
        button {
            padding: 1rem 2rem;
            border-radius: 0.5rem;
            background-color: #f1b722;
            color: #000;
            border: 0;
            font-size: 1rem;
            font-weight: 400;
            cursor: pointer;
            transition: all 0.2s ease-in-out;
            &:hover {
                background-color: #f1b722;
                color: #fff;
            }
        }
    }
}
</style>