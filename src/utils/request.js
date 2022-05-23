//引入http.js文件
import http from './http.js';
    
    //设置个暴露对象
    let ApiFunc = {};
    let get_noet_sql_url = ''
    let get_box_note_url = ''
    let get_note_config_url = ''
    
    /* 获取笔记 */
    // 由于开发环境可以使用config中的proxy做代理，build之后要自己手动改下
    if(process.env.NODE_ENV=="development"){
        get_noet_sql_url = '/sy_sql';
        get_box_note_url = '/sy_gboxn';
        get_note_config_url = '/sy_gnconfig'
    }else{
        get_noet_sql_url = '/api/query/sql'
        get_box_note_url = '/api/notebook/lsNotebooks';
        get_note_config_url = '/api/notebook/getNotebookConf';
    }

    ApiFunc.getNoteByTitle = (params) => {
        return http.post(get_noet_sql_url, params)
    }
    // ApiFunc.getNoteByTitle = (params) => {
    //     return http.post('/siyuan_sql', params)
    // }
    ApiFunc.getAllRootNotes = (params) => {
        return http.post(get_box_note_url, params);
    }
    ApiFunc.getNoteConfig = (params) => {
        return http.post(get_note_config_url, params);
    }
    //暴露出这个对象
    export default ApiFunc;