<script>
import { h, ref, inject } from "vue"
import{ useMessage} from "naive-ui"
import {NTag, NPopover, NEllipsis, NThing, NSpace, NIcon} from 'naive-ui';
import {AirplaneTakeOff24Regular, Airplane20Filled} from '@vicons/fluent';
import {AirplaneTicketOutlined} from '@vicons/material';

import ApiFunc from '../utils/request.js';
import randTools from '../utils/randomTools.js';
import dateTools from '../utils/dateTools.js';

// TODO: 增加笔记检索缓存(暂时不做)
// TODO: 添加心情图标
// TODO: 丰富弹出框内容
// TODO: 优化日记事件显示

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
	// 减少检索次数 如果搜索的日期大于当前日期 则不搜索(压根没创建)
	const g_time = dateTools.getNowDate()
	if(g_time.year*10000+g_time.month*100+g_time.day <
		props.show_note_index.year*10000+props.show_note_index.month*100+props.show_note_index.day){

		return ()=>null;
	}
	// 初始化日记列表
	

    window.$message = useMessage() // 全局消息提示 for request.js
    // 需要用这种方式来获取axios的值
    // 动态加载数据，先载入ref，之后promise结束后更新值
    const note_exist = ref(false);
    const note_id = ref('0');
    const note_title = ref('null');
    const note_tags = ref([]);
    const rcolor_subtitle = ref('#000000');
    const rcolor_tag = ref('#000000');
    const note_subtitle = ref([]);
    const note_event = ref(-1);
    (async () => {
      const check_result = await searchExistDiary(props.show_note_index);
      note_exist.value = check_result["exist"];
      note_title.value = check_result['show_title'];
      note_id.value = check_result["id"];
      note_tags.value = check_result["tags"];
      note_subtitle.value = check_result["subtitile"];
      note_event.value = check_result["event"];
      rcolor_tag.value = randTools.randomColor("tags"+note_title.value);
      rcolor_subtitle.value = randTools.randomColor(note_title.value+"stitles");
      
    })();

    function renderAllTemplate(){
      return note_exist.value && h(NSpace,{vertical:true,class:"tag-ul"},()=>[
          // h(NSpace,{wrap:false, justify:"space-around", class:"space-full"},()=>[
            h(NPopover,{width: 'trigger', trigger: "hover", class: "tag-full"},
              {
              // trigger show content
              trigger:()=>h(NTag, {
                    type: note_event.value>-1?"error":note_tags.value.length>0?"primary":"info",
                    size:"large", class:"tag-full",
                    onClick:()=>jumpToNote(note_id.value),
                  }, 
                    ()=>h(NSpace,{wrap:false, justify:"end"},()=>[
                      note_event.value!=0&&h(NEllipsis,{tooltip:false,style:"max-width: 90px;padding-top:4px;"},()=>[note_title.value,]),
                      note_event.value==0&&h(NIcon, {size:"20"},()=>h(Airplane20Filled,{})),
                      note_event.value==1&&h(NIcon, {size:"20"},()=>h(AirplaneTicketOutlined,{})),
                      note_event.value==2&&h(NIcon, {size:"20"},()=>h(AirplaneTakeOff24Regular,{})), 
                    ])
                  ),
              
              // pop content
              default:()=>[
                h(NThing,{},
                  {header:()=>[h(NSpace,{style:"font-weight:bold;font-size:0.9em;"},()=>[note_title.value])],
                  description:()=>(note_tags.value.length>0)&&
                              note_tags.value.map(item=>h(NTag,{
                                size:'small',
                                color:{'color':rcolor_tag.value, 'borderColor': randTools.colorReverse(rcolor_tag.value)},
                              },()=>[item])),
                  footer:()=>[(note_tags.value.length==0)&&h(NSpace,{style:"font-size:0.7em;float:right;"},()=>["空空如也..."])],
                  default:()=>[]}),
                
              ]}
            ),

          // ]),
          
          h(NSpace, {wrap:true, style:"padding-left:10px"}, ()=>[
            (note_subtitle.value.length>0)&&note_subtitle.value.map(item=>h(NTag,{
              round:true,
              size:'small',
              style:"margin:-9px;",
              color:{'color':rcolor_subtitle.value,
                  'borderColor': randTools.colorReverse(rcolor_subtitle.value)},
            },()=>[item]))
          ])
        ]
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
    let virtual_link = main_window.createElement("a")
    virtual_link.setAttribute("href",`siyuan://blocks/${id}`)
    document.body.appendChild(virtual_link)
    let click_event =  main_window.createEvent('MouseEvents')
    click_event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    virtual_link.dispatchEvent(click_event);
    virtual_link.remove()
  }
}

async function searchExistDiary(check_data){
  const y = check_data['year'];
  const m = check_data['month']>9?check_data['month']:'0'+check_data['month'];
  const d = check_data['day']>9?check_data['day']:'0'+check_data['day'];
  const box_id = check_data['root_note_id'];
  // for sql. match any character
  let date_str = y+'_'+m+'_'+d;

  let search_daily_id = "";

  // only for one labels
  // sql https://stackoverflow.com/questions/1415328/combining-union-and-limit-operations-in-mysql-query
  // support 3 labels
  if(box_id != '0'){
    search_daily_id = "SELECT id FROM blocks WHERE "+
                "ial LIKE '%title=_"+date_str+"_%' "+
                "AND parent_id = '' "+
                "AND box='"+box_id+"' LIMIT 1"

  }else{
    search_daily_id = "SELECT id FROM blocks WHERE "+
                "ial LIKE '%title=_"+date_str+"_%' "+
                "AND parent_id = '' "+
                "LIMIT 1"

  }
  let search_title = "SELECT content as content,"+
               "CASE WHEN subtype IS '' THEN 'title' ELSE subtype END AS type , "+
               "id FROM blocks WHERE id IN ( "+search_daily_id+" ) "+
               "AND content!='' GROUP BY content LIMIT 1"

  let search_tag = "SELECT tag as content, "+
        "CASE WHEN subtype IS '' THEN 'tag' ELSE subtype END AS type, "+
        "id FROM blocks WHERE tag!='' "+
        "AND root_id IN ("+search_daily_id+") "+
        "LIMIT 5"

  let search_h1 = "SELECT content as content, subtype as type, id FROM blocks WHERE "+
          "content!='' "+
          "AND subtype='h1' "+
          "AND root_id IN ("+search_daily_id+") "+
          "LIMIT 1"
  let search_h2 = "SELECT content as content, subtype as type, id FROM blocks WHERE "+
          "content!='' "+
          "AND subtype='h2' "+
          "AND root_id IN ("+search_daily_id+") "+
          "LIMIT 3"

  let concat_sql = "SELECT * FROM ("+search_title+
          ") UNION SELECT * FROM ("+search_h1+
          ") UNION SELECT * FROM ("+search_h2+
          ") UNION SELECT * FROM ("+search_tag+
          ")"


  let note_info = await ApiFunc.getNoteBySql({"stmt": concat_sql}).then((res) =>{
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


  let diary_event = -1;
  if(box_id!='0' && note_info['show_title'].replace(/[^0-9]/g, '')!=y+m+d && note_info['show_title']!=''){
    diary_event = await searchSameDiary(y+'-'+m+'-'+d, note_info['show_title'], box_id);
  }
  note_info['event'] = diary_event;
  console.log(note_info);
  return note_info;

}


async function searchSameDiary(search_time, search_title, box_id){
  // 这里判断搜索结果为开始事件还是结束时间 当搜索到结果为1时
  // 通过获取到parent_id的所有数字中的前8个数字与当前日期比大小，
  // 如果大，那么当前就是结束，否则就是开始
  // 应该可行 -.-
  // return 0-> continue, 1->start, 2->end, -1->not
  let result = -1
  let yesterday = dateTools.getAroundDate(search_time, -1, '_');
  let tomorrow = dateTools.getAroundDate(search_time, 1, '_');
  let sql_same = "SELECT parent_id FROM blocks WHERE subtype='h1' "+
          "AND content='"+search_title+"' "+
          "AND root_id IN ("+
          "SELECT id FROM blocks WHERE "+
          "(ial LIKE '%title=_"+yesterday+"_%' "+
          "OR ial LIKE '%title=_"+tomorrow+"_%') "+
          "AND box = '"+box_id+"' "+
          "LIMIT 2)"
  result = await ApiFunc.getNoteBySql({"stmt": sql_same}).then((res) =>{
     if(res['data'].length > 0){
       if(res['data'].length > 1){
        return 0;
       }else{
         // thought hpath to get start point or end.
        let id = res['data'][0]['parent_id'];
        let nebr_number = Number(id.slice(0,8));
        let now_number = Number(search_time.replace(/[^0-9]/g, ''));
        if(now_number > nebr_number){
          return 2;
        }
        return 1;

       }
     }
     return -1;
  })
  return result;
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
  width: 100%;
  margin: 0px;
  padding: 0px;
  min-width: 80px;
}
.tag-full{
  height:30px;
  width: 100%;
  min-width: 80px;
  margin: 0px;
  font-size: 14px;
  text-align:center;
  vertical-align:middle;
  float:center;

}
.space-full{
  width: 100%;
}
</style>