<template>
	<el-select v-model="model" :disabled="isEdit" filterable clearable class="!w-[248px]" @change="onChange">
		<template #label> {{ selectedLabel }} </template>
		<template #header>
			<div class="pl-[9px] text-small text-tertiary mb-[5px]">任务分类</div>
			<div class="pl-[9px] flex flex-wrap gap-2">
				<span v-for="item in tagOptions" class="text-small text-tertiary cursor-pointer border border-darkTertiary rounded-base px-[10px] py-[2px]" :class="{ '!text-primary !border-primary': item.checked }" @click="onTagChange(item.value)">{{ item.label }}</span>
			</div>
		</template>
		<template #default>
			<el-option-group label="任务类型">
				<template v-for="item in filteredOptions">
					<el-option v-if="item.used && item.can_create" :key="item.value" :label="item.label" :value="item.value" @click="onOptionClick(item)" :disabled="isNotPro && item.is_pro">
						<div class="flex items-center" :title="item.label">
							<span class="">{{ item.label }}</span>
							<span v-if="item.is_pro" class="svgtofont-icon-ltd !text-extraLarge !font-normal text-ltd ml-[4px]"></span>
						</div>
					</el-option>
				</template>
			</el-option-group>
		</template>
	</el-select>
</template>

<script lang="ts" setup>
import { productPaymentDialog } from '@/public'
import { useGlobalStore } from '@/store/global'

const model = defineModel<string>()

const { payment } = useGlobalStore()

const props = defineProps<{
	options: Array<{
		label: string
		value: string
		used: boolean
		tags: Array<any>
		can_create: boolean
		is_pro: boolean
		description: string
	}>
	tagOptions: Array<{
		label: string
		value: string
		checked: boolean
	}>
	isEdit: boolean
}>()

const emit = defineEmits(['change', 'update:tagOptions'])

const selectedLabel = computed(() => {
	if (!model.value) return ''
	const option = props.options.find(opt => opt.value === model.value)
	return option?.label || ''
})

const isNotPro = computed(() => {
	return payment.value.authType !== 'ltd'
})

const onOptionClick = (item: any) => {
	if (item.is_pro && isNotPro.value) {
		productPaymentDialog({
			disablePro: true,
			sourceId: 361,
		})
	}
	return
}

const onChange = (value: string) => {
	emit('change', value)
}

const onTagChange = (value: string) => {
	let newTagOptions = props.tagOptions.map(item => ({
		...item,
		checked: value === 'all' ? item.value === 'all' : item.value === 'all' ? false : item.value === value ? !item.checked : item.checked,
	}))

	// 检查是否所有标签都未选中
	const hasChecked = newTagOptions.some(item => item.checked)
	if (!hasChecked) {
		// 如果都未选中，则选中"全部"选项
		newTagOptions = newTagOptions.map(item => ({
			...item,
			checked: item.value === 'all',
		}))
	}

	emit('update:tagOptions', newTagOptions)
}

const filteredOptions = computed(() => {
	const selectedTags = props.tagOptions.filter(tag => tag.checked).map(tag => tag.value)

	// 如果选中了 'all' 或没有选中任何标签，返回原数组的副本
	if (selectedTags.includes('all') || selectedTags.length === 0) {
		return [...props.options]
	}

	// 返回新的过滤后的数组
	return [...props.options].filter(option => option.tags?.some(tag => selectedTags.includes(tag)))
})
</script>
