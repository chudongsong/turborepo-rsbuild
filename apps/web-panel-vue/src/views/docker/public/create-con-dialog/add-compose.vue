<template>
	<div class="flex flex-col lib-box">
		<BtForm label-width="90px" />
	</div>
</template>
<script setup lang="ts">
import { useForm } from '@/hooks/tools'
import { FormGroup, FormInput, FormSelect, FormCustom, FormTextarea } from '@form/form-item'
import { addTemplateDialog } from '@docker/useMethods'
import { addProduct, editProduct, getTemplateList } from '@/api/docker'
import { useDataHandle } from '@hooks/tools/data'
import { getDockerStore } from '@docker/useStore'
interface formData {
	template_id: string
	project_name: string
	remark: string
}

const props = withDefaults(defineProps<{ compData?: any }>(), {
	compData: () => ({}),
})
const emits = defineEmits(['close'])

const {
	refs: { orchestrationData },
} = getDockerStore()

// 表单实体
const {
	BtForm,
	submit,
	param: dataRef,
} = useForm({
	data: () => {
		return {
			template_id: '',
			project_name: '',
			remark: '',
		}
	},
	options: (formDataRef: Ref<formData>) => {
		return computed(() => [
			FormGroup([
				FormSelect('容器编排模板', 'template_id', options.value, {
					attrs: { class: '!w-[30rem]', placeholder: '请选择编排模板', onChange: (val: string) => selectId(val, formDataRef) },
					rules: [{ required: true, message: '请选择编排模板', trigger: 'change' }],
				}),
				FormCustom(
					() => {
						return h(
							'span',
							{
								class: 'cursor-pointer text-primary h-[3.2rem] leading-[3.2rem] ml-[1.5rem] inline-block',
								onClick: async () => {
									addTemplateDialog(getOptions)
								},
							},
							'创建'
						)
					},
					{ key: 'create', rules: {} }
				),
			]),
			FormInput('名称', 'project_name', {
				attrs: { class: '!w-[30rem]', placeholder: '请输入容器编排名称' },
				rules: [{ required: true, message: '请输入容器编排名称', trigger: 'blur' }],
			}),
			FormTextarea('备注', 'remark', {
				attrs: { class: '!w-[30rem]', placeholder: '请输入备注' },
			}),
		])
	},
	submit: async (param: Ref<formData>, validate: any, ref: Ref<any>) => {
		await validate()
		const data = {
			template_id: param.value.template_id,
			project_name: param.value.project_name,
			remark: param.value.remark,
			...(props.compData.id ? { project_id: props.compData.id } : {}),
		}
		useDataHandle({
			request: props.compData.isEdit ? editProduct({ data: JSON.stringify(data) }) : addProduct({ data: JSON.stringify(data) }),
			loading: '提交中...',
			message: true,
			success: (res: any) => {
				if (res.status) {
					emits('close')
					orchestrationData.value.refreshList = 'force'
				}
			},
		})
	},
})

//选择模板
const selectId = (val: any, formDataRef: Ref<formData>) => {
	formDataRef.value.remark = options.value.find((item: any) => item.value === val)?.remark
}

// 仓库名称选项
const options = shallowRef<any[]>([])

// 获取模板选项
const getOptions = async () => {
	useDataHandle({
		request: getTemplateList(),
		data: Array,
		success: (data: any) => {
			options.value = data.map((item: any) => {
				return {
					value: item.id,
					label: item.name,
					remark: item.remark,
				}
			})
			dataRef.value.template_id = options.value[0]?.value || ''
			dataRef.value.remark = options.value[0]?.remark || ''
		},
	})
}
onMounted(() => {
	getOptions()
})

defineExpose({
	onConfirm: submit,
})
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
