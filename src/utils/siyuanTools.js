
//设置个暴露对象
let siyuanTools = {};
siyuanTools.VirtualOpen = VirtualOpen;

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