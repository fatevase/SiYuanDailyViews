<script setup>
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import HelloWorld from './components/HelloWorld.vue'
import DailyViews from './components/DailyViews.vue'
import { NConfigProvider, darkTheme, lightTheme } from 'naive-ui';

</script>

<template>
  <n-config-provider :theme="lightTheme">
  <n-message-provider >
    <daily-views />
  </n-message-provider>
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
