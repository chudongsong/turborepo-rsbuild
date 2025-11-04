<template>
	<div class="p-[2rem]">
		<el-form :model="msgForm" :disabled="formDisabled" ref="scanForm">
			<el-form-item label="自动扫描">
				<el-switch v-model="msgForm.status"></el-switch>
			</el-form-item>
			<el-form-item label="每天">
				<div class="flex">
					<bt-input type="number" class="!w-[13rem] mr-4" min="0" max="23" v-model="msgForm.hour">
						<template #append>小时</template>
					</bt-input>
					<bt-input type="number" class="!w-[13rem]" min="0" max="59" v-model="msgForm.minute">
						<template #append>分钟</template>
					</bt-input>
				</div>
			</el-form-item>
			<el-form-item label="告警方式">
				<bt-alarm-select class="!w-[30rem]" v-model="msgForm.give" :limit="['sms', 'wx_account']" :isMult="true" :needAll="false" @change="onGiveSelect" />
			</el-form-item>
			<el-form-item label=" ">
				<div class="text-secondary">
					配置后状态未更新,请尝试[
					<span class="text-primary hover:text-primaryDark cursor-pointer" @click="getScanData"> 手动刷新 </span>
					]
				</div>
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup lang="ts">
import { getFileDetectTask, setFileDetectTask } from '@/api/firewall'
import { useDataHandle } from '@hooks/tools'
import { useMessage } from '@hooks/tools'

const Message = useMessage()
const formDisabled = ref(false) // 表单禁用
const popupClose = inject<any>('popupClose') // 关闭弹窗

const scanForm = ref<any>() // 表单ref

const msgForm = reactive({
	give: [],
	status: false,
	hour: 12,
	minute: 0,
})

/**
 * @description 告警方式选择
 * @param val
 */
const onGiveSelect = (val: any) => {
	msgForm.give = val
}

/**
 * @description 确认
 */
const onConfirm = async () => {
	const { give, minute, hour, status } = msgForm
	let channel = give.join(',')
	// 去除首位,
	if (channel.indexOf(',') === 0) {
		channel = channel.substring(1)
	}
	if (give.length === 0 || channel === '') return Message.error('请选择告警方式')
	const params = {
		status: status ? 1 : 0,
		hour: hour,
		minute: minute,
		channel: channel,
	}
	await scanForm.value.validate()
	useDataHandle({
		request: setFileDetectTask(params),
		loading: formDisabled,
		message: true,
		success: (res: any) => {
			if (res.status && popupClose) {
				popupClose()
			}
		},
	})
}

//更新数据
const getScanData = async () => {
	useDataHandle({
		request: getFileDetectTask(),
		success: (res: any) => {
			const data = res.data
			msgForm.status = data.status === '1' || data.status === 1
			msgForm.hour = data.hour
			msgForm.minute = data.minute
			if (data.channel != '') msgForm.give = data.channel.split(',')
		},
	})
}
onMounted(() => {
	getScanData()
})

defineExpose({
	onConfirm,
})
</script>
