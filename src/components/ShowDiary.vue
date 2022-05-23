<script>
import { h, ref, inject } from "vue"
import{ useMessage} from "naive-ui"
import {NTag} from 'naive-ui'
import ApiFunc from '../utils/request.js'
import randTools from '../utils/randomTools.js'

// TODO: 增加笔记检索缓存
// TODO: 增加标签

export default {
    components:{NTag},
    // emits:['show_date'],
    props: {
        show_note_index:{
            type: Object,
            default: {year:2020, month:1, day:1, root_note_id:0},

        }
    },
    data(){
        return {
            renovate: inject('reload'),
        }
    },
    setup(props) {
        
        window.$message = useMessage() // 全局消息提示 for request.js

        // 需要用这种方式来获取axios的值
        // 动态加载数据，先载入ref，之后promise结束后更新值
        const note_exist = ref(false);
        const note_id = ref('0');
        const note_content = ref('null');
        const note_tags = ref([]);
        const random_color = ref('#000000');
        (async () => {
            const check_result = await checkExistNote(props.show_note_index);
            note_exist.value = check_result['note_exist'];
            note_content.value = check_result['show_data'];
            note_id.value = check_result['note_id'];
            note_tags.value = check_result['note_tags'];
            random_color.value = randTools.randomColor(note_tags.value);
        })();

        function renderAllTemplate(){
            return note_exist.value && h(
                'ul',{class:"tag-ul"},{default:()=>[
                h(NTag,
                    {
                        type:'info',
                        size:"large",
                        class:"tag-full",
                        onClick:()=>jumpToNote(note_id.value)},
                    {default:()=>[note_content.value]}
                ),
                (note_tags.value.length>0)&&
                note_tags.value.map(item=>h(NTag,{
                    round:true,
                    size:'small',
                    color:{'color':random_color.value,
                            'borderColor': randTools.colorReverse(random_color.value)},
                },{default:()=>[item]}))
                ]}
            )
        }

        return ()=> renderAllTemplate()
        // 如果上式还不行就通过返回值，之后在template中调用。
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
    },
    watch:{
        show_note_index(newVal, oldVal){
            if(newVal.root_note_id != oldVal.root_note_id){
                // 修复点击任意点都会闪一下的问题。
                this.renovate()
            }
        }
    }

}
function jumpToNote(note_id){
    // siyuan://blocks/[block_id]
    window.location.href = 'siyuan://blocks/'+note_id;
}
async function checkExistNote(check_data){
    const y = check_data['year'];
    const m = check_data['month']>9?check_data['month']:'0'+check_data['month'];
    const d = check_data['day']>9?check_data['day']:'0'+check_data['day'];
    const box_id = check_data['root_note_id'];
    // for sql. match any character
    let date_str = y+'_'+m+'_'+d; 
    const select_note_sql = {
        "stmt": ""
    }
    // only for one labels
    // sql https://stackoverflow.com/questions/1415328/combining-union-and-limit-operations-in-mysql-query
    // support 3 labels
    if(box_id != '0'){
        select_note_sql['stmt'] = "SELECT * FROM (SELECT tag, content, id FROM blocks "+
									"WHERE ial LIKE '%title=\""+date_str+"\"%' "+
									"AND parent_id = '' AND content !='' AND box='"+box_id+"' GROUP BY content LIMIT 1) "+
									"UNION SELECT * FROM (SELECT tag, content, id FROM blocks "+
									"WHERE parent_id IN (SELECT id FROM blocks "+
									"WHERE ial LIKE '%title=\""+date_str+"\"%' AND "+
									"parent_id = '' AND box='"+box_id+"' LIMIT 1) AND tag !='' GROUP BY tag LIMIT 3)";
    }else{
        select_note_sql['stmt'] = "SELECT * FROM (SELECT tag, content, id FROM blocks "+
									"WHERE ial LIKE '%title=\""+date_str+"\"%' "+
									"AND parent_id = '' AND content !='' GROUP BY content LIMIT 1) "+
									"UNION SELECT * FROM (SELECT tag, content, id FROM blocks "+
									"WHERE parent_id IN (SELECT id FROM blocks "+
									"WHERE ial LIKE '%title=\""+date_str+"\"%' AND "+
									"parent_id = '' LIMIT 1) AND tag !='' GROUP BY tag LIMIT 3)";
    }
  
    const note_info = await ApiFunc.getNoteByTitle(select_note_sql).then((res) =>{
        let note_exist = false;
        let show_data = '';
        let note_id = 0;
        let note_tags = [];
        if(res['data'].length > 0){
			console.log(res['data'])
            for(var i in res['data']){
				if(res['data'][i]['tag'] != ''){
					let label = getSyLabel(res['data'][i]['tag']);
                    if(label.length>0){
                        note_tags.push(label);
                    }
				}else{
                        note_exist = true;
                        show_data = res['data'][i]['content'];
                        note_id = res['data'][i]['id'];
                    }
            }
        }
        const result = {'note_exist':note_exist, 'show_data':show_data,
                        'note_id':note_id, 'note_tags':note_tags};
        return result;
    })
    return note_info;

}

function getSyLabel(content){
    if(content == null) return "";
    if(content.length > 0){
        let try_macth = content.match("\#(.*)\#");
        
        if(try_macth != null) {
            return try_macth[1];
        }
    }
    return "";
}



</script>

<template>
    <!-- <n-tag v-if="is_show">
        <a href="siyuan://blocks/{{note_id}}">{{note_content}}</a>
    </n-tag> -->
</template>

<style scoped>
.tag-ul{
    display: flex;
    flex-direction: row;
    /*justify-content: flex-start;
    align-items: center; */
    flex-wrap: wrap;
    margin: 0;
    padding: 0;
    min-width: 80px;
}
.tag-full{
    width: 100%;
}
</style>