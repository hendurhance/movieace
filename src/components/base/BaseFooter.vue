<template>
    <footer>
        <div class="container">
            <div class="footer-wrapper">
                <Logo :fill="'#fff'" />
                <div class="footer-row">
                    <div class="footer-item" v-for="link in footerLinks" :key="link.id">
                        <h4 class="footer-item-title">{{ link.title }}</h4>
                        <ul class="footer-item-list">
                            <li class="footer-item-list-item" v-for="item in link.links" :key="item.title">
                                <RouterLink :to="item.href" class="footer-item-list-item-link">{{ item.title }}</RouterLink>
                            </li>
                        </ul>
                    </div>
                </div>
                <span>© {{ year }} MovieAce. Built with ❤️ by <a href="https://github.com/hendurhance" target="_blank" class="text-yellow-400">Endurance</a> & <a href="https://github.com/classyrazy" target="_blank" class="text-yellow-400">Razaq</a></span>
                <span>⚡️ Powered by <a href="https://www.themoviedb.org/" target="_blank" class="text-yellow-400">TMDb</a></span>
            </div>
        </div>
    </footer>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { RouterLink } from 'vue-router';
import Logo from '../svg/logo/movieace.vue'
import { footerLinks } from '../../utils/footer-links.ts';
export default defineComponent({
    name: 'BaseFooter',
    components: {
        RouterLink,
        Logo
    },
    setup() {
        const year = ref(new Date().getFullYear());
        return {
            footerLinks,
            year
        }
    }
});
</script>

<style lang="scss" scoped>
footer {
    background-color: #081b27;
    padding: 1.2rem 0;

    .footer-wrapper {
        margin: 5rem 0;
        display: grid;
        place-items: center;

        .footer-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            flex-wrap: wrap;
            text-align: center;

            @media (max-width: 768px) {
                flex-direction: column;
                align-items: center;
            }

            .footer-item {
                width: 200px;
                margin-bottom: 2rem;

                .footer-item-title {
                    font-size: 1.5rem;
                    font-weight: 500;
                    color: #fff;
                    margin-bottom: 1rem;
                }

                .footer-item-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;

                    .footer-item-list-item {
                        margin-bottom: 0.5rem;

                        .footer-item-list-item-link {
                            color: #74a8cf;
                            text-decoration: none;
                            font-size: 1rem;
                            font-weight: 400;
                            transition: all 0.3s ease-in-out;

                            &:hover {
                                color: #f9ca24;
                            }
                        }
                    }
                }
            }
        }

        span {
            color: #fff;
            font-size: 0.8rem;
            font-weight: 400;
            margin-bottom: 0.5rem;

            a {
                color: #fff;
                text-decoration: none;
                font-size: 0.8rem;
                font-weight: 400;
                transition: all 0.3s ease-in-out;

                &:hover {
                    color: #f9ca24;
                }
            }
        }
    }
}
</style>