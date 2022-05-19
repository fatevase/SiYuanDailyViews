<script setup>
import { useMessage } from 'naive-ui'
import { defineComponent, h, ref, provide, nextTick } from 'vue'
import { isYesterday, addDays, isTomorrow } from 'date-fns'
import ShowDiary from './ShowDiary.vue'
import CalenderBar from './CalenderBar.vue'

const message = useMessage();

const emit = defineEmits(['setThemeValue']);
const _date = new Date();
const now_month = ref(_date.getMonth() + 1);
const default_select = ref(addDays(_date.getTime(), 0).valueOf());
const root_note_id = ref('0');
// bugs? value was default selected
// :default-value="now_unix_day" was not working

// got all day then times one day seconds got UTC time
// now UTC+0 need -8 hours for chinese
// let time_offest = new Date().getTimezoneOffset()*60*1000;
// let now_date_for_day = time_offest +(Math.floor(_date.getTime() / 86400000) * 86400000)
// let now_unix_day = ref((now_date_for_day)/1000);
// console.log("got:"+now_unix_day.value);



const isDateDisabled=(timestamp)=> {
    if (timestamp > Date.now()) {
        return true;
    }
return false;
}

const handleUpdateValue=(_, { year, month, date })=> {
    default_select.value = new Date(year+'-'+month+'-'+date).getTime();
}

const organSearch = (data) => {
    return {
        'year': data[0],
        'month': data[1],
        'day': data[2],
        'root_note_id': data[3],
    }
}


const freshCalendar=(info) => {
    console.log("info:"+info);

}

const checkFresh=(month) =>{
    console.log("month:"+month+" now_month:"+now_month.value);
    if(month >= now_month.value){
        return true;
    }else{
        return false;
    }
}

const checkRootNoteId = (get_rn_id) => {
    root_note_id.value = get_rn_id;
}

const checkThemeValue = (get_theme_value) => {
    // 这里从子集获取到主题的内容，之后在发送到父级,进而调整主题
    emit('setThemeValue', get_theme_value);
}

// const isRouterActive = ref(false)
// provide('reload', () => {
//   isRouterActive.value = false
//   nextTick(() => {
//     isRouterActive.value = true
//   })
// })

const isRouterAlive = ref(true);
const reload = () => {
    isRouterAlive.value = false;
    nextTick(() => {
        isRouterAlive.value = true;
    });
};

provide("reload", reload);

</script>

<template>
    <calender-bar @setRootNoteId="checkRootNoteId" @setThemeValue="checkThemeValue"/>

    <n-calendar
        class="main-layout"
        :value="default_select"
        #="{ year, month, date }"
        :is-date-disabled="isDateDisabled"
        :on-panel-change="freshCalendar"
        @update:value="handleUpdateValue">
        <!-- 这里我提供了两种方式解决 v-for 循环生成组件后续传值的问题，其一是通过不同的key 传值，这样由于载入不同的key就可以获取不同的组件从而强制加载，
            其二是 通过 reload函数， 通过v-if 判断然后刷新组件，子组件通过watch 传入的root_note_id 是否发生改变而刷新组件。-->
        <show-diary class="diary-layout" :show_note_index="organSearch([year, month, date, root_note_id])" :key="'-'+year+'-'+month+'-'+date" v-if="isRouterAlive"> </show-diary>
    </n-calendar>
</template>

<style scoped>
.diary-layout {

}
a {
  color: #42b983;
}
.calender-layout {
    padding-bottom: 2em;
}
.main-layout {
    min-width: 750px;
    max-height: calc(100vh - 100px);
}

</style>
