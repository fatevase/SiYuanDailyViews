//引入http.js文件
import http from './http.js';
    
    //设置个暴露对象
    let ApiFunc = {};

    /* 获取笔记 */
    // 由于开发环境可以使用config中的proxy做代理，build之后要自己手动改下
	// UGN-> URL + GET + NOTE
	console.log(process.env.NODE_ENV);
    let get_note_sql = import.meta.env.VITE_UGN_SQL
    let get_box_note = import.meta.env.VITE_UGN_BOX
    let get_note_config = import.meta.env.VITE_UGN_CONFIG
	let get_block_attrs = import.meta.env.VITE_UGB_ATTRS
	let set_block_attrs = import.meta.env.VITE_USB_ATTRS
	
    


    ApiFunc.getNoteByTitle = (params) => {
        return http.post(get_note_sql, params)
    }
    ApiFunc.getAllRootNotes = (params) => {
        return http.post(get_box_note, params);
    }
    ApiFunc.getNoteConfig = (params) => {
        return http.post(get_note_config, params);
    }
	ApiFunc.getBlockAttrs = (params) => {
        return http.post(get_block_attrs, params);
    }
	ApiFunc.setBlockAttrs = (params) => {
        return http.post(set_block_attrs, params);
    }
    //暴露出这个对象
    export default ApiFunc;