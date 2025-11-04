<template>
	<div class="flex flex-col lib-box">
		<bt-terminal id="dockerBackLogTerminal" ref="terminal" url="/ws_model" active :host-info="hostInfo" @close="close" :fit-cols-rows="false" :request-token="true" :checkMsgFn="checkMsgFn" />
	</div>
</template>
<script setup lang="ts">
import { Message } from '@/hooks/tools'

interface Props {
	compData?: any
}

const popupClose = inject<any>('popupClose') //     弹窗关闭
const props = withDefaults(defineProps<Props>(), {
	compData: () => ({}),
})

let hostInfo = {
	model_index: 'btdocker',
	mod_name: 'compose',
	def_name: 'get_pull_log',
	ws_callback: 111,
}
if (props.compData.isOther) {
	hostInfo['mod_name'] = 'backup'
}
const close = () => {
	popupClose()
}

// 终端ref
const terminal = ref<any>()

const checkMsgFn = (msg: string) => {
	if (props.compData.isOther) {
		// 容器备份日志
		if (msg.indexOf('bt_successful') !== -1) {
			Message.success('成功')
			terminal.value?.disposeTerminal() // 销毁终端
			close()
		}
		if (msg.indexOf('bt_failed') !== -1) {
			Message.error('失败')
		}
	}
}
</script>
<style lang="css" scoped>
:deep(.el-form-item__label) {
	@apply w-[7rem] text-default;
}
.portTable :deep(.el-form-item__label) {
	@apply w-[5rem] h-[4rem] text-default mr-[0rem] bg-[#f2f4f7] border-medium border-[1px] border-[#e4e7ed] rounded-l-[0.4rem] px-[1rem] box-border;
}
.el-form-item {
	@apply mb-[1.5rem];
}
:deep(.el-form .el-form-item--small.el-form-item + .el-form-item) {
	margin-top: 1.5rem !important;
}
</style>
