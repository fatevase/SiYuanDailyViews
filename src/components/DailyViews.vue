<script setup>
import { useMessage } from 'naive-ui'
import { defineComponent, h, ref } from 'vue'
import { isYesterday, addDays, isTomorrow } from 'date-fns'
import DailyData from './DailyData.vue'
const message = useMessage();

let value = ref(addDays(Date.now(), 1).valueOf());

const test_old_data = {'2022-5-12':'11', '2022-5-13':'22','2022-5-14':'33'}

const isDateDisabled=(timestamp)=> {
    if (timestamp > Date.now()) {
        return true;
    }
return false;
}

const handleUpdateValue=(_, { year, month, date })=> {
    message.success(`${year}-${month}-${date}`);
}

const showOldDaily=(show_date)=>{
    if(show_date in test_old_data){
        console.log(test_old_data[show_date]);
        h(
            'div',
            {
                style: {}
            },
            {default:()=>"null"}
        )
        return renderData('123');
    }
}




</script>

<template>
    <n-space class="calender-layout" vertical justify="center">
        <n-calendar
            v-model:value="value"
            #="{ year, month, date }"
            :is-date-disabled="isDateDisabled"
            @update:value="handleUpdateValue"
        >
        <n-tag type="success" class="tag-full" size="large" v-if="true">
            
            {{showOldDaily()}}
            <DailyData show_date="2022-5-22" />
        </n-tag>
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
.tag-full{
    width: 100%;
}
</style>
