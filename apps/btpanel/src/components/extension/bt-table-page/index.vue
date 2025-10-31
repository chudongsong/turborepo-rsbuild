<template>
	<template v-if="type === 'default'">
		<el-pagination background size="small" v-bind="$attrs" :total="total" :page-size="limit" :page-sizes="rowList" :current-page="page" :pager-count="5" :layout="layout" @size-change="sizeChangeEvent" @current-change="currentChangeEvent" />
	</template>
	<template v-if="type === 'unknown'">
		<div class="flex items-center h-[28px]">
			<span v-if="page > 1" class="bt-link !border-solid !border-1 !border-light !px-[10px] !h-[28px] leading-[28px] text-center" @click="$emit('change', 1, $event)"> 首页 </span>
			<span v-if="page > 1" class="bt-link !border-solid !border-1 !border-light !px-[10px] !h-[28px] leading-[28px] text-center" @click="$emit('change', page - 1, $event)"> 上一页 </span>
			<span v-if="row >= total" class="bt-link !border-solid !border-1 !border-light !px-[10px] !h-[28px] leading-[28px] text-center" @click="$emit('change', page + 1, $event)"> 下一页 </span>
			<span class="!border-solid !border-1 !border-light !px-[10px] !h-[28px] leading-[28px] text-center"> 第 {{ page }} 页 </span>
		</div>
	</template>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

interface Props {
	row: number // 分页显示数量
	page: number // 当前页
	total: number // 总数
	type?: 'default' | 'unknown' // type为 unknown 时, row 为当前页数量, total 为每页最多显示数量,当row < total时, 就是最后一页
	name?: string
	layout?: string
	rowList?: Array<number>
	useStorage?: boolean
}
// 以下为双向绑定数据
const row = defineModel<number>('row', { default: 10 }) // default: 分页显示数量   unknown: 当前页数量
const page = defineModel<number>('page', { default: 1 }) // 当前页
const total = defineModel<number>('total', { default: 0 }) // default: 总数   unknown: 每页最多显示数量
// const usePageStorage = defineModel<boolean>('usePageStorage', {
// 	default: true,
// }) // 是否使用分页存储

const prop = withDefaults(defineProps<Props>(), {
	type: 'default', // 默认分页样式
	name: 'row', // 用于存储分页显示条数
	layout: 'prev, pager, next, sizes, total, jumper',
	rowList: () => [10, 20, 50, 100],
	useStorage: true,
})

const route = useRoute()
const pageName = `${route?.fullPath.replace(/\//g, '_')}_${prop?.name}` // 用于存储分页名称
const pageSize = useSessionStorage<number>(pageName, row.value || prop.rowList[0]) // 用于存储分页显示条数
const emits = defineEmits(['change']) // 声明组件emit事件

const limit = computed(() => {
	row.value = prop.useStorage ? pageSize.value : row.value
	return prop.useStorage ? pageSize.value : row.value
}) // 分页显示数量

watch(
	() => pageSize.value,
	value => {
		if (value !== row.value) {
			row.value = value
			emits('change', page.value, value)
		}
	}
)

/**
 * @description 分页显示数量事件,当分页发生变化时触发
 * @param {number} value 分页显示数量
 */
const sizeChangeEvent = (value: number) => {
	page.value = 1
	if (value !== row.value) row.value = value
	pageSize.value = value
	emits('change', page.value, value)
}

/**
 * @description 分页事件,当分页发生变化时触发
 * @param {number} value 当前页
 */
const currentChangeEvent = (value: number) => {
	page.value = value
	emits('change', value, limit.value)
}
onMounted(() => {})
</script>

<style lang="css" scoped>
.el-pagination :deep(.el-input__inner) {
	padding: 0 !important;
}
</style>
