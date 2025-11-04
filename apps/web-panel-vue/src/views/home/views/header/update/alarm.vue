<template>
	<div class="p-[2.4rem] give-dialog">
		<el-form ref="pushMsgRef" :model="msgForm" label-width="80px" :rules="rules" @submit.native.prevent>
			<el-form-item label="更新提醒" prop="switch">
				<el-switch v-model="msgForm.switch" name="switch"></el-switch>
			</el-form-item>
			<el-form-item label="告警方式" prop="give" v-bt-loading="checkedLoad">
				<bt-alarm-select ref="alarmRef" v-model="msgForm.give" class="!w-[28rem]" :limit="['sms']" />
			</el-form-item>
		</el-form>
		<div class="mt-1.6rem ml-2.4rem">
			<ul class="list-disc">
				<li>
					<div class="flex items-center">点击安装后状态未更新，尝试点击【<bt-link @click="store.refreshAlarmEvent">手动刷新</bt-link>】</div>
				</li>
			</ul>
		</div>
	</div>
</template>

<script setup lang="ts">
import HOME_HEADER_STORE from '@home/views/header/store'
import { storeToRefs } from 'pinia'

const store = HOME_HEADER_STORE()
const { alarmRef, pushMsgRef, rules, msgForm, checkedLoad } = storeToRefs(store)

onMounted(async () => {
	store.renderPushConfig()
})

defineExpose({
	onCancel: store.onCancel,
	onConfirm: store.onConfirm,
})
</script>

<style lang="css" scoped>
.give-dialog :deep(.el-input-group__append, .el-input-group__prepend) {
	padding: 5px;
}
.give-dialog :deep(.el-checkbox__label) {
	font-size: var(--el-font-size-small);
}
.give-dialog :deep(.el-radio__label) {
	font-size: var(--el-font-size-small);
	color: var(--el-color-text-primary);
}
.give-dialog :deep(.el-slider__runway) {
	margin: 1.3rem 0;
}
</style>
