<script setup>
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import {ref} from 'vue';
import DailyViews from './components/DailyViews.vue';
import { NConfigProvider, darkTheme, lightTheme } from 'naive-ui';

const app_theme = ref(lightTheme);
const checkThemeValue = (value) => {
    if (value === 'dark') {
        app_theme.value = darkTheme;
    }else{
        app_theme.value = lightTheme;
    }
}


</script>

<template>
  <n-config-provider :theme="app_theme">
    <n-scrollbar style="max-height: 720px" x-scrollabl>
      <n-message-provider >
        <daily-views @setThemeValue="checkThemeValue" />
      </n-message-provider>
    </n-scrollbar>
    <!-- 处理响应式的组件 -->
    <n-global-style />
  </n-config-provider>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 30px;
}
</style>
