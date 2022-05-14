<script setup>
import { useMessage } from 'naive-ui'
import { defineComponent, h, ref } from 'vue'
import { isYesterday, addDays, isTomorrow } from 'date-fns'
import ShowDaily from './ShowDaily.vue'
const message = useMessage();


const _date = new Date();
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
    message.success(`${year}-${month}-${date}`);
}


function showDate(year, month, day){
    return {'year':year,'month':month,'day':day};
}


</script>

<template>
    <n-space class="calender-layout" vertical justify="center">
        <n-calendar
            :value="default_select"
            #="{ year, month, date }"
            :is-date-disabled="isDateDisabled">
            <!-- @update:value="handleUpdateValue"
        > TODO: fixed click calendar events. -->
        <show-daily :show_date="showDate(year, month, date)" />

        </n-calendar>
    </n-space>
    <n-space></n-space>
</template>

<style scoped>
a {
  color: #42b983;
}
.calender-layout {
    padding-bottom: 2em;
}

</style>
