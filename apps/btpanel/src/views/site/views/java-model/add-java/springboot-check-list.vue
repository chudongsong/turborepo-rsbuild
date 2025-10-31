<template>
	<div class="px-[20px]">
		<bt-table-group>
			<template #header-left>
				<div class="text-medium mt-[1.6rem] flex items-center"><span class="text-warning svgtofont-el-warning-outline text-subtitleLarge mr-[1rem]"></span>检查到{{ errorData.length }}项问题，是否继续创建项目?</div>
			</template>
			<template #header-right> </template>
			<template #content>
				<div class="list-con">
					<div v-for="(error, index) in errorData" :key="index" class="list-item" :class="error.show ? '!bg-light' : ''">
						<div class="flex justify-between items-center h-[4.5rem]" :class="error.file ? 'cursor-pointer' : ''" @click="openDetail(error)">
							<span class="font-bold text-small w-[90%] truncate" :title="error.msg">{{ error.msg }}</span>
							<span v-if="setDetailText(error.file)" class="showDetail">详情<span :class="error.show ? 'svgtofont-el-arrow-down' : 'svgtofont-el-arrow-right'"></span></span>
						</div>
						<template v-if="setDetailText(error.file)">
							<div v-show="error.show" class="list-detail">{{ setDetailText(error.file) }}</div>
						</template>
					</div>
				</div>
			</template>
		</bt-table-group>
	</div>
</template>

<script setup lang="ts">
interface Props {
	compData: any
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => {},
})

const errorData = ref<any[]>([]) // 错误数据
const tableLoading = ref(false) // 表格loading
let params = {} // 查询参数

/**
 * @description: 设置详情文字
 * @param {string} error.file
 */
const setDetailText = (msg: string) => {
	if (!msg) return false
	switch (true) {
		case msg.startsWith('/'):
			return `来源：文件路径${msg}`
		case msg === '命令行或环境变量':
			return `来源：命令行或环境变量`
		default:
			return `来源：jar包内文件${msg}`
	}
}

/**
 * @description: 展开详情
 * @param {object} error
 */
const openDetail = (error: any) => {
	if (!error.file) return
	// vm.$set(error, 'show', !error.show)
	error.show = !error.show
}

onMounted(async () => {
	params = props.compData.params
	errorData.value = props.compData.data.map((item: any) => {
		return {
			...item,
			show: false,
		}
	})
})
</script>

<style lang="css" scoped>
.list-con {
	@apply w-full min-h-[30rem] max-h-[60rem] overflow-y-auto;
}
.list-item {
	@apply bg-extraLight px-[2rem];
}
.list-item:hover {
	@apply bg-light;
}
.list-item:not(:first-child) {
	@apply mt-[1.6rem];
}
.list-detail {
	@apply w-full bg-white p-[1rem] border-b-lighter border-b;
}
.showDetail {
	@apply text-primary cursor-pointer;
}
.showDetail:hover {
	@apply text-primaryDark;
}
</style>
