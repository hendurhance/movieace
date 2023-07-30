<template>
    <div class="actor-list-item">
        <a href="#">
            <div class="actor-popularity">
                <popularity_svg />
                <span>{{popularity.toFixed(0)}}</span>
            </div>
            <img :src="fullPathImage" :alt="name" />
            <div class="actor-overlay">
                <h3>{{name}}</h3>
            </div>
        </a>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import popularity_svg from '../svg/solid/popularity.vue';
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
            default: 'https://image.tmdb.org/t/p/w500/6NsMbJXRlDZuDzatN2akFdGuTvx.jpg'
        },
        imgSize: {
            type: String,
            default: 'w500'
        },
        popularity: {
            type: Number,
            default: 201.48
        }
    },
    setup(props) {
        const IMAGE_BASEURL = import.meta.env.VITE_IMAGE_BASE_URL
        const fullPathImage = `${IMAGE_BASEURL}${props.imgSize}${props.image}`

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