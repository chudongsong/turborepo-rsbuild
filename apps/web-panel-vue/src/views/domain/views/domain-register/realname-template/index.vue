<template>
	<div class="p-[2rem]">
		<BtForm />
	</div>
</template>

<script setup lang="tsx">
import { useForm } from '@/hooks/tools'
import { FormCustom, FormItemCustom } from '@form/form-item'
import { ElButton, ElSelect, ElOption } from 'element-plus'
import BtHelp from '@/components/form/bt-help/index'
import { getRealnameTemplateList, submitRealnameAuth } from './useController'
import { Message } from '@/hooks/tools'

interface Props {
	compData?: {
		domainName?: string
		domainId?: number
	}
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({})
})

// 模板列表
const templateList = ref<Array<{
	id: number
	template_name: string
	owner_name: string
	id_number: string
	phone: string
	address: string
	template_status: string
	status: number
	type: number
	registrant_id: string
}>>([])

const templateOptions = computed(() => {
	return templateList.value.map(template => {
		const typeText = template.type === 1 ? '个人' : '企业'
		return {
			label: `${template.template_name} (${typeText})`,
			value: template.id,
			description: `${template.template_name} - ${template.phone}`
		}
	})
})

// 帮助配置
const helpOptions = [
	{
		content: '需要帮助？请查看 <a href="https://docs.bt.cn/domain/user-guide/info-template" target="_blank" class="bt-link">域名实名认证文档</a>',
		isHtml: true
	}
]

const { BtForm, submit } = useForm({
	data: {
		templateId: undefined as number | undefined
	},
		options: (formData: any) => {
		return computed(() => [
			FormItemCustom('', () => (
				<div class="flex items-center gap-4">
					<ElSelect
						v-model={formData.value.templateId}
						placeholder="请选择实名模板"
						class="!w-[36rem]"
					>
						{templateOptions.value.map(option => (
							<ElOption
								key={option.value}
								label={option.label}
								value={option.value}
							/>
						))}
					</ElSelect>
					<ElButton 
						type="default" 
						onClick={() => window.open('https://www.bt.cn/domain/real-name', '_blank')}
						class="!w-auto"
					>
						添加新模板
					</ElButton>
				</div>
			), 'templateId'),
			FormCustom(() => (
				<div>
					<BtHelp options={helpOptions} />
				</div>
			))
		] as any)
	},
	submit: async (param: any, validate: any, ref: Ref<any>) => {
		try {
			await validate()
			if (!param.value.templateId) {
				Message.error('请选择实名模板')
				return false
			}
			const selectedTemplate = templateList.value.find(template => template.id === param.value.templateId)
			if (!selectedTemplate) {
				Message.error('未找到选中的模板')
				return false
			}
			return submitRealnameAuth({
				domainId: props.compData?.domainId || 0,
				registrantId: selectedTemplate.registrant_id
			})
		} catch (error) {
			console.error('表单验证失败:', error)
			Message.error('提交失败，请重试')
			return false
		}
	},
})

defineExpose({ onConfirm: submit })

onMounted(async () => {
	templateList.value = await getRealnameTemplateList()
})
</script>

<style scoped>
.el-form {
	max-width: 600px;
	margin: 0 auto;
}
</style>
