import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
declare module 'vue-router' {
    interface RouteMeta {
        showInHeader?: boolean,
        title?: string
    }
}


const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        name: 'Home',
        component: () => import('../pages/Index.vue'),
        meta: {
            showInHeader: true,
            title: 'Home'
        }
    },
    {
        path: '/movies',
        name: 'Movies',
        component: () => import('../pages/Movies.vue'),
        meta: {
            showInHeader: true,
            title: 'Movies'
        }
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: () => import('../pages/NotFound.vue'),
        meta: {
            showInHeader: false,
            title: 'Not Found'
        }
    },
    {
        path: '/tv-shows',
        name: 'TVShows',
        component: () => import('../pages/TVShows.vue'),
        meta: {
            showInHeader: true,
            title: 'TV Shows'
        }
    },
    {
        'path': '/actors',
        'name': 'Actors',
        'component': () => import('../pages/Actors.vue'),
        meta: {
            showInHeader: true,
            title: 'Actors'
        }
    },
    {
        'path': '/movie/:id',
        'name': 'Movie',
        'component': () => import('../pages/Movie.vue'),
        meta: {
            showInHeader: false,
            title: 'Movie'
        }
    },
    {
        'path': '/tv-show/:id',
        'name': 'TVShow',
        'component': () => import('../pages/TVShow.vue'),
        meta: {
            showInHeader: false,
            title: 'TV Show'
        }
    },
    {
        'path': '/actor/:id',
        'name': 'Actor',
        'component': () => import('../pages/Actor.vue'),
        meta: {
            showInHeader: false,
            title: 'Actor'
        }
    },
    {
        'path': '/search',
        'name': 'Search',
        'component': () => import('../pages/Search.vue'),
        meta: {
            showInHeader: true,
            title: 'Search'
        }
    },
    {
        'path': '/stream/movie/:id',
        'name': 'StreamMovie',
        'component': () => import('../pages/StreamMovie.vue'),
        meta: {
            showInHeader: false,
            title: 'Stream Movie'
        }
    },
    {
        'path': '/stream/tv-show/:id/season/:season/episode/:episode',
        'name': 'StreamTVShow',
        'component': () => import('../pages/StreamTVShow.vue'),
        meta: {
            showInHeader: false,
            title: 'Stream TV Show'
        }
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export { router, routes }