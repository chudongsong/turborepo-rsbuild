<template>
	<div class="p-[16px]">
		<el-form ref="formRef" :model="deployFormData" :rules="rules" label-width="120px">
			<el-form-item label="名称" prop="task_name">
				<el-input class="!w-[230px]" placeholder="请输入名称" :disabled="isEdit" v-model="deployFormData.task_name" />
			</el-form-item>
			<el-form-item label="选择证书部署任务" prop="cloud_id">
				<bt-select class="!w-[230px]" v-bt-loading="certificateDeployTaskLoading" placeholder="请选择证书部署任务" v-model="deployFormData.cloud_id">
					<el-option v-for="item in certificateDeployTaskList" :key="item.value" :label="item.label" :value="item.value">
						<div class="flex items-center">
							<span>{{ item.label }}</span>
							<el-divider direction="vertical" />
							<span>{{ item.host }}</span>
						</div>
					</el-option>
				</bt-select>
				<bt-link class="ml-[12px]" @click="getPrivateKeyOrCertificate">
					<div class="flex items-center">
						<span class="text-small">>></span>
						<span>去创建</span>
					</div>
				</bt-link>
			</el-form-item>
			<el-form-item label="密钥" prop="private_key">
				<el-input class="!w-[230px]" placeholder="请输入密钥" v-model="deployFormData.private_key" />
				<bt-link class="ml-[12px]" @click="getPrivateKeyOrCertificate">
					<div class="flex items-center">
						<span class="text-small">>></span>
						<span>去获取</span>
					</div>
				</bt-link>
			</el-form-item>
			<el-form-item label="选择网站" prop="sites">
				<bt-select v-bt-loading="siteLoading" class="!w-[230px]" :multiple="true" placeholder="请选择网站" :options="siteList" v-model="deployFormData.sites" />
			</el-form-item>
			<!-- <el-form-item label="检测周期" prop="cycle">
				<el-input class="!w-[230px]" placeholder="请输入检测周期" v-model="deployFormData.cycle" @input="handleCheckCycleInput" />
				<span class="ml-[12px] text-small">单位：小时</span>
			</el-form-item> -->
		</el-form>
		<bt-help :options="tableHelpList" listStyle="disc" class="ml-[20px]" />
	</div>
</template>

<script lang="tsx" setup>
import { createSynchronTask, editSynchronTask, getCertificateDeployTaskList, getSiteList } from '@/api/ssl'
import { useDataHandle } from '@/hooks/tools'
import { getComplexRandomString } from '@/utils'
import { useDeployStore } from '@/views/ssl/views/auto-deploy/useStore'
import { openUseExplain } from '@ssl/views/auto-deploy/useMethod'

interface Props {
	isEdit: boolean
	row: Record<string, any>
}

const props = defineProps<{
	compData: Props
}>()

const emit = defineEmits(['close'])

const { isEdit, row } = props.compData

const { deployFormData, siteList, certificateDeployTaskList, isRefreshDeployTaskList } = storeToRefs(useDeployStore())

const formRef = ref()

const siteLoading = ref(false)

const certificateDeployTaskLoading = ref(false)

const tableHelpList = [
	{ content: '提示：请先在宝塔官网->SSL模块->自动同步中创建同步任务，请不要泄露同步任务的密钥' },
	{
		content: (
			<bt-link class="inline-block" onClick={openUseExplain}>
				<div class="flex items-center">
					<span class="text-small">{'>>'}</span>
					<span>使用说明</span>
				</div>
			</bt-link>
		),
	},
]

const rules = {
	task_name: [
		{ required: true, message: '请输入名称', trigger: 'blur' },
		{ min: 2, max: 50, message: '长度在 2 到 50 个字符之间', trigger: 'blur' },
	],
	cloud_id: [{ required: true, message: '请选择证书部署任务', trigger: ['blur', 'change'] }],
	private_key: [{ required: true, message: '请输入密钥', trigger: 'blur' }],
	sites: [
		{ required: true, message: '请选择至少一个网站', trigger: 'change' },
		{ type: 'array' as const, min: 1, message: '请选择至少一个网站', trigger: 'change' },
	],
	// cycle: [
	// 	{ required: true, message: '请输入检测周期', trigger: 'blur' },
	// 	{ pattern: /^[1-9]\d*$/, message: '请输入正整数', trigger: 'blur' },
	// ],
}

const getPrivateKeyOrCertificate = () => {
	window.open('https://www.bt.cn/admin/safe', '_blank', 'noopener,noreferrer')
}

const onConfirm = async () => {
	if (!formRef.value) return

	try {
		await formRef.value.validate()
		// 将 sites 数组转换为字符串
		const formData = {
			...deployFormData.value,
			sites: deployFormData.value.sites.join(','),
		}
		// TODO: 在这里添加提交逻辑
		useDataHandle({
			loading: isEdit ? '正在修改同步任务' : '正在创建同步任务',
			message: true,
			request: isEdit ? editSynchronTask(formData) : createSynchronTask(formData),
			success: res => {
				if (res.status) {
					isRefreshDeployTaskList.value = true
					emit('close')
				}
			},
		})
	} catch (error) {
		console.error('表单验证失败', error)
	}
}

const getSiteListData = async () => {
	siteLoading.value = true
	useDataHandle({
		request: getSiteList(),
		success: res => {
			const { data } = res
			siteList.value = data.map((item: any) => {
				return {
					label: item.name,
					value: item.name,
				}
			})
			siteLoading.value = false
		},
	})
}

const getCertificateDeployTaskData = async () => {
	certificateDeployTaskLoading.value = true
	useDataHandle({
		request: getCertificateDeployTaskList(),
		success: res => {
			certificateDeployTaskList.value = res.data.map((item: any) => {
				return {
					label: item.synchron_name,
					host: item.host,
					value: item.id,
				}
			})
			certificateDeployTaskLoading.value = false
		},
	})
}

const init = () => {
	if (isEdit) {
		deployFormData.value.task_id = row.id
		deployFormData.value.task_name = row.task_name
		deployFormData.value.cloud_id = row.cloud_id
		deployFormData.value.private_key = row.private_key
		deployFormData.value.sites = row.sites?.split(',')
		// deployFormData.value.cycle = row.cycle
	} else {
		deployFormData.value.task_name = getComplexRandomString(8)
	}
}

const handleCheckCycleInput = (value: string) => {
	// 移除非数字字符
	const newValue = value.replace(/[^\d]/g, '')
	// 移除前导零
	deployFormData.value.cycle = newValue.replace(/^0+/, '') || ''
}

onMounted(() => {
	getSiteListData()
	getCertificateDeployTaskData()
	nextTick(() => {
		init()
	})
})

onUnmounted(() => {
	deployFormData.value = {}
})

defineExpose({
	onConfirm,
})
</script>

<style scoped></style>
