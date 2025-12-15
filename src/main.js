import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'
import '@fortawesome/fontawesome-free/css/all.min.css'

// Importar Bootstrap CSS y JS
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

const app = createApp(App)

app.use(router)
app.mount('#app')