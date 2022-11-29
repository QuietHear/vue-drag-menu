# 可拖拽菜单（vue2版）
[**vue3版本**](https://github.com/QuietHear/vue-drag-menu-plus '浏览') | ***vue2版本*** 


## 安装
	npm i vue-drag-menu

## 使用
	import vueDragMenu from 'vue-drag-menu';
	
	Vue.use(vueDragMenu);


## 1. 参数
* `cname`：自定义class-->String;非必传

* `list`：按钮数据-->Array;非必传;默认*[{icon:'icon-insert icon-setting',bgColor:'#fff',title:'菜单',color:''},{icon:'icon-insert icon-myCenter',bgColor:'rgb(255, 92, 92)'},{icon:'icon-insert icon-notice',bgColor:'rgb(92, 209, 255)'},{icon:'icon-insert icon-expression',bgColor:'rgb(255, 241, 92)'},{icon:'icon-insert icon-collection',bgColor:'rgb(100, 245, 146)'}]*
>
	// 配置项说明
	bgColor:'' // 按钮背景色
	title:'' // 按钮鼠标放上显示文字
	color:'' // 按钮内容颜色
	icon:'' // 按钮内图标
	//
	// 按钮名分为前后两部分，用/分隔，有以下两种情况
	// iconfont/xxx，此时为iconfont，xxx为图标去掉icon-后部分
	// xx/xx，此时为本地自定义图标，前半部分为class，后半部分为内容，且系统内置了一套图标库icon-insert
>

* `closeOnClick`：非第一个的按钮点击时是否需要收起菜单-->Boolean;非必传;默认*true*

* `@click`：按钮被点击时触发-->第一个参数返回当前按钮原对象

