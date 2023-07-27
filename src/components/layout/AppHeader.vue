<template>
    <header>
        <div class="container">
            <a href="#">
                <Logo :fill="'#fff'"></Logo>
            </a>
            <nav id="navigation">
                <RouterLink v-for="route in routes" :key="route.name" :to="route.path">
                    {{ route.name }}
                </RouterLink>
            </nav>
            <div class="menu-button">
                <MenuIcon :fill="'#fff'" @click="toggleNavigation" />
            </div>
        </div>
    </header>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { RouterLink } from 'vue-router';
import MenuIcon from '../svg/outline/menu.vue'
import Logo from '../svg/logo/movieace.vue'
import { routes } from '../../routes';
export default defineComponent({
    name: 'AppHeader',
    components: {
        MenuIcon,
        RouterLink,
        Logo
    },
    setup() {

        const toggleNavigation = () => {
            const navigation = document.getElementById('navigation') as HTMLElement;
            navigation.classList.toggle('active');
        }

        return {
            routes: routes.filter(route => route.name !== 'NotFound'),
            toggleNavigation
        }
    }
});
</script>

<style lang="scss" scoped>
header {
    top: 0px;
    z-index: 1;
    height: 80px;
    background-color: #0c2738;

    div.container {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 100%;
        padding: 0 1.2rem;

        a {
            color: #fff;
            font-size: 1rem;
            font-weight: 400;
            text-decoration: none;
        }

        nav {
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 100%;
            padding: 0 1.2rem;

            @media (max-width: 768px) {
                display: none;
            }

            a {
                color: #fff;
                font-size: 1rem;
                font-weight: 400;
                text-decoration: none;
                margin-left: 1.2rem;
            }
        }

        nav.active {
            background: #0c2738;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            text-align: left;
            position: absolute;
            top: 5rem;
            left: auto;
            right: 0;
            width: 50%;
            height: calc(100vh - 5rem);
            background-color: #0c202b;
            padding: 1.2rem 0;
            box-shadow: 0 0 40px 0 rgba(0, 0, 0, 0.2);
            transition: all 0.3s ease-in-out;

            a {
                margin: 0;
                padding: 1.2rem;
            }
        }

        div.menu-button {
            display: none;

            @media (max-width: 768px) {
                display: block;
                background-color: #081b27;
                padding: 1rem;
            }
        }
    }
}
</style>