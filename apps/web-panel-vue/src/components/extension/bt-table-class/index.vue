<template>
	<el-select v-model="modelValue" :class="[{ 'select-active': selectActive, '!w-[11rem]': isSmall }]" v-bind="$attrs" @change="changeEvent">
		<template #label="{ label }">
			<div :class="[{ 'text-primary': selectActive }, 'flex items-center ']">
				<span v-if="selectActive && isSmall">分类：</span>
				<span>{{ label }}</span>
			</div>
		</template>
		<template #footer>
			<span class="select-type-line" @click="setClassManage">分类管理</span>
		</template>
		<el-option v-for="(item, index) in options" :key="index" :label="item.label" :value="item.value" :disabled="item?.disabled" class="select-custom-hover"> </el-option>
	</el-select>
</template>

<script lang="ts" setup>
import { useDialog } from '@/hooks/tools'

import type { SelectOptionProps } from '@components/form/bt-select/types'
import type { TableClassProps } from './types'

interface Props {
	name: string // 分类管理名称
	size?: 'default' | 'small' // 下拉框大小
	options: SelectOptionProps[] // 下拉选项配置
	ignore?: string[] // 忽略的分类
	config: TableClassProps // 分类管理配置
	field?: string // 请求的字段名称
	showEdit?: boolean // 是否显示编辑
}

const props = withDefaults(defineProps<Props>(), {
	name: 'bt-table-type', // 分类管理名称
	size: 'default',
	options: () => [{ label: '全部分类', value: 'all' }], // 分类选项
	ignore: () => [], // 忽略的分类
	// 分类管理配置 - 增删改查
	config: () => ({
		getClassList: () => Promise.resolve([]),
		addClass: () => Promise.resolve(),
		editClass: () => Promise.resolve(),
		deleteClass: () => Promise.resolve(),
		field: 'ps',
	}),
	field: 'ps',
	showEdit: true,
})

const emits = defineEmits<{
	(event: 'change', val: number | string): void
	(event: 'update:options', options: any): void
}>()

// 双向绑定
const modelValue = defineModel({
	default: () => 'all',
	type: String,
})

// const selectActive = ref(false) // 是否选中
const { getClassList, addClass, editClass, deleteClass } = unref(props.config) // 分类管理配置

// 是否选中
const selectActive = computed(() => modelValue.value !== 'all')

// 是否小尺寸
const isSmall = computed(() => props.size === 'small')

/**
 * @description 下拉框改变事件
 * @param {number | string} val 下拉框值
 */
const changeEvent = (val: number | string) => {
	emits('change', val)
}

const updateOptions = async (options: any) => {
	emits('update:options', options)
}

/**
 * @description 分类管理
 */
const setClassManage = () => {
	useDialog({
		title: '分类管理',
		area: '54',
		compData: {
			ignore: props.ignore,
			field: props.field,
			getClassList,
			addClass,
			editClass,
			deleteClass,
			updateOptions,
			showEdit: props.showEdit,
		},
		component: () => import('./class-manage.vue'),
	})
}

defineExpose({
	setClassManage,
})
</script>

<style lang="css" scoped>
.select-type-line {
	@apply flex items-center  w-full h-[3.2rem] text-small px-[2rem] cursor-pointer mb-[.5rem];
}
.select-type-line:hover {
	background-color: var(--el-fill-color-light);
}
.select-active :deep(.el-select__wrapper) {
	@apply bg-light border;
}
:deep(.el-select-dropdown) {
	max-width: 200px !important;
}

.select-custom-hover.el-select-dropdown__item {
	background-color: rgba(var(--el-color-white-rgb), 1);
}
.select-custom-hover.el-select-dropdown__item.is-selected.is-hovering {
	@apply bg-light;
}
.select-custom-hover.el-select-dropdown__item:hover {
	@apply bg-light;
}
</style>
