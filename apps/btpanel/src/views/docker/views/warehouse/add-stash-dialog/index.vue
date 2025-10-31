<template>
	<div class="flex flex-col p-[1.6rem] lib-box">
		<BtForm />
	</div>
</template>
<script setup lang="ts">
import { useForm } from '@/hooks/tools'
import { FormInput, FormGroup } from '@form/form-item'
import { onConfirm, init } from './useController'

interface Props {
	compData?: any
}
interface formDataProp {
	registry: string
	name: string
	username: string
	password: string
	namespace: string
	remark: string
	id: string
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({}),
})
const popupClose = inject<any>('popupClose', () => {}) //     弹窗关闭

// 表单实体
const { BtForm, submit } = useForm({
	data: () => ({
		registry: props.compData.row?.url || '',
		name: props.compData.row?.name || '',
		username: props.compData.row?.username || '',
		password: props.compData.row?.password || '',
		namespace: props.compData.row?.namespace || '',
		remark: props.compData.row?.remark || '',
		id: props.compData.row?.id || '',
	}),
	options: () => {
		return computed(() => [
			FormInput('仓库地址', 'registry', {
				attrs: { class: '!w-[35rem]', placeholder: '例：ccr.ccs.tencentyun.com' },
				rules: [{ required: true, message: '请输入仓库地址', trigger: 'blur' }],
			}),
			FormInput('仓库名', 'name', {
				attrs: { class: '!w-[35rem]', placeholder: '例：testtest' },
				rules: [{ required: true, message: '请输入仓库名', trigger: 'blur' }],
			}),
			FormGroup([
				FormInput('用户', 'username', {
					attrs: { class: '!w-[15rem]', placeholder: '请输入仓库用户' },
					rules: [{ required: true, message: '请输入用户', trigger: 'blur' }],
				}),
				FormInput('密码', 'password', {
					attrs: { class: '!w-[13rem]', placeholder: '请输入仓库密码' },
					labelAttrs: { class: 'inline-label' },
					rules: [{ required: true, message: '请输入密码', trigger: 'blur' }],
				}),
			]),
			FormInput('命名空间', 'namespace', {
				attrs: { class: '!w-[35rem]', placeholder: '例：testname' },
				rules: [{ required: true, message: '请输入命名空间', trigger: 'blur' }],
			}),
			FormInput('备注', 'remark', {
				attrs: { class: '!w-[35rem]', placeholder: '备注' },
			}),
		])
	},
	submit: async (param: Ref<formDataProp>, validate: any, ref: Ref<any>) => {
		await validate()
		onConfirm(param, popupClose)
	},
})

defineExpose({
	onConfirm: submit,
})
</script>
<style lang="css" scoped>
:deep(.el-form-item__label) {
	@apply w-[7rem] text-default;
}

:deep(.inline-label .el-form-item__label) {
	width: 5rem !important;
	min-width: 5rem !important;
}

:deep(.el-form .el-form-item--small.el-form-item + .el-form-item) {
	@apply mb-[1.5rem];
	margin-top: 1.5rem !important;
}

:deep(#two .el-form-item__label) {
	@apply min-w-0;
}
#two {
	@apply mb-[0rem];
	margin-top: 0 !important;
}
</style>
