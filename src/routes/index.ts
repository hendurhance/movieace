import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        name: 'Home',
        component: () => import('../pages/Index.vue')
    },
    {
        path: '/reviews',
        name: 'Reviews',
        component: () => import('../pages/Reviews.vue')
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: () => import('../pages/NotFound.vue')
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export { router, routes }