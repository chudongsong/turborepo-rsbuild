<template>
	<div class="alarm">
		<div><span>告警</span></div>
		<el-switch size="small" class="ml-[0.8rem]" v-model="status" @change="store.openAlarmPopup(status, alarmData)"></el-switch>
		<div class="switch"></div>
		<bt-link @click="store.setAlarmDialog(alarmData)">设置</bt-link>
		<span class="w-[21rem] ml-[0.8rem]">{{ store.createPushStatus(type) }}</span>
	</div>
</template>
<script setup lang="ts">
import HOME_STATE_POPOVER_STORE from './store'
import { storeToRefs } from 'pinia'

interface Props {
	type: string
	diskName?: string
}

const props = defineProps<Props>()

const type = computed(() => props.type)

const store = HOME_STATE_POPOVER_STORE()
const { push, devTaskList } = storeToRefs(store)

watch(
	() => push.value.alarmPopupData,
	val => {
		devTaskList.value = val
	},
	{ deep: true, immediate: true }
)

const status = ref<boolean>(false) // 告警状态

const alarmData = computed(() => {
	const obj = {
		type: type.value,
		data: false,
		id: 0,
		status: false,
	}
	const task = store.getCurrentTask(type.value) // 获取当前告警信息
	if (task) {
		// 存在告警
		const items = task.task_data
		if (type.value?.includes('disk')) {
			items.cycle === 2 ? `${items.count}%` : `${items.count}GB`
			status.value = !!task.status
			obj.status = !!task.status
			obj.data = {
				...items,
				module: task.sender,
				push_count: task.number_rule.day_num,
			}
			obj.id = task.template_id
		} else {
			status.value = !!task.status
			obj.status = !!task.status
			obj.data = { ...items, module: task.sender, push_count: task.number_rule.day_num }
			obj.id = task.template_id
		}
	}
	return obj
})

watch(
	() => alarmData.value,
	val => {
		status.value = val.status
	},
	{ deep: true, immediate: true }
)

onMounted(() => {})
</script>
<style lang="css" scoped>
.alarm {
	display: flex;
	align-items: center;
}

.alarm .switch {
	border: 1px solid var(--el-color-border-dark);
	height: 16px;
	width: 1px;
	margin: 0 12px;
}

.alarm :deep(.el-switch__core .el-switch__action) {
	height: 14px;
}

.alarm :deep(.el-switch__core .el-switch__action)::after {
	height: 12px;
	width: 12px;
	margin-top: -1px;
}

:deep(.el-switch.is-checked .el-switch__core)::after {
	margin-left: -13px;
}

.alarm span {
	color: var(--el-base-tertiary);
}
</style>
