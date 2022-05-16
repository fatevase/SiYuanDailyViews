//引入http.js文件
import http from './http.js';
	
	//设置个暴露对象
	let ApiFunc = {};
	let get_noet_sql_url = ''
	
	/* 获取笔记 */
	// 由于开发环境可以使用config中的proxy做代理，build之后要自己手动改下
	if(process.env.NODE_ENV=="development"){
		get_noet_sql_url = '/siyuan_sql';
	}else{
		get_noet_sql_url = '/api/query/sql'
	}

	ApiFunc.getNoteByTitle = (params) => {
		return http.post(get_noet_sql_url, params)
	}
	// ApiFunc.getNoteByTitle = (params) => {
	// 	return http.post('/siyuan_sql', params)
	// }
	
	//暴露出这个对象
	export default ApiFunc;
