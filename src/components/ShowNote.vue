<script>
import { h, ref, inject } from "vue"
import{ useMessage} from "naive-ui"
import {NTag, NPopover, NEllipsis, NThing, NSpace, NIcon} from 'naive-ui';
import {AirplaneTakeOff24Regular, Airplane20Filled} from '@vicons/fluent';
import {AirplaneTicketOutlined} from '@vicons/material';

import ApiFunc from '../utils/request.js';
import randTools from '../utils/randomTools.js';
import dateTools from '../utils/dateTools.js';

// 单独的页面，与日记不同，索引的是时间
// TODO: 通过按钮切换该页面
// 不同的索引规则，索引当天创建的前两个笔记
// 弹出框显示每个笔记的第一个一级索引 和 1个二级索引 和 3个标签
// 无事件标记

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
	// 初始化笔记列表
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

    const exist_notes = ref([]);
    (async () => {
      exist_notes.value = await queryExistNotes(props.show_note_index);
    })();




    function renderAllTemplate(){
      return  (exist_notes.value)&&h(NSpace,{vertical:true, class:"tag-ul"},()=>exist_notes.value.map(note=>note['id'] && h(NSpace,{vertical:true,class:"tag-ul"},()=>[
          // h(NSpace,{wrap:false, justify:"space-around", class:"space-full"},()=>[
            h(NPopover,{width: 'trigger', trigger: "hover", class: "tag-full"},
              {
              // trigger show content
              trigger:()=>h(NTag, {
                    type: note['tag']?"primary":"info",
                    size:"large", class:"tag-full",
                    onClick:()=>jumpToNote(note['id']),
                  }, 
                    ()=>h(NSpace,{wrap:false, justify:"end"},()=>[
                      h(NEllipsis,{tooltip:false,style:"max-width: 90px;padding-top:4px;"},()=>[note['title'],]),
                    ])
                  ),
              
              // pop content
              default:()=>[
                h(NThing,{},
                  {header:()=>[h(NSpace,{style:"font-weight:bold;font-size:0.9em;"},()=>[note['title'],])],
                  description:()=>(note['tag']!=undefined)&&
                              note['tag'].map(_tag=>(_tag)&&h(NTag,{
                                size:'small',
                                color:{'color':'#ffffff', 'borderColor': randTools.colorReverse("#ffffff")},
                              },()=>[_tag])),
                  footer:()=>[(note['tag']==null)&&h(NSpace,{style:"font-size:0.7em;float:right;"},()=>["空空如也..."])],
                  default:()=>[]}),
                
              ]}
            ),

          // ]),
          
          // h(NSpace, {wrap:true, style:"padding-left:10px"}, ()=>[
          //   (note['h1'])&&note['h1'].map(_h1=>h(NTag,{
          //     round:true,
          //     size:'small',
          //     style:"margin:-9px;",
          //     color:{'color':"#ffffff",
          //         'borderColor': randTools.colorReverse("#ffffff")},
          //   },()=>[h1]))
          // ])
        ]
      )
      ))
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

async function queryExistNotes(check_data){
  const y = check_data['year'];
  const m = check_data['month']>9?check_data['month']:'0'+check_data['month'];
  const d = check_data['day']>9?check_data['day']:'0'+check_data['day'];
  const box_id = check_data['root_note_id'];
  
  let notes_info = [];
  
  // for sql. match any character
  let date_str = y+m+d;

  let search_notes_id = "";
  let concat_sql = ""

  // only for one labels
  // sql https://stackoverflow.com/questions/1415328/combining-union-and-limit-operations-in-mysql-query
  // support 3 labels

  search_notes_id = "SELECT id FROM blocks WHERE "+
            "created LIKE '"+date_str+"%' "+
            "AND type= 'd' "+
            (box_id=='0'?"":"AND box='"+box_id+"' ")+
            "LIMIT 2"

	notes_info = await ApiFunc.getNoteBySql({"stmt": search_notes_id}).then((res)=>{
    // TODO: sort id by some algorithm...
    let all_note_id = [];
    if(res==null){
      return [];
    }

    for(var i=0; i < res['data'].length; i++) {
      all_note_id.push(res['data'][i]['id']);
    }
    return all_note_id;
  }).then((ids)=>{

    let search_promises = [];
    for(var i=0; i < ids.length; i++){
      let note_id = ids[i];
      let note_sql = generateSql(note_id, ['title', 'h1', 'tag']);
      search_promises.push(ApiFunc.getNoteBySql({"stmt": note_sql}).then((res)=>{
        return res;}));
    }
    return Promise.all(search_promises).then((res)=>{return res;});
  }).then((data) =>{
    let all_notes_info = [];
    
    for(var d=0; d<data.length; d++){
      let _note_info = {};
      for(var i in data[d].data){
        let _data = data[d].data[i];
        if(_data['type']=='title'){
          _note_info['id'] = _data['id'];
        }
        _note_info[_data['type']] = [];
        _note_info[_data['type']] = _note_info[_data['type']].concat(_data['content']);
      }
      all_notes_info.push(_note_info);
    }

    // console.log(date_str, "promise all data", data);
    // console.log(date_str,"all_notesinfo", all_notes_info);
    return all_notes_info;
  })
  return notes_info;

}

function generateSql(note_id, search_list) {

  let search_title = "SELECT content as content,"+
		"CASE WHEN subtype IS '' THEN 'title' ELSE subtype END AS type , "+
		"id FROM blocks WHERE id IN ('"+note_id+"') "+
		"AND content!='' GROUP BY content LIMIT 1"

  let search_tag = "SELECT tag as content, "+
        "CASE WHEN subtype IS '' THEN 'tag' ELSE subtype END AS type, "+
        "id FROM blocks WHERE tag!='' "+
        "AND root_id IN ('"+note_id+"') "+
        "LIMIT 5"

  let search_h1 = "SELECT content as content, subtype as type, id FROM blocks WHERE "+
          "content!='' "+
          "AND subtype='h1' "+
          "AND root_id IN ('"+note_id+"') "+
          "LIMIT 1"
  let search_h2 = "SELECT content as content, subtype as type, id FROM blocks WHERE "+
          "content!='' "+
          "AND subtype='h2' "+
          "AND root_id IN ('"+note_id+"') "+
          "LIMIT 3"

  let sqls = {
    "title": search_title,
    "tag": search_tag,
    "h1": search_h1,
    "h2": search_h2
  }

  let combined_index = 0;
  let concat_sql = "";
  for(let i = 0; i < search_list.length; i++){
    let type = search_list[i];
    let sql = sqls[type];
    if(sql != undefined){
      if(combined_index == 0){
        concat_sql += "SELECT * FROM ("+sql+") ";
      }else{
        concat_sql += "UNION ALL SELECT * FROM ("+sql+") ";
      }
      combined_index = 1;
    }
  }

  return concat_sql;
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