<script setup>
import {ref, watch, inject, nextTick} from 'vue'
import { useMessage } from 'naive-ui';
import ApiFunc from '../utils/request.js';
import dataset from '../utils/dataset.js';
import {WindowDevTools24Regular,ArrowCounterclockwise12Regular,Notebook24Regular,NotebookLightning24Regular,
WeatherSunny28Filled,WeatherMoon16Filled, ArrowOutlineUpRight32Regular,} from '@vicons/fluent'

// TODO: 可选择仅显示某一个笔记本下的日记
const optionsRef = ref([
    // {
    // label: '选择你的笔记本',
    // value: '0'
    // }
])
const message = useMessage();
const renovate = inject('reload');
const select_value = ref();
const emit = defineEmits(['setRootNoteId', 'setThemeValue']);
const show_select_list = ref(false);
const theme_value = ref(true);
// test using cache.
// only support string


dataset.queryData(window.$baseid, 
 ['custom-notebox-list', 'custom-current-notebox', 'custom-theme-value']).then(
	(data)=>{
		if(data!=null){
			console.log("CalenderBar queryData:", data);
			try{
				console.log("CalenderBar notebook:", data['custom-notebox-list']);
				// idk why " => &quot;, so i must replace it when i using parse
				optionsRef.value = JSON.parse(data['custom-notebox-list']?data['custom-notebox-list'].replace(/&quot;/g, '"'):'[]');
			}catch(e){
			}
			select_value.value = data['custom-current-notebox'];
			theme_value.value = data['custom-theme-value']=='dark'?true:false;
			emit('setRootNoteId', select_value.value==null?0:select_value.value);
		}
	}
);

(async () => {
    const note_list = await getAllRootNotes();
    if (note_list.length > 0){
        optionsRef.value = [];
        // 清空之前的数据 刷新notebook box list
    }

    for(var nslot in note_list){
        // console.log('got box note: ' + note_list[nslot].id + ' ' + note_list[nslot].name + ' ' + note_list[nslot].sort);
        optionsRef.value.push(
            {
                label: `${note_list[nslot].sort} - ${note_list[nslot].name}`,
                value: note_list[nslot]['id'],
            }
        );
    }
	let save_data = {}
	console.log("init async", JSON.stringify(optionsRef.value));
	save_data[window.$baseid] = {
		"custom-notebox-list": JSON.stringify(optionsRef.value),
	}
	dataset.saveData(save_data);
})();



// watch(
//     () => select_value.value,
//     (newVal, oldVal) => {
//         // if oldVal != newVal{}
//         if (oldVal != newVal){
//             emit('setRootNoteId', newVal);
//             console.log(newVal, oldVal);
//             if (newVal.value != '0'){
//                 localStorage.setItem("siyuan_calender_bar_default_selected", newVal);
//             }
//         }
//     },
//     { immediate: true, deep: true }
// );

async function asyncOptions(){
	const note_list = await getAllRootNotes();
    if (note_list.length > 0){
        optionsRef.value = [];
        // 清空之前的数据 刷新notebook box list
    }

    for(var nslot in note_list){
        // console.log('got box note: ' + note_list[nslot].id + ' ' + note_list[nslot].name + ' ' + note_list[nslot].sort);
        optionsRef.value.push(
            {
                label: `${note_list[nslot].sort} - ${note_list[nslot].name}`,
                value: note_list[nslot]['id'],
            }
        );
    }
	let save_data = {}
	console.log("init async", JSON.stringify(optionsRef.value));
	save_data[window.$baseid] = {
		"custom-notebox-list": JSON.stringify(optionsRef.value),
	}
	dataset.saveData(save_data);
}

async function getAllRootNotes(){
    const post_data = {}
    const note_info = await ApiFunc.getAllRootNotes(post_data).then((res) =>{
        if(res['data']['notebooks'].length > 0){
            return res['data']['notebooks'];
        }
        return [{'id':0, "name":'null',"icon":0, "sort":0, "close":false}]
    })
    return note_info;
}

// TODO: not need it when i using focus envent
const handleScroll = (e) => {
    const currentTarget = e.currentTarget
    // if (currentTarget.scrollTop + currentTarget.offsetHeight >=
    //     currentTarget.scrollHeight) {
    //         (async () => {
    //             const note_list = await getAllRootNotes();
    //             for(var nslot in note_list){
    //                 if(nslot > optionsRef.value.length){
    //                     optionsRef.value.push({
    //                         label: note_list[nslot].sort+' - '+note_list[nslot].name,
    //                         value: note_list[nslot]['if'],
    //                     });
    //                 }
    //             }
    //         })();
    //     console.log('scroll!');

	// 	let save_data = {}
	// 	save_data[window.$baseid] = {
	// 		"custom-notebox-list": JSON.stringify(optionsRef.value),
	// 	}
	// 	dataset.saveData(save_data);
    // }
}

const handleUpdateSelect = (svalue, options) => {
    // 这里处理回调的点击事件，就不用watch来监听了。
    if (svalue != select_value.value){
        select_value.value = svalue;
        emit('setRootNoteId', svalue);
        if (svalue != '0'){

			let save_data = {}
			save_data[window.$baseid] = {
				"custom-current-notebox": svalue,
			}
			dataset.saveData(save_data);

        }
    }
}

// TODO: bugs show select do not trigger this function
const handleShowSelect = (value) => {
	console.log("handleShowSelect", value);
	show_select_list.value = value;
	if(value) {
		(async () => {
		const note_list = await getAllRootNotes();
		if (note_list.length > 0){
			optionsRef.value = [];
			// 清空之前的数据 刷新notebook box list
		}

		for(var nslot in note_list){
			optionsRef.value.push(
				{
					label: `${note_list[nslot].sort} - ${note_list[nslot].name}`,
					value: note_list[nslot]['id'],
				}
			);
		}
		let save_data = {}
		save_data[window.$baseid] = {
			"custom-notebox-list": JSON.stringify(optionsRef.value),
		}
		dataset.saveData(save_data);
		})();
	}
}
// For template.
const handleFocusSelect = (e) => {
	console.log("handleShowSelect", e);
	(async () => {
	const note_list = await getAllRootNotes();
	if (note_list.length > 0){
		optionsRef.value = [];
		// 清空之前的数据 刷新notebook box list
	}
	for(var nslot in note_list){
		optionsRef.value.push(
			{
				label: `${note_list[nslot].sort} - ${note_list[nslot].name}`,
				value: note_list[nslot]['id'],
			}
		);
	}
	let save_data = {}
	save_data[window.$baseid] = {
		"custom-notebox-list": JSON.stringify(optionsRef.value),
	}
	dataset.saveData(save_data);
	})();
	
}



const refreshComps = () => {
	let mode = '0';
	try{
		mode = window.top.siyuan.config.appearance.mode + ''; // 主题模式, 0: 明亮, 1: 暗黑
	}catch (error) {}
	changeThemes(mode=='0'?false:true);
    renovate();
}

const changeThemes = (value) => {
    if (value){
        emit('setThemeValue', 'dark');
    }else{
        emit('setThemeValue', 'light');
    }
    theme_value.value = value;
	let save_data = {}
	save_data[window.$baseid] = {
		"custom-theme-value": value?'dark':'light',
	}
	dataset.saveData(save_data);
    // localStorage.setItem("siyuan_calender_bar_theme_switch", value);
}

const float_menu_x = ref(0)
const float_menu_y = ref(0)
const show_float_menu = ref(false)
const handleSelect = (key) => {
        show_float_menu.value = false
        message.info(String(key))
}

const handleClick = (e) => {
      if (show_float_menu.value) {
        show_float_menu.value = false
      } else {
        show_float_menu.value = true
        float_menu_x.value = e.clientX-e.offsetX+30
        float_menu_y.value = e.clientY-e.offsetY
      }
    }
const clickOutside = () => {
    show_float_menu.value = false;
}
</script>

<template>
  <n-popover 
    :show="show_float_menu" 
    :on-clickoutside="clickOutside" 
    :x="float_menu_x" :y="float_menu_y"
    :flip="true"
    width="150px"
    placement="top-end"
    trigger="manual">
    <n-list>
        <template #header>
            <h3 style="margin:0px; margin-top:-20px">Settings</h3>
        </template>
        <template #footer>
            <p style="margin:0px; margin-bottom:-20px; float:right; font-size:10px; color:gray">到底是到底了.</p>
        </template>
        <n-list-item>
            <n-thing title="" title-extra="选择需要显示的日记">
            <!-- <n-ellipsis style="max-width: 240px"> -->
            <n-select
				:on-focus="handleFocusSelect"
                v-model:value="select_value"
                :options="optionsRef"
                :reset-menu-on-options-change="false"
                :on-update:value="handleUpdateSelect"
				:on-update:show="handleShowSelect"
                v-model:show="show_select_list"
                @scroll="handleScroll"
                placeholder="选择笔记本"
                style="max-width: 150px;">
                <template #arrow>
                    <transition name="slide-left">
                        <notebook-lightning-24-regular v-if="show_select_list" />
                        <notebook-24-regular v-else />
                    </transition>
                </template>
            </n-select>
            <!-- </n-ellipsis> -->
            </n-thing>
        </n-list-item>
        <n-list-item>
            <n-space justify="center">
            <n-button tertiary round :on-click="refreshComps" size="small">
                <template #icon>
                    <n-icon>
                    <arrow-counterclockwise-12-regular />
                    </n-icon>
                </template>
                    刷新页面
            </n-button>
            </n-space>
        </n-list-item>
    </n-list>
  </n-popover>

    <n-back-top :visibility-height="0" style="margin-right:0px; opacity:0.8" :onclick="handleClick">
    <n-icon :size="28"><WindowDevTools24Regular/></n-icon>
    </n-back-top>

<!-- 上面是悬浮的menu，下面是顶部的bar -->


</template>

<script scoped>

</script>