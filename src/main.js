import { createApp } from 'vue'
import axios from 'axios'
import App from './App.vue'
import naive from 'naive-ui'
const app = createApp(App)
app.use(naive)
// app.use(axios)
app.mount('#app')
