<script>
import { defineProps,h, ref } from "vue"
import {NTag} from 'naive-ui'
const test_old_data = {'2022-5-12':'11', '2022-5-13':'22','2022-5-14':'33'}


export default {
    components:{NTag},
    props: {
        show_date:{
            type: String,
            default: ''
        }
    },
    setup(props){
        let check_result= checkExistNote(props.show_date, test_old_data);
        let is_show = check_result['is_show'];
        let note_content = check_result['show_data'];

        return ()=> [
            is_show && h(NTag,
            {type:"info",class:"tag-full",size:"large", onclick:"alert('click')"},
            {default:()=> [
                note_content],
            }),//这里使用naive-ui标签
        ]
    }
}

function checkExistNote(check_date, all_notes){
    for(var key in all_notes){
        console.log("check_date:"+check_date);
        console.log("key:"+key);
        if(key == check_date){
            return {'is_show':true, 'show_data':all_notes[key]};
        }
    }
    return {'is_show':false, 'show_data':all_notes[key]};

}

</script>

<template>

</template>

<style scoped>
.tag-full{
    width: 100%;
}
</style>