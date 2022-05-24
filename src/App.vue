<script setup>
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import {ref} from 'vue';
import DailyViews from './components/DailyViews.vue';
import { NConfigProvider, darkTheme, lightTheme } from 'naive-ui';
import { NThemeEditor } from 'naive-ui'

const app_theme = ref(null);

const checkThemeValue = (value) => {
    if (value == 'dark' || value == '1') {
        app_theme.value = darkTheme;
    }else{
        app_theme.value = lightTheme;
    }
}

try{
    let mode = window.top.siyuan.config.appearance.mode; // 主题模式, 0: 明亮, 1: 暗黑
    checkThemeValue(mode);
    // dark_background = getComputedStyle(document.documentElement).getPropertyValue('--b3-theme-background');
    localStorage.setItem("siyuan_calender_bar_theme_switch", mode=='0'?'true':'false');
}catch(e){
    checkThemeValue('light');
    localStorage.setItem("siyuan_calender_bar_theme_switch", 'false');
}


const overridesTheme = ()=>{
    console.log(app_theme.value.name)
    if(app_theme.value.name == 'dark'){
        return  {
            "common": {
                "color": "rgba(50,50,50,0.2)",
                "bodyColor": "rgba(50,50,50,0.4)",
                "borderColorModal":"rgba(50,50,50,0.8)",
                "popoverColor": "rgba(50,50,50,1)"
            },
            "List": {
                "color": "rgba(50,50,50,0.0)"
            },
            "Tag":{
                "textColorInfo":"#FFFFFF",
            }
        };
    }else{
        console.log('over ->light');
        return  {
            "common": {
            }
        };
    }
}
</script>

<template>
  <n-config-provider 
    :theme="app_theme"
    :theme-overrides="overridesTheme()">
    <n-theme-editor>
    <n-scrollbar style="max-height: 780px" x-scrollabl>
      <n-message-provider >
        <daily-views @setThemeValue="checkThemeValue" />
      </n-message-provider>
    </n-scrollbar>
    <!-- 处理响应式的组件 -->
    <n-global-style />
    </n-theme-editor>
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
