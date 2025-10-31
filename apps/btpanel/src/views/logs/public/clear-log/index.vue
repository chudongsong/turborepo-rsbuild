<template>
	<!-- 清理日志 -->
	<div class="p-[20px] flex flex-col">
		<!-- 提示 -->
		<el-alert :closable="false" v-if="compData.tips" :title="compData.tips" type="warning" show-icon></el-alert>
		<BtForm class="mt-[8px]" />
	</div>
</template>
<script lang="ts" setup>
import { useForm } from '@/hooks/tools'
import { FormSelect } from '@/hooks/tools/form/form-item'
import { LOG_STORE } from '@/views/logs/useStore'
import { storeToRefs } from 'pinia'

interface Props {
	compData: {
		type: string // 类型
		tips: string // 提示
		clearEvent: (day: string, type: string) => Promise<void> // 清理日志事件
	}
}

const props = withDefaults(defineProps<Props>(), {})

const store = LOG_STORE()
const { clearOptions, clearDataForm } = storeToRefs(store)

const clearOptionsNew = computed(() => {
	// 为计划任务日志时 过滤掉最后一个选项
	if (props.compData.type == 'crontab') {
		return clearOptions.value.slice(0, clearOptions.value.length - 1)
	}
	return clearOptions.value
})

/**
 * @description 渲染类型
 */
const renderType = () => {
	if (props.compData.type === 'website') {
		return FormSelect(
			'类型',
			'type',
			[
				{ label: '运行日志', value: 'access' },
				{ label: '异常日志', value: 'error' },
			],
			{ attrs: { class: '!w-[22rem]' } }
		)
	}
	return []
}

const { BtForm, submit } = useForm({
	data: clearDataForm.value,
	options: (formData: AnyObject) => {
		return computed(() => [
			renderType(),
			FormSelect('清理范围', 'day', clearOptionsNew.value, {
				attrs: { class: '!w-[22rem]' },
			}),
		])
	},
	submit: async ({ value: { day, type } }: any) => {
		return await props.compData.clearEvent(day, type)
	},
})

defineExpose({
	onConfirm: submit,
})
</script>
