<script>
import { defineProps,h, ref, onMounted } from "vue"
import{ useMessage} from "naive-ui"
import {NTag} from 'naive-ui'
import ApiFunc from '../utils/request.js'

export default {
    components:{NTag},
    // emits:['show_date'],
    props: {
        note_date:{
            type: Object,
            default: {year:2020,month:1,day:1},

        }
    },
    // async beforeMount(props){

    // },

    setup(props) {
        window.$message = useMessage() // 全局消息提示 for request.js

        // 需要用这种方式来获取axios的值
        // 这里用的技巧应该是动态加载数据，先载入ref，之后promise结束后更新值
        const note_exist = ref(false);
        const note_id = ref('0');
        const note_content = ref('null');
        (async () => {
            const check_result = await checkExistNote(props.note_date);
            note_exist.value = check_result['note_exist'];
            note_content.value = check_result['show_data'];
            note_id.value = check_result['note_id'];
        })();

        function renderFunc(){
            return note_exist.value && h(
                NTag,
                {
                    type:'info',
                    size:"large",
                    class:"tag-full",
                    onClick:()=>jumpToNote(note_id.value)
                },
                {default:()=>[note_content.value]}
            )
        }
  
        return ()=> renderFunc()
        // 如果上式还不行就通过返回值，之后再template中调用，是一定可行的。
        // render 函数中包含这个还待观察。
        // return {
        //     is_show,
        //     note_content,
        //     note_id,
        // }

    },
    method:{
        jumpToNote(note_id){
            window.open('siyuan://blocks/'+note_id)
        }
    }

}
function jumpToNote(note_id){
    // url like: siyuan://blocks/20220506192955-ur74gjd
    // siyuan://blocks/[block_id]
    window.location.href = 'siyuan://blocks/'+note_id;
}
async function checkExistNote(check_date){
    const y = check_date['year'];
    const m = check_date['month']>9?check_date['month']:'0'+check_date['month'];
    const d = check_date['day']>9?check_date['day']:'0'+check_date['day'];
    let date_str = y+'-'+m+'-'+d;
    const select_now_sql = {
        "stmt": "SELECT content, ial, id FROM blocks WHERE ial LIKE '%title=\""+date_str+"\"%' limit 1"
    }
    const note_info = await ApiFunc.getNoteByTitle(select_now_sql).then((res) =>{
        let note_exist = false;
        let show_data = '';
        let note_id = 0;
        if(res['data'].length > 0){
            note_exist = true;
            show_data = res['data'][0]['content'];
            note_id = res['data'][0]['id'];
        }
        const result = {'note_exist':note_exist, 'show_data':show_data, 'note_id':note_id};
        return result;
    })
    return note_info;

}



</script>

<template>
    <!-- <n-tag v-if="is_show">
        <a href="siyuan://blocks/{{note_id}}">{{note_content}}</a>
    </n-tag> -->
</template>

<style scoped>
.tag-full{
    width: 100%;
}
</style>