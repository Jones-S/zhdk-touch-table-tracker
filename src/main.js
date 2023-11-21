import './assets/fonts.css'
import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router/router'

console.log('Starting up vue3 app... 🦤')

const app = createApp(App)
app.use(router)
app.mount('#app')
