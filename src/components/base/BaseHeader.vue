<template>
    <header :class="{ 'nav-open': isNavOpen }">
        <div class="container">
            <router-link to="/" class="logo-container">
                <Logo :fill="'#fff'" />
            </router-link>

            <nav id="navigation" :class="{ 'active': isNavOpen }">
                <div class="nav-header">
                    <Logo :fill="'#fff'" class="mobile-logo" />
                    <button class="close-button" @click="closeNavigation">
                        <XIcon :fill="'#fff'" />
                    </button>
                </div>

                <div class="nav-links">
                    <RouterLink v-for="route in routes" :key="route.name" :to="route.path" @click="closeNavigation"
                        class="nav-link" :class="{ 'router-link-active': isActive(route) }">
                        {{ route.meta?.title }}
                    </RouterLink>
                </div>
            </nav>

            <button class="menu-button" @click="toggleNavigation" aria-label="Toggle navigation">
                <MenuIcon :fill="'#fff'" />
            </button>
        </div>
    </header>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import MenuIcon from '../svg/outline/menu.vue';
import XIcon from '../svg/outline/x.vue';
import Logo from '../svg/logo/movieace.vue';
import { routes } from '../../routes';

export default defineComponent({
    name: 'BaseHeader',
    components: {
        MenuIcon,
        XIcon,
        RouterLink,
        Logo
    },
    setup() {
        const isNavOpen = ref(false);
        const route = useRoute();

        const toggleNavigation = () => {
            isNavOpen.value = !isNavOpen.value;

            if (isNavOpen.value) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        };

        const closeNavigation = () => {
            isNavOpen.value = false;
            document.body.style.overflow = '';
        };

        const isActive = (navRoute: typeof routes[number]) => {
            const currentPath = route.path;

            if (navRoute.path === '/movies' && currentPath.startsWith('/movie/')) {
                return true;
            }
            if (navRoute.path === '/tv-shows' && currentPath.startsWith('/tv-show/')) {
                return true;
            }
            if (navRoute.path === '/actors' && currentPath.startsWith('/actor/')) {
                return true;
            }
            if (navRoute.path === '/search' && currentPath.startsWith('/search')) {
                return true;
            }

            return currentPath === navRoute.path;
        };

        return {
            routes: routes.filter(route => route.meta?.showInHeader),
            isNavOpen,
            toggleNavigation,
            closeNavigation,
            isActive
        };
    }
});
</script>

<style lang="scss" scoped>
header {
    position: sticky;
    top: 0;
    z-index: 100;
    height: 80px;
    background-color: #0c2738;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;

    &.nav-open::after {
        content: '';
        position: fixed;
        top: 80px;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 90;
    }

    .container {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 100%;
        padding: 0 1.2rem;
        max-width: 1200px;
        margin: 0 auto;
    }

    .logo-container {
        display: flex;
        align-items: center;
        z-index: 101;
    }

    nav {
        display: flex;
        align-items: center;
        height: 100%;

        @media (max-width: 768px) {
            position: fixed;
            top: 0;
            right: -100%;
            width: 80%;
            max-width: 320px;
            height: 100vh;
            background-color: #081b27;
            flex-direction: column;
            align-items: stretch;
            padding: 0;
            box-shadow: -5px 0 15px rgba(0, 0, 0, 0.2);
            transition: right 0.3s ease-in-out;
            z-index: 101;
            overflow-y: auto;
        }

        &.active {
            right: 0;
        }
    }

    .nav-header {
        display: none;

        @media (max-width: 768px) {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 1rem 1.2rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            background-color: #0c2738;
        }

        .mobile-logo {
            height: 40px;
        }

        .close-button {
            background: none;
            border: none;
            cursor: pointer;
            padding: 0.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: background-color 0.2s;

            &:hover {
                background-color: rgba(255, 255, 255, 0.1);
            }
        }
    }

    .nav-links {
        display: flex;
        height: 100%;

        @media (max-width: 768px) {
            flex-direction: column;
            height: auto;
            padding: 1rem 0;
        }
    }

    .nav-link {
        color: #fff;
        font-size: 1rem;
        font-weight: 500;
        text-decoration: none;
        padding: 0 1.2rem;
        height: 100%;
        display: flex;
        align-items: center;
        position: relative;
        transition: color 0.2s;

        &:hover {
            color: #4eb5ff;
        }

        &.router-link-active {
            color: #4eb5ff;

            &::after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 1.2rem;
                right: 1.2rem;
                height: 3px;
                background-color: #4eb5ff;
            }
        }

        @media (max-width: 768px) {
            height: auto;
            padding: 1rem 1.5rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);

            &:hover {
                background-color: rgba(255, 255, 255, 0.05);
            }

            &.router-link-active {
                background-color: rgba(78, 181, 255, 0.1);

                &::after {
                    left: 0;
                    bottom: auto;
                    top: 0;
                    width: 4px;
                    height: 100%;
                    right: auto;
                }
            }
        }
    }

    .menu-button {
        display: none;
        background-color: #081b27;
        border: none;
        border-radius: 8px;
        padding: 0.75rem;
        cursor: pointer;
        transition: background-color 0.2s;

        &:hover {
            background-color: #0a243a;
        }

        @media (max-width: 768px) {
            display: flex;
            align-items: center;
            justify-content: center;
        }
    }
}
</style>