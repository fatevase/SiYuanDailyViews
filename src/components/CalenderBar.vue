<script setup>
import {ref, watch} from 'vue'
import ApiFunc from '../utils/request.js'
// TODO: 可选择仅显示某一个笔记本下的日记
    const optionsRef = ref([
        {
        label: 'Null',
        value: '0'
        }
    ])
const select_value = ref(0);
const emit = defineEmits(['setRootNoteId']);
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

    if(note_list.length > 0){
        const splice_i = optionsRef.value.findIndex(item => item['value'] == '0');
        if(splice_i >= 0){
            optionsRef.value.splice(splice_i, 1);
        }
        // 如果存在note，就把占位的options剔除掉
    }
    for(var nslot in note_list){
        let splice_i = optionsRef.value.findIndex(item => item.value ===  note_list[nslot].id);
        if(splice_i >= 0){
            optionsRef.value.splice(splice_i, 1);
        }
        optionsRef.value.push(
            {
                label: `${note_list[nslot].sort} - ${note_list[nslot].name}`,
                value: note_list[nslot]['id'],
            }
        );
    }
    localStorage.setItem("siyuan_calender_bar_options", JSON.stringify(optionsRef.value));
})();



watch(
	() => select_value.value,
	(newVal, oldVal) => {
        // if oldVal != newVal{}
        if (oldVal != newVal){
            emit('setRootNoteId', newVal);
            console.log(newVal, oldVal);
            localStorage.setItem("siyuan_calender_bar_default_selected", newVal);
        }
	},
	{ immediate: true, deep: true }
);

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
</script>

<template>
  <n-select
    v-model:value="select_value"
    :options="optionsRef"
    :reset-menu-on-options-change="false"
    @scroll="handleScroll"
  />
</template>

<script scoped>
</script>