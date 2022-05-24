<script setup>
import {ref, watch, inject, nextTick} from 'vue'
import { useMessage } from 'naive-ui';
import ApiFunc from '../utils/request.js'
import {WindowDevTools24Regular,ArrowCounterclockwise12Regular,Notebook24Regular,NotebookLightning24Regular,
WeatherSunny28Filled,WeatherMoon16Filled, ArrowOutlineUpRight32Regular,} from '@vicons/fluent'

// TODO: 可选择仅显示某一个笔记本下的日记
const optionsRef = ref([
    // {
    // label: '选择你的笔记本',
    // value: '0'
    // }
])
const message = useMessage();
const renovate = inject('reload');
const select_value = ref();
const emit = defineEmits(['setRootNoteId', 'setThemeValue']);
const show_select_list = ref(false);
const theme_value = ref(true);
// test using cache.
// only support string
if (typeof(Storage) !== "undefined") {
    if(localStorage.getItem("siyuan_calender_bar_options") != null){
        try {
            let json_local_data = JSON.parse(localStorage.getItem("siyuan_calender_bar_options"));
            if(json_local_data != null){
                optionsRef.value = json_local_data;
            }
        } catch (error) {
            
        }
    }
    if(localStorage.getItem("siyuan_calender_bar_default_selected") != null){
        try {
            select_value.value = localStorage.getItem("siyuan_calender_bar_default_selected");
        } catch (error) {
            select_value.value = optionsRef.value[-1].value;
        }
        emit('setRootNoteId', select_value.value);
    }
    if(localStorage.getItem("siyuan_calender_bar_theme_switch") != null){
          theme_value.value = localStorage.getItem("siyuan_calender_bar_theme_switch") == "true";
    }
} else {
    // 抱歉！不支持 Web Storage ..

}


(async () => {
    const note_list = await getAllRootNotes();
    if (note_list.length > 0){
        optionsRef.value = [];
        // 清空之前的数据 刷新notebook box list
    }

    for(var nslot in note_list){
        console.log('got box note: ' + note_list[nslot].id + ' ' + note_list[nslot].name + ' ' + note_list[nslot].sort);
        optionsRef.value.push(
            {
                label: `${note_list[nslot].sort} - ${note_list[nslot].name}`,
                value: note_list[nslot]['id'],
            }
        );
    }
    localStorage.setItem("siyuan_calender_bar_options", JSON.stringify(optionsRef.value));
})();



// watch(
//     () => select_value.value,
//     (newVal, oldVal) => {
//         // if oldVal != newVal{}
//         if (oldVal != newVal){
//             emit('setRootNoteId', newVal);
//             console.log(newVal, oldVal);
//             if (newVal.value != '0'){
//                 localStorage.setItem("siyuan_calender_bar_default_selected", newVal);
//             }
//         }
//     },
//     { immediate: true, deep: true }
// );

async function getAllRootNotes(){
    // 可以通过 window.config.top.notebooks 获取到所有的box id ...不建议 建议直接使用给的api
    const post_data = {}
    const note_info = await ApiFunc.getAllRootNotes(post_data).then((res) =>{
        if(res['data']['notebooks'].length > 0){
            return res['data']['notebooks'];
        }
        return [{'id':0, "name":'null',"icon":0, "sort":0, "close":false}]
    })
    return note_info;
}

const handleScroll = (e) => {
    const currentTarget = e.currentTarget
    if (currentTarget.scrollTop + currentTarget.offsetHeight >=
        currentTarget.scrollHeight) {
            (async () => {
                const note_list = await getAllRootNotes();
                for(var nslot in note_list){
                    if(nslot > optionsRef.value.length){
                        optionsRef.value.push({
                            label: `${note_list[nslot].sort} - ${note_list[nslot].name}`,
                            value: note_list[nslot]['if'],
                        });
                    }
                }
            })();
        console.log('scroll!');
        localStorage.setItem("siyuan_calender_bar_options", JSON.stringify(optionsRef.value));
    }
}

const handleUpdateSelect = (svalue, options) => {
    // 这里处理回调的点击事件，就不用watch来监听了。
    if (svalue != select_value.value){
        select_value.value = svalue;
        emit('setRootNoteId', svalue);
        if (svalue != '0'){
            localStorage.setItem("siyuan_calender_bar_default_selected", svalue);
        }
    }

}

const refreshComps = () => {
    renovate();
}

const changeThemes = (value) => {
    if (value){
        emit('setThemeValue', 'dark');
    }else{
        emit('setThemeValue', 'light');
    }
    theme_value.value = value;
    localStorage.setItem("siyuan_calender_bar_theme_switch", value);
}

const float_menu_x = ref(0)
const float_menu_y = ref(0)
const show_float_menu = ref(false)
const handleSelect = (key) => {
        show_float_menu.value = false
        message.info(String(key))
}

const handleClick = (e) => {
      if (show_float_menu.value) {
        show_float_menu.value = false
      } else {
        show_float_menu.value = true
        float_menu_x.value = e.clientX-e.offsetX+30
        float_menu_y.value = e.clientY-e.offsetY
      }
    }
const clickOutside = () => {
    show_float_menu.value = false;
}
</script>

<template>
  <n-popover 
    :show="show_float_menu" 
    :on-clickoutside="clickOutside" 
    :x="float_menu_x" :y="float_menu_y"
    :flip="true"
    width="150px"
    placement="top-end"
    trigger="manual">
    <n-list>
        <template #header>
            <h3 style="margin:0px; margin-top:-20px">Settings</h3>
        </template>
        <n-list-item>
            <n-thing title="" title-extra="选择需要显示的日记">
            <!-- <n-ellipsis style="max-width: 240px"> -->
            <n-select
                v-model:value="select_value"
                :options="optionsRef"
                :reset-menu-on-options-change="false"
                :on-update:value="handleUpdateSelect"
                v-model:show="show_select_list"
                @scroll="handleScroll"
                placeholder="选择对应日记的笔记本"
                style="max-width: 150px;">
                <template #arrow>
                    <transition name="slide-left">
                        <notebook-lightning-24-regular v-if="show_select_list" />
                        <notebook-24-regular v-else />
                    </transition>
                </template>
            </n-select>
            <!-- </n-ellipsis> -->
            </n-thing>
        </n-list-item>
        <n-list-item>
            <n-space justify="center">
            <n-switch
                :value='theme_value'
                :on-update:value="changeThemes"
                size="large">
                <template #checked-icon>
                    <n-icon :component="WeatherMoon16Filled" />
                </template>
                <template #unchecked-icon>
                    <n-icon :component="WeatherSunny28Filled" />
                </template>
                <template #checked>
                    黑夜
                </template>
                <template #unchecked>
                明亮
                </template>
            </n-switch>
            </n-space>
        </n-list-item>
        <n-list-item>
            <n-space justify="center">
            <n-button tertiary round :on-click="refreshComps" size="small">
                <template #icon>
                    <n-icon>
                    <arrow-counterclockwise-12-regular />
                    </n-icon>
                </template>
                    刷新页面
            </n-button>
            </n-space>
        </n-list-item>
    </n-list>
  </n-popover>

    <n-back-top :visibility-height="0" style="margin-right:0px; opacity:0.8" :onclick="handleClick">
    <n-icon :size="28"><WindowDevTools24Regular/></n-icon>
    </n-back-top>

<!-- 上面是悬浮的menu，下面是顶部的bar -->

<n-collapse accordion>
<n-collapse-item title=" Menu" name="1">
    <template #arrow>
      <n-icon :size="24">
        <ArrowOutlineUpRight32Regular />
      </n-icon>
    </template>

<n-grid x-gap='12' :cols='3'>
    <n-gi></n-gi>
    <n-gi>
        <n-select
            v-model:value="select_value"
            :options="optionsRef"
            :reset-menu-on-options-change="false"
            :on-update:value="handleUpdateSelect"
            v-model:show="show_select_list"
            @scroll="handleScroll"
            placeholder="-------选择对应日记的笔记本-------">
            <template #arrow>
            <transition name="slide-left">
                <notebook-lightning-24-regular v-if="show_select_list" />
                <notebook-24-regular v-else />
            </transition>
            </template>
        </n-select>
    </n-gi>
    <n-gi>
        <n-grid x-gap="12" :cols='2'>
            <n-gi>
                <n-button tertiary round :on-click="refreshComps" size="small">
                    <template #icon>
                        <n-icon>
                        <arrow-counterclockwise-12-regular />
                        </n-icon>
                    </template>
                        刷新页面
                </n-button>    
            </n-gi>
            <n-gi>
                <n-switch
                    :value='theme_value'
                    :on-update:value="changeThemes"
                    size="large">
                    <template #checked-icon>
                        <n-icon :component="WeatherMoon16Filled" />
                    </template>
                    <template #unchecked-icon>
                        <n-icon :component="WeatherSunny28Filled" />
                    </template>
                    <template #checked>
                     黑夜
                    </template>
                    <template #unchecked>
                    明亮
                    </template>
                </n-switch>         
            </n-gi>
        </n-grid>
    </n-gi>
</n-grid>
    <n-divider />
</n-collapse-item>

</n-collapse>



</template>

<script scoped>

</script>