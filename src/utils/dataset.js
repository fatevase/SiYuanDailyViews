import ApiFunc from './request.js'
import {ref} from 'vue'
import { CopySelect20Filled, Tv16Regular } from '@vicons/fluent';
let dataset = {}
// TODO: Add Cache.

dataset.saveData = saveData;
dataset.queryData = queryData;

export default dataset;

// using localStorage or save in block attribute
// but only widget in siyuan's browser can save in attrs
// data must be dictionary

async function saveData(data, options=null) {
	console.log('saveData', data);
	let save_path = Object.keys(data);
	for (let i = 0; i < save_path.length; i++){
		let ori_data = data[save_path[i]];
		let block_attrs = await checkBlockAttrs(save_path[i]);

		if(Object.keys(block_attrs).length > 0){
			// save without merge i think
			// let save_data = mergeDict(block_attrs, ori_data);
			let save_data = ori_data;
			save2BlockAttrs({id: save_path[i], attrs: save_data});
		}else{
			save2LocalStorage(save_path[i], data[save_path[i]]);
		}
	}
}

async function queryData(path, names){
	// first try get from block attrs
	let attrs = await checkBlockAttrs(path);
	let result = {};
	console.log("query Path", path)
	console.log('queryData', attrs);
	if(Object.keys(attrs).length > 0){
		if(typeof(names) == "string"){
			if(attrs[names] != null){
				return attrs[names];
			}
		}else{
			// was a list for query
			for(let i = 0; i < names.length; i++){
				if(attrs[names[i]] != null){
					result[names[i]] = attrs[names[i]];
				}
			}
		}
		return result;
	}
	// then try get from localStorage
	if (typeof(Storage) != "undefined") {
		let local_storage = localStorage.getItem(path);
		if(local_storage != null){
			try {
				// console.log('query local storage', local_storage)
				let json_local_data = JSON.parse(local_storage);
				if(json_local_data != null){
					if(typeof(names) == "string"){
						if(json_local_data[names] != null){
							return json_local_data[names];
						}
					}else{
						// was a list for query
						for(let i = 0; i < names.length; i++){
							if(json_local_data[names[i]] != null){
								result[names[i]] = json_local_data[names[i]];
							}
						}
						return result;
					}
				}
			} catch (error) {
				return null;
			}
		}
	}
	return null;

}

function save2LocalStorage(path, data){
	if (typeof(Storage) !== "undefined") {
		if(localStorage.getItem(path) != null){
			try {
				let json_local_data = JSON.parse(localStorage.getItem(path));
				if(json_local_data != null){
					let new_data = mergeDict(json_local_data, data);
					localStorage.setItem(path, JSON.stringify(new_data));
				}
			} catch (error) {
				
			}
		}else{
			localStorage.setItem(path, JSON.stringify(data));
		}
	}else{
		// Sorry! No Web Storage support..
		// TODO: use cookies.
	}
}

async function save2BlockAttrs(data){
	// need await ?
	let result = ApiFunc.setBlockAttrs(data).then(res=>{
		if(res.code==0){
			return true;
		}
		return false;
	});
}

function mergeDict(ori_dict, new_dict){
	let result = {};
	let keys = Object.keys(ori_dict);
	for(let i = 0; i < keys.length; i++){
		result[keys[i]] = ori_dict[keys[i]];
	}
	keys = Object.keys(new_dict);
	for(let i = 0; i < keys.length; i++){
		// TODO: maybe sub-value was dict and need merge too.
		new_dict[keys[i]] = new_dict[keys[i]].replace(/&quot;/g, '"');
		// console.log('mergeDict', new_dict[keys[i]])

		if(typeof(new_dict[keys[i]]) == "object"){
			// dict to string.
			// " => ' (save " will become quot in attrs')
			result[keys[i]] = JSON.stringify(new_dict[keys[i]])//.replace(/"/g, "'");
		}else{
			result[keys[i]] = new_dict[keys[i]];
		}
	}
	return result;
}


async function checkBlockAttrs(id){
	// need await?
	let attrs = await ApiFunc.getBlockAttrs({'id':id});

	if(Object.keys(attrs.data).length > 0){
		console.log('checkBlockattrs', attrs)
		return attrs.data;
	}
	return [];

}

// judge can using JSON.parse
function isJson(str){
	try {
		JSON.parse(str);
	} catch (e) {
		return false;
	}
	return true;
}