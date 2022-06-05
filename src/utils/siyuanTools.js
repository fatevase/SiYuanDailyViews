let siyuanTools = {};
siyuanTools.VirtualOpen = VirtualOpen;
siyuanTools.getSyLabel = getSyLabel;
siyuanTools.checkDailyStatus = checkDailyStatus;
siyuanTools.generateSql = generateSql;

export default siyuanTools;


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

function getSyLabel(content){
  if(content == null) return "";
  content = content.replace("# #", "|");
  if(content.length > 0){
    let try_macth = content.match("\#(.*)\#");
    
    if(try_macth != null) {
      return try_macth[1];
    }
  }
  return "";
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


function generateSql(note_id, query_map) {

	// if note_id was real id string must add "'"+note_id+"'"
	// if note_id was a sql , dont change any things.
  // only for one labels
  // sql https://stackoverflow.com/questions/1415328/combining-union-and-limit-operations-in-mysql-query
	
	let search_keys = Object.keys(query_map);
	if(search_keys[0] == '0'){
		search_keys = query_map;
	}

  let search_title = "SELECT content as content,"+
		"CASE WHEN subtype IS '' THEN 'title' ELSE subtype END AS type , "+
		"id FROM blocks WHERE id IN ("+note_id+") "+
		"AND content!='' GROUP BY content LIMIT "+(query_map['title']?query_map['title']:'1')+" "

  let search_tag = "SELECT tag as content, "+
        "CASE WHEN subtype IS '' THEN 'tag' ELSE subtype END AS type, "+
        "id FROM blocks WHERE tag!='' "+
        "AND root_id IN ("+note_id+") "+
        "LIMIT "+(query_map['tag']?query_map['tag']:'2')+" "

  let search_h1 = "SELECT content as content, subtype as type, id FROM blocks WHERE "+
          "content!='' "+
          "AND subtype='h1' "+
          "AND root_id IN ("+note_id+") "+
          "LIMIT "+(query_map['h1']?query_map['h1']:'1')+" "

  let search_h2 = "SELECT content as content, subtype as type, id FROM blocks WHERE "+
          "content!='' "+
          "AND subtype='h2' "+
          "AND root_id IN ("+note_id+") "+
          "LIMIT "+(query_map['h2']?query_map['h2']:'2')+" "

	let search_icon = "SELECT SUBSTR(ial, INSTR(ial, 'icon=')+6, 5) AS content,"+
					"CASE WHEN subtype IS '' THEN 'icon' ELSE subtype END AS type, id "+
          "FROM blocks WHERE ial LIKE '%icon=%' "+
          "AND subtype='' "+
          "AND root_id IN ("+note_id+") "+
          "LIMIT "+(query_map['icon']?query_map['icon']:'1')+" "

  let sqls = {
    "title": search_title,
    "tag": search_tag,
    "h1": search_h1,
    "h2": search_h2,
		"icon": search_icon,
  }

  let combined_index = 0;
  let concat_sql = "";
  for(let i = 0; i < search_keys.length; i++){
    let type = search_keys[i];
    let sql = sqls[type];
    if(sql != undefined){
      if(combined_index == 0){
        concat_sql += "SELECT * FROM ("+sql+") ";
      }else{
        concat_sql += "UNION SELECT * FROM ("+sql+") ";
      }
      combined_index = 1;
    }
  }
  return concat_sql;
}