import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
declare module 'vue-router' {
    interface RouteMeta {
        showInHeader?: boolean
    }
}


const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        name: 'Home',
        component: () => import('../pages/Index.vue'),
        meta: {
            showInHeader: true
        }
    },
    {
        path: '/movies',
        name: 'Movies',
        component: () => import('../pages/Movies.vue'),
        meta: {
            showInHeader: true
        }
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: () => import('../pages/NotFound.vue'),
        meta: {
            showInHeader: false
        }
    },
    {
        path: '/tv-shows',
        name: 'TVShows',
        component: () => import('../pages/TVShows.vue'),
        meta: {
            showInHeader: true
        }
    },
    {
        'path': '/actors',
        'name': 'Actors',
        'component': () => import('../pages/Actors.vue'),
        meta: {
            showInHeader: true
        }
    },
    {
        'path': '/movie/:id',
        'name': 'Movie',
        'component': () => import('../pages/Movie.vue'),
    },
    {
        'path': '/tv-show/:id',
        'name': 'TVShow',
        'component': () => import('../pages/TVShow.vue')
    },
    {
        'path': '/actor/:id',
        'name': 'Actor',
        'component': () => import('../pages/Actor.vue')
    },
    {
        'path': '/search',
        'name': 'Search',
        'component': () => import('../pages/Search.vue')
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export { router, routes }