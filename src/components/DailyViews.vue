<script setup>
import { useMessage } from 'naive-ui'
import { defineComponent, h, ref, computed } from 'vue'
import { isYesterday, addDays, isTomorrow } from 'date-fns'
import ShowDiary from './ShowDiary.vue'

const message = useMessage();


const _date = new Date();
const now_month = ref(_date.getMonth() + 1);
const default_select = ref(addDays(_date.getTime(), 0).valueOf());
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
    default_select.value = new Date(year+'-'+month+'-'+date);
}

const showDate = (date) => {
    return {
        'year': date[0],
        'month': date[1],
        'day': date[2]
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

</script>

<template>
    <n-calendar
        :value="default_select"
        #="{ year, month, date }"
        :is-date-disabled="isDateDisabled"
        :on-panel-change="freshCalendar"
            @update:value="handleUpdateValue">
        <show-diary :note_date="showDate([year, month, date])" :key="year+'-'+month+'-'+date"> </show-diary>
    </n-calendar>
</template>

<style scoped>
a {
  color: #42b983;
}
.calender-layout {
    padding-bottom: 2em;
}
.main-layout {
    min-width: 850px;
}

</style>
