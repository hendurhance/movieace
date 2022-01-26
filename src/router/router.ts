/**
 * Setup for Router.ts file
 * 
 * @export Router
 */
import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router"

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        name: 'Index',
        component: () => import(/* webpackChunkName: "home" */ '../views/Index.vue')
    },
    {
        path: '/discover',
        name: 'Discover',
        component: () => import(/* webpackChunkName: "discover" */ '../views/Discover.vue')
    },
    {
        path: '/reviews',
        name: 'Reviews',
        component: () => import(/* webpackChunkName: "reviews" */ '../views/Reviews.vue')
    },
    {
        path: '/:catchAll(.*)',
        name: 'NotFound',
        component: () => import(/* webpackChunkName: "not-found" */ '../views/NotFound.vue')
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router