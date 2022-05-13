<script>
import { defineProps,h, ref } from "vue"
const test_old_data = {'2022-5-12':'11', '2022-5-13':'22','2022-5-14':'33'}


export default {
    components:{},
    props: ['show_date'],
    setup(props){
        return ()=> [
            h("div",{className:"counter test"},"1"),//这里的class要用className
            h("button",{onClick:"changeCount"},props.show_date),//事件的绑定
        ]
    }
}

function renderData(data){
    return h('div', { id: 'app' }, [
    h('img', {
        alt: 'vue.logo',
        src: 'img',
    }),
    h('n-tag', {
        msg: 'Welcome to Your Vue.js + TypeScript App',
        name: '李四',
        age: 15,
        sex: '男',
    }),
    ])
}
</script>

<template>

</template>

<style scoped>
</style>