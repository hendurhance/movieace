import { createApp } from 'vue'
import './assets/styles/main.scss'
import App from './App.vue'
import { router } from './routes'

const app = createApp(App)
app.use(router)
app.mount('#app')