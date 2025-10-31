<template>
	<bt-dialog :title="title" v-model="isShowForm" :area="['50rem']" show-footer @cancel="onCancel" @confirm="onConfirm">
		<div class="py-[16px]">
			<el-form ref="dnsformRef" size="small" :model="form" :rules="rules" class="relative w-full" :label-position="`right`" @submit.native.prevent>
				<el-form-item label="验证类型" prop="dns_name" label-width="100">
					<el-select v-model="form.dns_name" class="!w-[33rem]" size="default" filterable default-first-option placeholder="请选择验证类型" :disabled="disabled" @change="changeFormParams">
						<el-option v-for="item in formParams" :key="item.id" :label="item.name" :value="item.id"> </el-option>
					</el-select>
				</el-form-item>
				<template v-if="selectedParams.length">
					<el-form-item v-for="(param, index) in selectedParams" :key="index" :label="param" :prop="param" label-width="100">
						<el-input v-model="form[param]" class="!w-[33rem]" :placeholder="`请输入${param}`" />
					</el-form-item>
				</template>
				<el-form-item prop="ps" label="备注" label-width="100">
					<el-input v-model="form.ps" placeholder="请输入备注" clearable class="remark-input !w-[33rem]"></el-input>
				</el-form-item>
			</el-form>
		</div>
	</bt-dialog>
</template>

<script setup lang="ts">
import { addDnsData, editDnsData } from '@api/ssl'
import { useMessage } from '@/hooks/tools'

const MessageMethod = useMessage()
const props = defineProps({
	title: {
		type: String,
		default: '添加NDS验证',
	},
})

const form = ref<any>({
	dns_name: '',
	ps: '',
}) // 表单数据

const dnsformRef = ref<any>(null) // 表单ref
const isShowForm = inject('isShowForm', shallowRef(false)) // 是否显示弹窗
const formParams = inject('formParams', shallowRef<any>([])) // 表单参数
const isRefreshDNSList = inject('isRefreshDNSList', shallowRef(false)) // 刷新DNS列表
const formRow = inject('formRow', shallowRef<any>({})) // 表单数据
const selectedParams = ref<any>([]) // 选中的参数
const disabled = computed(() => (formRow.value.id ? true : false)) // 是否禁用

const changeFormParams = (val: string) => {
	selectedParams.value = formParams.value.find((item: any) => item.id.toLowerCase() === val.toLowerCase())?.params || []
	updateDynamicRules()
}

const rules = ref<any>({
	dns_name: [{ required: true, message: '请选择验证类型', trigger: 'change' }],
})

// 动态更新 selectedParams 的校验规则
const updateDynamicRules = () => {
	selectedParams.value.forEach((param: string) => {
		rules.value[param] = [{ required: true, message: `请输入${param}`, trigger: 'blur' }]
	})
}

const init = () => {
	form.value = {
		dns_name: '',
		ps: '',
	}
	formRow.value = {
		dns_name: 'DNSPodDns',
	}
}

// 点击确认按钮
const onConfirm = async () => {
	const formRef = dnsformRef.value
	// 使用 await 等待表单验证完成
	const valid = await formRef.validate().catch(() => false)

	if (!valid) return false

	// 提交表单
	try {
		let params = { ...form.value }
		let data
		if (form.value.id) {
			const upd_data = await editDnsData({
				dns_id: params.id,
				ps: params.ps || '',
				pdata: JSON.stringify(params),
			})
			data = upd_data
		} else {
			const add_data = await addDnsData({
				dns_name: params.dns_name,
				ps: params.ps || '',
				pdata: JSON.stringify(params),
			})
			data = add_data
		}
		MessageMethod.request(data)
		isShowForm.value = false
		isRefreshDNSList.value = true
		init()
	} catch (error) {
		MessageMethod.error(error as any)
		return false
	}
}

// 点击取消或关闭按钮
const onCancel = async () => {
	init()
}

watch(formParams, (newVal: any) => {
	if (newVal.length) {
		form.value.dns_name = newVal[0].id
		changeFormParams(newVal[0].id)
	}
})

watch(
	formRow,
	(newVal: any) => {
		form.value = { ...newVal }
		if (newVal.dns_name) {
			changeFormParams(newVal.dns_name)
		}
	},
	{ immediate: true }
)

watch(isShowForm, (newVal: any) => {
	if (newVal) {
		if (formRow.value.dns_name) {
			// 弹出框显示时，确保表单数据正确
			form.value = { ...formRow.value }
			changeFormParams(formRow.value.dns_name)
		} else {
			form.value = {
				dns_name: '',
				ps: '',
			}
			if (formParams.value.length > 0) {
				form.value.dns_name = formParams.value[0].id
				changeFormParams(formParams.value[0].id)
			}
		}
	}
})
</script>

<style scoped>
:deep(.remark-input .el-input__suffix .el-input__clear) {
	margin-right: 8px;
}
</style>
