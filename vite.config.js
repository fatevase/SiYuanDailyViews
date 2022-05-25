import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: './',
  build:{
    // minify: 'terser',         // default is esbuild ，但是更慢
    // terserOptions:{
    //   compress:{
    //     drop_console: true,   //build是否dropconsole打印
    //     drop_debugger: true,  //build是否移除debugger
    //   }                                     
    // },
    chunkSizeWarningLimit: 2048,
    outDir: 'dist',
    rollupOptions:{ // 打包输出文件和脚手架格式相仿
      output:{
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: '[ext]/[name]-[hash].[ext]',
      }
    }
  },
  // 为开发服务器配置自定义代理规则, 只用于开发环境
  server: {
    port: 3333, // 配置dev端口
    proxy: {
      '^/sy_sql': {
          target: 'http://127.0.0.1:6806/api/query/sql',  //接口域名
          changeOrigin: true,                             //是否跨域
          ws: true,                                       //是否代理 websockets
          secure: false,                                  //是否https接口
        rewrite: (path) => path.replace(/^\/sy_sql/, ''),
      },
      '^/sy_gboxn': {
          target: 'http://127.0.0.1:6806/api/notebook/lsNotebooks',  //接口域名
          changeOrigin: true,                             //是否跨域
          ws: true,                                       //是否代理 websockets
          secure: false,                                  //是否https接口
        rewrite: (path) => path.replace(/^\/sy_gboxn/, ''),
      },
      '^/sy_gnconfig': {
          target: 'http://127.0.0.1:6806/api/notebook/getNotebookConf',  //接口域名
          changeOrigin: true,                             //是否跨域
          ws: true,                                       //是否代理 websockets
          secure: false,                                  //是否https接口
        rewrite: (path) => path.replace(/^\/sy_gnconfig/, ''),
      },
	  '^/sy_gbattrs': {
          target: 'http://127.0.0.1:6806/api/attr/getBlockAttrs',  //接口域名
          changeOrigin: true,                             //是否跨域
          ws: true,                                       //是否代理 websockets
          secure: false,                                  //是否https接口
        rewrite: (path) => path.replace(/^\/sy_gbattrs/, ''),
      },
	  '^/sy_sbattrs': {
          target: 'http://127.0.0.1:6806/api/attr/setBlockAttrs',  //接口域名
          changeOrigin: true,                             //是否跨域
          ws: true,                                       //是否代理 websockets
          secure: false,                                  //是否https接口
        rewrite: (path) => path.replace(/^\/sy_sbattrs/, ''),
      },
    }
  },
})



