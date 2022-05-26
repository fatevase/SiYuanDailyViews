<script>
import { h, ref, inject } from "vue"
import{ useMessage} from "naive-ui"
import {NTag, NPopover} from 'naive-ui'
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
        const note_title = ref('null');
        const note_tags = ref([]);
        const random_color = ref('#000000');
		const note_subtitle = ref([]);
        (async () => {
            const check_result = await checkExistNote(props.show_note_index);
            note_exist.value = check_result["exist"];
            note_title.value = check_result['show_title'];
            note_id.value = check_result["id"];
            note_tags.value = check_result["tags"];
			note_subtitle.value = check_result["subtitile"];
            random_color.value = randTools.randomColor(note_tags.value);
        })();

        function renderAllTemplate(){
            return note_exist.value && h(
                'ul',{class:"tag-ul"},{default:()=>[
				h(NPopover,{
						width: 'trigger',
						trigger: "hover"
					},
					{trigger:()=>h(NTag, {
								type: note_tags.value.length>0?"success":"info",
								size:"large",
								class:"tag-full",

								onClick:()=>jumpToNote(note_id.value),
							}, {default:()=>[
								note_title.value
							]}),
					default:()=>[
						(note_tags.value.length>0)&&
							note_tags.value.map(item=>h(NTag,{
								round:true,
								size:'small',
								color:{'color':random_color.value,
										'borderColor': randTools.colorReverse(random_color.value)},
						},{default:()=>[item]})),
						(note_tags.value.length==0)&&h('p',{},{default:()=>["空空如也..."]})
					]}

				),
                (note_subtitle.value.length>0)&&
                note_subtitle.value.map(item=>h(NTag,{
                    round:true,
                    size:'small',
                    color:{'color':random_color.value,
                            'borderColor': randTools.colorReverse(random_color.value)},
                },{default:()=>[item]}))
                ]}
            )
        }

        return ()=> renderAllTemplate()
    },
    method:{

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
	VirtualOpen(note_id)
	// window.open('siyuan://blocks/'+note_id)
}

// Thanks leolee9086.
// https://github.com/leolee9086/cc-baselib/blob/main/components/cc-link-siyuan.vue
function VirtualOpen(id){
    if (window!=window.parent){
		let main_window= window.parent.document
		let virtual_link =  main_window.createElement("span")
		virtual_link.setAttribute("data-type","block-ref")
		virtual_link.setAttribute("data-id",id)
		let temp = main_window.querySelector(".protyle-wysiwyg div[data-node-id] div[contenteditable]")
		temp.appendChild(virtual_link)
		let click_event =  main_window.createEvent('MouseEvents')
		click_event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
		virtual_link.dispatchEvent(click_event);
		virtual_link.remove()
	}else{
        let main_window=window.document
        console.log(main_window)
        let virtual_link = main_window.createElement("a")
        virtual_link.setAttribute("href",`siyuan://blocks/${id}`)
        document.body.appendChild(virtual_link)
        let click_event =  main_window.createEvent('MouseEvents')
        click_event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        virtual_link.dispatchEvent(click_event);
        virtual_link.remove()
    }
}

async function checkExistNote(check_data){
    const y = check_data['year'];
    const m = check_data['month']>9?check_data['month']:'0'+check_data['month'];
    const d = check_data['day']>9?check_data['day']:'0'+check_data['day'];
    const box_id = check_data['root_note_id'];
    // for sql. match any character
    let date_str = y+'_'+m+'_'+d;

	let search_daily_id = "";
	let search_title = "";
	let concat_sql = ""

    // only for one labels
    // sql https://stackoverflow.com/questions/1415328/combining-union-and-limit-operations-in-mysql-query
    // support 3 labels
    if(box_id != '0'){
		search_daily_id = "SELECT id FROM blocks WHERE "+
							  "ial LIKE '%title=_"+date_str+"_%' "+
							  "AND parent_id = '' "+
							  "AND box='"+box_id+"' LIMIT 1"
		
		search_title = "SELECT content as content,"+
						   "CASE WHEN subtype IS '' THEN 'title' ELSE subtype END AS type , "+
						   "id FROM blocks WHERE parent_id='' "+
						   "AND ial LIKE '%title=_"+date_str+"_%' "+
						   "AND content!='' "+
						   "AND box='"+box_id+"' GROUP BY content LIMIT 1"


    }else{
		search_daily_id = "SELECT id FROM blocks WHERE "+
							  "ial LIKE '%title=_"+date_str+"_%' "+
							  "AND parent_id = '' "+
							  "LIMIT 1"
		
		
		search_title = "SELECT content as content,"+
						   "CASE WHEN subtype IS '' THEN 'title' ELSE subtype END AS type , "+
						   "id FROM blocks WHERE parent_id='' "+
						   "AND ial LIKE '%title=_"+date_str+"_%' "+
						   "AND content!='' "+
						   "GROUP BY content LIMIT 1"

    }

	let search_tag = "SELECT tag as content, "+
				"CASE WHEN subtype IS '' THEN 'tag' ELSE subtype END AS type, "+
				"id FROM blocks WHERE tag!='' "+
				"AND root_id IN ("+search_daily_id+")"+
				"LIMIT 5"

	let search_h1 = "SELECT content as content, subtype as type, id FROM blocks WHERE "+
					"subtype='h1'"+
						"AND root_id IN ("+search_daily_id+")"+
						"LIMIT 1"
	let search_h2 = "SELECT content as content, subtype as type, id FROM blocks WHERE "+
				"subtype='h2'"+
					"AND root_id IN ("+search_daily_id+")"+
					"LIMIT 3"

	concat_sql = "SELECT * FROM ("+search_title+
					") UNION SELECT * FROM ("+search_h1+
					") UNION SELECT * FROM ("+search_h2+
					") UNION SELECT * FROM ("+search_tag+
					")"


    const note_info = await ApiFunc.getNoteByTitle({"stmt": concat_sql}).then((res) =>{
        let note_exist = false;
        let show_title = '';
        let note_id = 0;
        let note_tags = [];
		let note_subtitle=[];
		let temp_title = "";
        if(res['data'].length > 0){
            for(var i in res['data']){
				let _data = res['data'][i];
				if(_data['type'] == 'title'){
					temp_title = _data['content'];
					note_id = _data['id'];
				}else if(_data['type'] == 'tag'){
					note_tags.push(getSyLabel(_data['content']));
				}else if(_data['type'] == 'h1'){
					show_title = _data['content'];
				}else if(_data['type'] == 'h2'){
					note_subtitle.push(_data['content']);
				}
			}
			note_exist = true;
		}
		if(show_title == ''){
			show_title = temp_title;
		}
		return {
			"exist": note_exist,
			"show_title": show_title,
			"id": note_id,
			"tags": note_tags,
			"subtitile": note_subtitle,
		}
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
        <a href="siyuan://blocks/{{note_id}}">{{note_title}}</a>
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