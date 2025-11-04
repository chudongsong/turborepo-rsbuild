/*
 * @Author: chudong 1738613989@qq.com
 * @Date: 2024-09-25 08:18:11
 * @LastEditors: chudong
 * @LastEditTime: 2024-09-26 21:02:15
 * @Description: file content
 */
const fs = require('fs')
const path = require('path')
const humps = require('humps')

const config = {
	base: [
		{ name: 'button', remark: '按钮' },
		{ name: 'button-group', remark: '按钮组' },
		{ name: 'container', remark: '内容' },
		{ name: 'header', remark: '头部显示' },
		{ name: 'aside', remark: '侧边栏' },
		{ name: 'main', remark: '主要内容' },
		{ name: 'footer', remark: '底部显示' },
		// { name: 'icon', remark: '图标' },
		{ name: 'row', remark: '行' },
		{ name: 'col', remark: '列' },
		{ name: 'link', remark: '链接' },
		{ name: 'scrollbar', remark: '滚动条' },
	],
	form: [
		{ name: 'autocomplete', remark: '自动完成' },
		{ name: 'cascader', remark: '级联选择' },
		{ name: 'checkbox-button', remark: '多选按钮' },
		{ name: 'checkbox-group', remark: '多选框组' },
		{ name: 'checkbox', remark: '多选框' },
		{ name: 'date-picker', remark: '日期选择器' },
		{ name: 'form', remark: '表单' },
		{ name: 'form-item', remark: '表单项' },
		{ name: 'input', remark: '输入框' },
		{ name: 'input-number', remark: '数字输入框' },
		{ name: 'radio', remark: '单选框' },
		{ name: 'radio-button', remark: '单选按钮' },
		{ name: 'radio-group', remark: '单选框组' },
		{ name: 'rate', remark: '评分' },
		{ name: 'select', remark: '选择器' },
		{ name: 'option', remark: '选择器选项' },
		{ name: 'select-v2', remark: '选择器-虚拟滚动' },
		{ name: 'slider', remark: '滑块' },
		{ name: 'switch', remark: '开关' },
		{ name: 'time-picker', remark: '时间选择器' },
		{ name: 'time-select', remark: '时间下拉选择器' },
		{ name: 'tree-select', remark: '树选择' },
		{ name: 'upload', remark: '上传' },
	],
	data: [
		{ name: 'avatar', remark: '头像' },
		{ name: 'badge', remark: '徽标' },
		{ name: 'card', remark: '卡片' },
		{ name: 'carousel', remark: '走马灯' },
		{ name: 'collapse', remark: '折叠面板' },
		{ name: 'collapse-item', remark: '折叠面板项' },
		{ name: 'descriptions', remark: '描述列表' },
		{ name: 'empty', remark: '空状态' },
		{ name: 'pagination', remark: '分页' },
		{ name: 'progress', remark: '进度条' },
		{ name: 'skeleton', remark: '骨架屏' },
		{ name: 'table', remark: '表格' },
		{ name: 'table-column', remark: '表格列' },
		{ name: 'table-v2', remark: '表格-虚拟滚动' },
		{ name: 'tag', remark: '标签' },
		{ name: 'timeline', remark: '时间轴' },
		{ name: 'timeline-item', remark: '时间轴项' },
		{ name: 'tree', remark: '树形控件' },
		{ name: 'tree-v2', remark: '树形控件-虚拟滚动' },
	],
	navigation: [
		{ name: 'dropdown', remark: '下拉菜单主视图' },
		{ name: 'dropdown-item', remark: '下拉菜单项' },
		{ name: 'dropdown-menu', remark: '下拉菜单' },
		{ name: 'step', remark: '步骤' },
		{ name: 'steps', remark: '步骤条' },
		{ name: 'tabs', remark: '标签页' },
		{ name: 'tab-pane', remark: '标签页项' },
	],
	feedback: [
		{ name: 'alert', remark: '警告提示' },
		{ name: 'dialog', remark: '对话框' },
		{ name: 'popover', remark: '气泡卡片' },
		{ name: 'tooltip', remark: '文字提示' },
	],
	other: [{ name: 'divider', remark: '分割线' }],
	extension: [
		{ name: 'input-files', remark: '文件选择' },
		{ name: 'input-password', remark: '密码输入框' },
		{ name: 'input-search', remark: '搜索框' },
		{ name: 'input-textarea', remark: '多行文本框' },
		{ name: 'table-group', remark: '表格分组，用于构建表格组' },
		{ name: 'table-column-edit', remark: '表格列编辑' },
		{ name: 'table-batch', remark: '表格批量操作' },
		{ name: 'table-status', remark: '状态 - 用于显示状态' },
		{ name: 'table-password', remark: '密码 - 用于显示密码' },
		{ name: 'table-search-recommend', remark: '表格搜索推荐' },
		{ name: 'context-menu', remark: '右键菜单' },
		{ name: 'ace-editor', remark: '代码编辑器' },
		{ name: 'fold-more', remark: '折叠更多' },
		{ name: 'timed-refresh', remark: '定时刷新' },
		{ name: 'page-text', remark: '分页扩展 - 基于前端分页' },
		{ name: 'echart', remark: '图表' },
		{ name: 'help', remark: '帮助提示信息' },
		{ name: 'logs', remark: '日志，用于显示日志信息，支持全屏显示' },
		{ name: 'qrcode', remark: '二维码' },
		{ name: 'terminal', remark: '终端，用于显示终端信息' },
		{ name: 'file-upload', remark: '文件上传，用于文件上传。' },
		{ name: 'table-batch-confirm', remark: '表格批量操作确认' },
		{ name: 'table-batch-result', remark: '表格批量操作结果' },
	],
	// 业务组件，用于存放业务相关的组件，涉及到业务逻辑请求和操作
	business: [
		{ name: 'error-mask-check', remark: '错误遮罩检测。' },
		{ name: 'install-mask-check', remark: '安装遮罩检检测。' },
		{ name: 'alarm-type-select', remark: '告警类型选择。' },
		{ name: 'file-select', remark: '文件选择。' },
		{ name: 'product-state', remark: '产品状态，用于显示产品状态，支付和到期情况。' },
		{ name: 'router-tabs', remark: '路由标签页，用于快速构建标签页类型的路由。' },
		{ name: 'receive-coupon', remark: '领取优惠券。' },
		{
			name: 'soft-state-group',
			remark: '软件状态组，用于显示软件状态和操作，如启动、停止、重启。',
		},
		{ name: 'task-management', remark: '任务管理，用于显示任务管理进度。' },
		{ name: 'online-service', remark: '在线客服，用于显示在线客服。' },
		{ name: 'alarm-config', remark: '告警配置，用于告警配置。' },
		{ name: 'product-payment', remark: '产品支付，用于产品支付。' },
		{ name: 'recovery-bin', remark: '回收站，用于临时存放删除的数据。' },
		{ name: 'bind-user', remark: '绑定用户，用于绑定用户。' },
		{ name: 'nps-survey', remark: 'NPS调查，用于NPS调查。' },
		{ name: 'nps-survey-v2', remark: 'NPS调查，用于NPS调查，简单版v2。' },
		{ name: 'nps-survey-ltd', remark: 'NPS调查，用于NPS调查，企业版专属。' },
		{ name: 'product-preview', remark: '产品预览，用于产品预览。' },
		{ name: 'plugin-management', remark: '插件管理，用于显示插件管理视图。' },
	],
}

const directoryConfig = () => {
	const directory = {}
	Object.keys(config).forEach(key => {
		if (!(key in directory)) directory[key] = {}
		config[key].forEach(item => {
			const pascalizeName = humps.pascalize(item.name) // 驼峰命名-首字母大写
			const camelizeName = humps.camelize(item.name) // 驼峰命名-首字母小写
			directory[key]['bt-' + item.name] = {
				'index.tsx': `/*
 * @Descripttion: ${item.remark}
 * @Author: chudong
 * @version: 1.0
 * @Date: 2024-09-25 11:43:00
 * @LastEditors: chudong
 * @LastEditTime: 2024-09-25 23:00:00
 */


import { El${pascalizeName}, type ${pascalizeName}Instance } from 'element-plus';

export default defineComponent({
	name: 'Bt${pascalizeName}',
	setup(_, { attrs, slots, expose }) {
		const ${camelizeName}Ref = ref();
		const ${camelizeName} = reactive({});
		expose(${camelizeName}Ref);
		onMounted(() => {
			Object.assign(${camelizeName}, { ...(${camelizeName}Ref.value as unknown as ${pascalizeName}Instance) });
		});
		return () => <El${pascalizeName} ref={${camelizeName}Ref} {...attrs}>{slots}</El${pascalizeName}>;
	},
});`,
				'types.d.ts': '',
			}
		})
	})

	return directory
}

function createStructure(basePath, structure) {
	for (const key in structure) {
		const fullPath = path.join(basePath, key)
		if (typeof structure[key] === 'string') {
			fs.writeFileSync(fullPath, structure[key])
		} else {
			if (!fs.existsSync(fullPath)) {
				fs.mkdirSync(fullPath)
			}
			createStructure(fullPath, structure[key])
		}
	}
}

createStructure('../src/test', directoryConfig())
