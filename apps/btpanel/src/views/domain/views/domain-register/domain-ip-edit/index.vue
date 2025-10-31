<template>
	<div class="domain-ip-edit-content">
		<div class="current-ip-section mb-4">
			<div class="mb-3">当前公网IP</div>
			<bt-alert type="info" :closable="false" class="!px-10px !py-2 cursor-not-allowed">
				<span class="text-[12px] px-0">{{ publicIp }}</span>
			</bt-alert>
		</div>

		<div class="new-ip-section">
			<div class="mb-3">新的IP地址</div>
			<el-form ref="ipFormRef" :model="formData" :rules="formRules">
				<el-form-item prop="newIp">
					<bt-input
						v-model="formData.newIp"
						placeholder="请输入新的IP地址"
						class="!w-full"
					/>
				</el-form-item>
			</el-form>
		</div>
	</div>
</template>

<script setup lang="tsx">
import { setAnalysisIp } from '@/api/domain'
import { useMessage } from '@/hooks/tools'
import { ipVerify } from '@/utils/rule'
import { useDomainRegisterStore } from '../useStore'
const { ipSearchValue, isRegListRefresh, publicIp } = useDomainRegisterStore()
const message = useMessage()

// 定义 props
interface Props {
	compData?: {
		currentIp?: string
	}
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({})
})

const ipFormRef = ref<any>()
const currentIp = ref('获取中')
const isLoading = ref(false)
const formData = reactive({
	newIp: '获取中'
})

// 表单验证规则
const formRules = reactive({
	newIp: [
		{ required: true, message: '请输入新的IP地址', trigger: ['blur', 'change'] },
		ipVerify({
			message: {
				value: '请输入新的IP地址',
				ip: '请输入正确的IP地址格式'
			}
		}),
		{
			trigger: ['blur', 'input', 'change'],
			validator: (rule: unknown, value: string, callback: any) => {
				// 检查是否与当前IP相同
				if (value.trim() === currentIp.value) {
					callback(new Error('新IP地址与当前IP地址相同'))
				} else {
					callback()
				}
			},
		},
	],
})

// 监听传入的当前IP
watch(() => props.compData?.currentIp, (newValue) => {
	if (newValue) {
		currentIp.value = newValue
		formData.newIp = newValue
	}
}, { immediate: true })

const onConfirm = async () => {
	await ipFormRef.value.validate()
	isLoading.value = true
	const load = message.load('修改中...')
	try {
		const res = await setAnalysisIp({
			ip: formData.newIp.trim()
		})
		if (res.data.status) {
			ipSearchValue.value = formData.newIp.trim()
			currentIp.value = formData.newIp.trim()
		}
		message[res.data.status ? 'success' : 'error'](res.data.msg)
		return res.data.status
	} catch (error) {
		console.error('修改解析IP出错:', error)
		message.error('修改解析IP失败，请重试')
		return false
	} finally {
		isLoading.value = false
		load.close()
	}
}

defineExpose({ onConfirm })
</script>

<style lang="scss" scoped>
.domain-ip-edit-content {
	padding: 2rem;
	.current-ip-section {
		.ip-label {
			color: var(--el-text-color-primary);
			margin-bottom: 8px;
		}
	}

	.new-ip-section {
		.ip-label {
			display: block;
			font-size: 14px;
			font-weight: 500;
			color: var(--el-text-color-primary);
			margin-bottom: 8px;
		}
	}
}
</style>
