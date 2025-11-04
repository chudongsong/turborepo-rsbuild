<template>
	<div>
		<config-rows label="面板安全告警">
			<template #value>
				<el-switch v-model="alarmStatus" @change="change"></el-switch>
				<el-button size="small" class="!ml-12px" @click="showPopup = true">提醒方式</el-button>
			</template>
			<template #desc>
				<span>告警内容包含：面板用户变更、面板日志删除、面板开启开发者、面板开启API</span>
			</template>
		</config-rows>
		<bt-dialog title="面板安全告警" v-model="showPopup" showFooter :area="[48]" @confirm="confirm()" @cancel="cancel" confirmText="保存配置">
			<div class="p-16px">
				<el-form ref="ruleFormRef" label-width="10rem" :rules="rules" :model="alarmForm">
					<el-form-item label="安全提醒">
						<el-switch v-model="alarmStatus"></el-switch>
					</el-form-item>
					<el-form-item label="告警方式" prop="type">
						<bt-alarm-select class="!w-[30rem]" v-model="alarmForm.type" :limit="['sms']" />
					</el-form-item>
				</el-form>
			</div>
		</bt-dialog>
	</div>
</template>

<script lang="ts" setup>
import { getConfigStore } from '@config/useStore'
import { useDataHandle } from '@hooks/tools'
import { setNewAlarmTask, setTaskStatus } from '@/api/config'

import ConfigRows from '@config/public/config-rows-new'
import { getAlarmTaskList } from '@/api/global'

const devTaskList = ref<any>([])
const ruleFormRef = ref<any>(null)
// 开关状态
const alarmStatus = ref(false)
// 弹窗开关
const showPopup = ref(false)
// 选中的通知方式
const alarmForm = reactive({
	type: [],
	options: '',
	id: '',
})
let alarmSettings: any = null

// 校验
const rules = {
	type: [
		{
			required: true,
			validator: (rule: any, value: any, callback: any) => {
				if (alarmForm.type.length === 0) {
					callback(new Error('请选择告警方式'))
				} else {
					callback()
				}
			},
			trigger: ['blur', 'change'],
		},
	],
}

/**
 * @description: 点击提醒方式，打开弹窗
 */
const change = async (panelAlarm: boolean) => {
	if (panelAlarm) {
		showPopup.value = true
	} else {
		await useDataHandle({
			loading: '正在保存信息配置，请稍后...',
			request: setTaskStatus({ task_id: alarmForm.id, status: panelAlarm ? 1 : 0 }),
			message: true,
			success: (res: any) => {
				if (!res.status) alarmStatus.value = !panelAlarm
			},
		})
	}
}

/**
 * @description: 点击提醒方式，打开弹窗
 */
const openAlarmConfigView = () => {
	showPopup.value = true
}

/**
 * @description: 弹窗取消按钮
 */
const cancel = () => {
	showPopup.value = false
	init()
}

/**
 * @description: 弹窗确认按钮
 */
const confirm = async () => {
	await ruleFormRef.value.validate()
	let params = {}
	let time_rule = {
		send_interval: 0,
		time_range: [0, 86399],
	}
	let number_rule = {
		day_num: 0,
		total: 0,
	}
	if (alarmSettings) {
		params = {
			task_data: alarmSettings.task_data,
			sender: alarmForm.type,
			time_rule,
			number_rule,
		}
	} else {
		params = {
			task_data: {
				tid: '6',
				type: 'panel_safe_push',
				title: '面板安全告警',
				status: alarmStatus.value,
				count: 0,
				interval: 600,
				project: '',
				help: 600,
			},
			sender: alarmForm.type,
			time_rule,
			number_rule,
		}
	}

	await useDataHandle({
		loading: '正在保存信息配置，请稍后...',
		request: setNewAlarmTask({ task_data: JSON.stringify(params), template_id: '6' }),
		message: true,
	})

	await getAlarmList()
	init()
	showPopup.value = false
}

/**
 * @description: 获取告警列表
 */
const getAlarmList = async () => {
	await useDataHandle({
		request: getAlarmTaskList(),
		data: { data: [Array, devTaskList] },
	})
}

/**
 * @description: 初始化
 */
const init = () => {
	const task = devTaskList.value?.find((item: any) => item.keyword === 'panel_safe_push')
	if (task) {
		alarmForm.type = task.sender
		alarmStatus.value = task.status
		alarmForm.id = task.id
		alarmSettings = task
	} else {
		alarmForm.type = []
		alarmStatus.value = false
		alarmSettings = null
	}
}

onMounted(async () => {
	await getAlarmList()
	init()
})
</script>
