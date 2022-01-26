import { createApp } from 'vue'
import App from './App.vue'

/**
 * Router import
 * @import Router.ts
 */

import router from './router/router'


createApp(App).use(router).mount('#app')
