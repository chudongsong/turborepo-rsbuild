<template>
	<div class="p-[2rem]">
		<el-form :model="msgForm" ref="safeScanForm" :disabled="giveFormDisabled">
			<el-form-item label="自动扫描">
				<el-switch v-model="msgForm.status"></el-switch>
			</el-form-item>
			<el-form-item label="周期" prop="cycle">
				<bt-input class="!w-[14rem]" v-model="msgForm.cycle" :min="0" type="number" textType="天">
					<template #append> 天 </template>
				</bt-input>
			</el-form-item>
			<el-form-item label="告警方式" prop="give">
				<bt-alarm-select class="!w-[36rem]" v-model="msgForm.channel" :limit="['sms', 'wx_account']" />
			</el-form-item>
		</el-form>
		<div class="tip">
			<ul>
				<li>
					点击配置后状态未更新，尝试点击【
					<span class="text-primary hover:text-primaryDark cursor-pointer" @click="getSafeScanConfig(true)">手动刷新</span>
					】
				</li>
			</ul>
		</div>
	</div>
</template>

<script setup lang="ts">
import { getScanStatusInfo, setScanStatusInfo } from '@/api/firewall'
import { useDataHandle, useMessage } from '@/hooks/tools'
import { useGlobalStore } from '@store/global'
import HOME_SECURITY_RISKS_STORE from '../store'
import HOME_SECURITY_OVERVIEW_STORE from '../overview/store'

const store = HOME_SECURITY_RISKS_STORE()
const storeHome = HOME_SECURITY_OVERVIEW_STORE()
const { repairTypeActive } = storeToRefs(store)
const { isMalwareConfirm } = storeToRefs(storeHome)

const emits = defineEmits(['close'])

const { payment } = useGlobalStore()
const { authType } = payment.value

const Message = useMessage() // 消息提示
const msgForm = reactive({
	cycle: '0',
	channel: [] as any, // 告警方式
	status: false,
})
const safeScanForm = ref() // 表单实例
const giveFormDisabled = ref(false) // 表单禁用

/**
 * @description 获取安全扫描配置
 */
const getSafeScanConfig = async (isRefresh: boolean = false) => {
	const { data } = await getScanStatusInfo()
	msgForm.cycle = data.cycle
	msgForm.channel = data.channel === '' ? [] : data.channel.split(',')
	msgForm.status = data.status ? true : false
	if (isRefresh) Message.success('刷新成功')
}

/**
 * @description 确认按钮
 */
const onConfirm = async () => {
	if (authType !== 'ltd') {
		return Message.error('抱歉！该功能为企业版专享功能！')
	}
	// 去除空项
	msgForm.channel = msgForm.channel.filter((item: any) => item)
	let channel = msgForm.channel.join(',')
	// 若channel为空，提示
	if (!channel && msgForm.status) {
		Message.error('请选择告警方式')
		return
	}
	await safeScanForm.value.validate()
	useDataHandle({
		loading: giveFormDisabled,
		request: setScanStatusInfo({
			day: Number(msgForm.cycle),
			channel: channel,
			status: msgForm.status ? 1 : 0,
		}),
		message: true,
		success: (res: any) => {
			if (res.status) {
				getSafeScanConfig()

				if (repairTypeActive.value === 'overview') {
					isMalwareConfirm.value = true
					storeHome.capabilitySwitch.vul_scan.status = msgForm.status
					storeHome.getSafeOverviewData()
				}
				emits('close')
			}
		},
	})
}

defineExpose({
	onConfirm,
})
onMounted(() => {
	// 获取安全扫描配置
	getSafeScanConfig()
})
</script>

<style lang="css" scoped>
.tip {
	@apply mt-[1.6rem] ml-[3.2rem] mb-[2rem];
}
.tip ul {
	@apply list-disc;
}
.tip li {
	@apply leading-[2.4rem] text-secondary;
}
</style>
