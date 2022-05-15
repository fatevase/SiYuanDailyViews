import { createApp } from 'vue'
import axios from 'axios'
// import VueAxios from 'vue-axios'
import App from './App.vue'
import naive from 'naive-ui'
const app = createApp(App)
app.use(naive)
// app.use(VueAxios, axios)
// app.provide('axios', app.config.globalProperties.axios)  // provide 'axios'
app.mount('#app')
