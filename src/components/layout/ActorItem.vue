<template>
    <div class="actor-list-item">
        <router-link :to="`/actor/${actorId}`">
            <div class="actor-popularity">
                <popularity_svg />
                <span>{{popularity.toFixed(0)}}</span>
            </div>
            <img :src="fullPathImage" :alt="name" loading="lazy" />
            <div class="actor-overlay">
                <h3>{{name}}</h3>
            </div>
        </router-link>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import popularity_svg from '../svg/solid/popularity.vue';
import empty_actor_state from '../../assets/img/empty-actor-state.png';
import { useWebImage } from '../../utils/useWebImage';
export default defineComponent({
    name: 'ActorItem',
    components: {
        popularity_svg
    },
    props: {
        name: {
            type: String,
            default: 'Scarlett Johansson'
        },
        image: {
            type: String,
            default: empty_actor_state
        },
        imgSize: {
            type: String,
            default: 'w300'
        },
        popularity: {
            type: Number,
            default: 201.48
        },
        actorId: {
            type: Number,
            default: 1245
        }
    },
    setup(props) {
        const fullPathImage = props.image === null ? empty_actor_state : useWebImage(props.image, "large")

        return {
            name: props.name,
            fullPathImage,
        }
    }
});
</script>

<style lang="scss" scoped>
.actor-list-item {
    position: relative;
    overflow: hidden;
    border-radius: 0.5rem;
    box-shadow: inset 0 1px 1px 0 hsla(0, 0%, 100%, 0.1);
    transition: all 0.2s ease-in-out;

    a {
        display: block;
        position: relative;
        overflow: hidden;
        border-radius: 0.5rem;

        &:hover {
            img {
                transform: scale(1.1);
            }
        }

        .actor-popularity {
            position: absolute;
            top: 0;
            right: 0;
            padding: 0.5rem;
            background-color: #000;
            color: #fff;
            border-radius: 0 0 0 0.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;

            span {
                font-size: 1.2rem;
                font-weight: 400;
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
</style>