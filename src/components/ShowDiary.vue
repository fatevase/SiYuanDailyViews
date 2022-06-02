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
      const check_result = await checkExistNote(props.show_note_index);
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
               "id FROM blocks WHERE id IN ( "+search_daily_id+" ) "+
               "AND content!='' GROUP BY content LIMIT 1"


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

  concat_sql = "SELECT * FROM ("+search_title+
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

  // TODO: if daily was null, try search any note thought create time.
  // BUG: always need repeat check note status. need fixed when bar search.
  if(!note_info['exist'] && box_id != '0'){
      note_info = await checkDailyStatus(box_id).then((res) => {
        console.log(res)
        if(!res){
          let note_by_time = searchAnyNoteByTime(y+m+d, box_id);
          return note_by_time;
        }
        return note_info;
      })
  }

  // --- End ---

  let diary_event = -1;
  if(box_id!='0' && note_info['show_title'].replace(/[^0-9]/g, '')!=y+m+d && note_info['show_title']!=''){
    diary_event = await searchSameDiary(y+'-'+m+'-'+d, note_info['show_title'], box_id);
  }
  note_info['event'] = diary_event;
  return note_info;

}

async function checkDailyStatus(box_id){
  const result = await ApiFunc.getNoteConfig({"notebook":box_id}).then((res) =>{
    if(res['data']){
      const daily_root_path = res['data']['conf']['dailyNoteSavePath'].split('/')[1];
      const search_sql = {
        "stmt": "SELECT id FROM blocks WHERE hpath LIKE '"+"/"+daily_root_path+"/"+
        "%' AND box = '"+box_id+"'"
      }
      return search_sql;
    }
    return null;
  }).then((res) =>{
    if(res){  
      return ApiFunc.getNoteBySql(res);
    }else{
      return null;
    }
  }).then((res) =>{
    if(res){
      if(res['data'].length > 0){
        return true;
    }
    }
    return false;
  })
  return result;
}

async function searchAnyNoteByTime(date_str, box_id){

  let search_daily_id = "SELECT id FROM blocks WHERE "+
              "created LIKE '"+date_str+"%' "+
              "AND parent_id = '' "+
              "AND box='"+box_id+"' LIMIT 1"
    
  let search_title = "SELECT content as content,"+
            "CASE WHEN subtype IS '' THEN 'title' ELSE subtype END AS type , "+
            "id FROM blocks WHERE parent_id='' "+
            "AND created LIKE '"+date_str+"%' "+
            "AND content!='' "+
            "AND box='"+box_id+"' GROUP BY content LIMIT 1"

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
  console.log(concat_sql)
  const note_by_time = await ApiFunc.getNoteBySql({"stmt": concat_sql}).then((res) =>{
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
            show_title = _data['content'];
            note_id = _data['id'];
          }else if(_data['type'] == 'tag'){
            note_tags.push(getSyLabel(_data['content']));
          }else if(_data['type'] == 'h2'){
            note_subtitle.push(_data['content']);
          }
        }
        note_exist = true;
      }
      return {
        "exist": note_exist,
        "show_title": show_title,
        "id": note_id,
        "tags": note_tags,
        "subtitile": note_subtitle,
      }
    })
  return note_by_time;
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