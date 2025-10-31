<template>
	<div>
		<template v-if="cycles.includes(tid || '') && data.attr === 'cycle'">
			<div class="flex items-center">
				<el-select v-model="valueRef" class="!w-[16rem]" :disabled="true">
					<el-option v-for="item in data.items" :key="item.value" :label="item.title + '分钟'" :value="item.value"> </el-option>
				</el-select>
				<div v-if="data.suffix" v-html="data.suffix" class="ml-[1rem]"></div>
			</div>
		</template>
		<template v-else-if="data.type === 'cascader'"> <el-cascader v-model="valueRef" :props="cascaderProps"></el-cascader></template>
		<template v-else-if="data.type === 'multiple-select'">
			<el-select v-model="valueRef" multiple class="!w-[24.8rem] bt-multiple-select" :placeholder="data.suffix || '请选择'">
				<el-option v-for="item in data.items" :key="item.value" :label="item.title" :value="item.value"> </el-option>
			</el-select>
		</template>
		<template v-else-if="loadSelect">
			<div class="flex items-center">
				<el-select v-bt-loading="loadShow" element-loading-spinner="svgtofont-el-loading" v-bt-loading:size="'small'" v-model="valueRef" filterable class="!w-[24.8rem]">
					<el-option v-for="item in processConfig" :key="item.value" :label="item.title" :value="item.value"> </el-option>
				</el-select>
				<span class="bt-link ml-[1rem] flex items-center" @click="refresh">刷新<i class="svgtofont-el-refresh-right ml-2px"></i></span>
			</div>
		</template>
		<template v-else>
			<el-select v-model="valueRef" :class="data.width ? '' : '!w-[24.8rem]'" :style="{ width: data.width }" :disabled="data.disabled">
				<el-option v-for="item in data.items" :key="item.value" :label="item.title" :value="item.value"> </el-option>
			</el-select>
		</template>
	</div>
</template>
<script setup lang="ts">

import { Field } from '@config/types'
import { isBoolean, isObject } from '@utils/index'
import { getUrlData } from '@api/config'

const processConfig = ref<any>([])
const props = defineProps<{
	tid: string
	value: any
	data: Field
	cycles: string[]
	row: any
}>()

const emit = defineEmits<{
	(event: 'update:value', val: string | number): void
}>()





const { tid, data, row } = toRefs(props)
const loadSelect = ref(false)
const loadShow = ref(false)

const valueRef = computed({
	get() {
		return props.value
	},
	set(val) {
		if (props.tid === '9' && props.data.attr === 'cycle') {
			emit('update:value', Number(val))
		} else {
			emit('update:value', val)
		}
	},
})
const refresh = async () => {
	loadShow.value = true
	await getProcessConfig(data)
	loadShow.value = false
}
const cascaderProps = {
	lazy: true,
	async lazyLoad(node: any, resolve: any) {
		const { level } = node
		if (data?.value?.items[level].url) {
			let params: any = {}
			if (level >= 1) {
				for (let i = 0; i < level; i++) {
					if (i === level - 1) {
						params[data.value.items[level].data[i]] = node.value
					} else {
						params[data.value.items[level].data[i]] = node.parent.value
					}
				}
			}
			const { data: res } = await getUrlData(data.value.items[level].url, params)
			resolve(
				res.map((item: any) => ({
					value: item.value,
					label: item.title,
					leaf: level === data.value.items.length - 1 ? data.value.items.length : undefined,
				}))
			)
		}
	},
}

const getProcessConfig = async (data1: any) => {
	try {
		const { data } = await getUrlData(data1.value.items.url as string)
		processConfig.value = data
	} catch (error) {
		console.log(error)
	}
}

const getAttrData = (attr: string, options: any) => {
	if (!attr || !options) return ''
	// 根据属性路径分割（支持嵌套属性）
	const keys = attr.split('.')
	let value = options
	for (const key of keys) {
		value = value?.[key]
		if (value === undefined) break
	}
	return value ?? ''
}

onMounted(async () => {
	console.log('---', data.value)
	watch(valueRef, (newVal) => {
		console.log('---', newVal, data.value)
	})
	if (data.value.type === 'select' && isObject(data.value.items) && 'url' in data.value.items) {
		loadSelect.value = true
		const isEdit = !isBoolean(row.value)
		try {
			if (processConfig.value.length === 0) {
				loadShow.value = true
				await getProcessConfig(data)
				loadShow.value = false
				valueRef.value = isEdit ? getAttrData(data.value.attr, row.value.task_data) : processConfig.value[0].value
			} else {
				if (valueRef.value === '') {
					valueRef.value = isEdit ? getAttrData(data.value.attr, row.value.task_data) : processConfig.value[0].value
				}
			}
		} catch (err) {
			console.log(err)
		}
	}
})
</script>
<style scoped lang="sass"></style>
