import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'
import './assets/styles/dark-mode.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import 'animate.css'
import { Toast, options } from './plugins/toast'

const app = createApp(App)

app.use(router)
app.use(Toast, options)
app.mount('#app')
