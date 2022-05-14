//引入刚才的http.js文件
import http from './http.js';
	
	//设置个对象，就不用一个个暴露了，直接暴露对象
	let ApiFunc = {};
	
	/* 获取笔记 */
	/* /api/getlist是请求接口地址，有http.js里面的Ip加上，如：http:192.168.0.1:9090//api/getlist  */
	ApiFunc.getNoteByTitle = (params) => {
		return http.post('http://127.0.0.1:6806/api/query/sql', params)
	}
	
	
	//暴露出这个对象
	export default ApiFunc;
