<script setup>
import {ref, watch, inject} from 'vue'
import ApiFunc from '../utils/request.js'
import {Notebook24Regular, NotebookLightning24Regular, ArrowCounterclockwise12Regular,
WeatherSunny28Filled,WeatherMoon16Filled, ArrowOutlineUpRight32Regular,
} from '@vicons/fluent'
// TODO: 可选择仅显示某一个笔记本下的日记
const optionsRef = ref([
    // {
    // label: '选择你的笔记本',
    // value: '0'
    // }
])
const renovate = inject('reload');
const select_value = ref();
const emit = defineEmits(['setRootNoteId', 'setThemeValue']);
const show_select_list = ref(false);
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
    console.log("------value:"+value);
    if (value){
        emit('setThemeValue', 'dark');
    }else{
        emit('setThemeValue', 'light');
    }
}

</script>

<template>

<n-collapse default-expanded-names="1" accordion>
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