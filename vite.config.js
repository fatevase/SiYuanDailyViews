import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],

  server: {
      proxy: {
          '/siyuan_sql': {
              target: 'http://127.0.0.1:6806/api/query/sql', //接口域名
              changeOrigin: true,                            //是否跨域
              ws: true,                                      //是否代理 websockets
              secure: false,                                  //是否https接口
              pathRewrite: {                                 //路径重置
                  '^/siyuan_sql': ''
              }
          }
      }
  },

})



