<template>
	<div class="flex">
		<el-autocomplete v-model="search" v-bind="$attrs" clearable :style="{ width: width, height: height }" :fetch-suggestions="querySearch" :placeholder="placeholder" v-on="$listeners" @keyup.enter.native="onSearch($event)" @select="selectSearchVal" @clear="handleClear">
			<template #append>
				<el-button @click="onSearch($event)">
					<i class="svgtofont-el-search"></i>
				</el-button>
			</template>
		</el-autocomplete>
	</div>
</template>

<script lang="ts" setup>
interface Props {
	value?: string
	width?: string
	height?: string
	restaurants?: any
	placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
	value: '',
	width: '24rem',
	height: '3rem',
	placeholder: '请输入搜索内容',
	restaurants: () => [],
})

const emit = defineEmits(['change', 'search', 'focus', 'blur', 'clear', 'select', 'input'])
const search = ref(props.value)
const isSlotsFocus = ref(false)

/**
 * @deprecated 搜索
 * @param {Event} $event
 * @returns {void}
 */
const onSearch = ($event: Event): void => {
	emit('search', search.value, $event)
}

/**
 * @description 选择搜索值
 * @param {string} item.value - 搜索值
 * @returns {void}
 */
const selectSearchVal = (item: { value: string }): void => {
	emit('search', item.value)
}

/**
 * @description 创建过滤
 * @param {string} queryString - 搜索值
 * @returns {AnyFunction} 过滤函数
 */
const createFilter = (queryString: string): AnyFunction => {
	return (restaurant: { value: string }) => {
		return restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0
	}
}

/**
 * @description 查询搜索
 * @param {string} queryString - 搜索值
 * @param {AnyFunction} cb - 回调函数
 * @returns {void}
 */
const querySearch = (queryString: string, cb: AnyFunction) => {
	const { restaurants } = props
	if (!restaurants.length) cb([])
	const results = queryString ? restaurants?.filter(createFilter(queryString)) : restaurants
	cb(results)
}

/**
 * @description 处理清空事件
 * @returns {void}
 */
const handleClear = (): void => {
	search.value = ''
	emit('clear')
	emit('search', '') // 可选：如果您希望清空时也触发搜索事件
}

watch(search, val => {
	emit('input', val)
	emit('change', val)
})

watch(
	() => props.value,
	val => {
		search.value = val
	},
	{ immediate: true }
)
</script>
