<script setup>
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import {ref} from 'vue';
import DailyViews from './components/DailyViews.vue';
import { NConfigProvider, darkTheme, lightTheme } from 'naive-ui';
import { zhCN, dateZhCN } from "naive-ui";
import { NThemeEditor } from 'naive-ui';
import dataset from './utils/dataset.js';
const app_theme = ref(lightTheme);
const app_lang = ref(null);
const app_date_locale = ref(null);

Init();


function checkThemeValue(value){
    if (value == 'dark' || value == '1') {
        app_theme.value = darkTheme;
    }else{
        app_theme.value = lightTheme;
    }
}

function checkLangValue(value='zh_CN'){
    if(value=='zh_CN'){
        app_lang.value = zhCN;
        app_date_locale.value = dateZhCN;
    }else{
        app_lang.value = null;
        app_date_locale.value = null;
    }

    console.log("check lange value", value);
}

const overridesTheme = ()=>{
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

function adjustTheme(){
	let save_data = {}
	try{
		let mode = window.top.siyuan.config.appearance.mode + ''; // 主题模式, 0: 明亮, 1: 暗黑
		let lang = window.top.siyuan.config.appearance.lang + ''; // 语言 , 只检测中文和非中文
        checkLangValue(lang);
        checkThemeValue(mode);
		// dark_background = getComputedStyle(document.documentElement).getPropertyValue('--b3-theme-background');
		
        //check Lang, lang may be never change, so only init when widget open.
        save_data[window.$baseid] = {
		"custom-theme-value": mode=='0'? 'false':'true',

		"custom-lang-value": lang=='zh_CN'? 'zh_CN':'en_US',
		}
	}catch(e){
		dataset.queryData(window.$baseid, 'custom-theme-value').then(data=>{
			checkThemeValue(data);
		});
        dataset.queryData(window.$baseid, 'custom-lang-value').then(data=>{
			checkLangValue(data);
		});
	}
	dataset.saveData(save_data);
}

function Init(){
	let id = 'SiYuan-DailyViews';
	if (window.frameElement) {
		id = window.frameElement.parentElement.parentElement.dataset.nodeId;
	}else {
		const search = location.search
		const obj = new URLSearchParams(search);
		if(obj.has('blockid')){
			id = obj.get('blockid');
		}
	}
	console.log("Storage Id:",id);
	window.$baseid = id;
	adjustTheme();
}
</script>

<template>
  <n-config-provider 
    :locale="app_lang"
    :date-locale="app_date_locale"
    :theme="app_theme"
    :theme-overrides="overridesTheme()">
    <!-- <n-theme-editor> -->
    <!-- <n-scrollbar style="max-height: 100%" x-scrollabl> -->
      <n-message-provider >
        <daily-views @setThemeValue="checkThemeValue" />
      </n-message-provider>
    <!-- </n-scrollbar> -->
    <!-- 处理响应式的组件 -->
    <n-global-style />
    <!-- </n-theme-editor> -->
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
