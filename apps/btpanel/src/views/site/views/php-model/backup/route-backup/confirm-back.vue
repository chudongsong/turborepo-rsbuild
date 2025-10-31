<!--  -->
<template>
	<div>
		<div class="p-2rem pl-4rem leading-[24px] text-base" v-if="!showDataBaseBack">
			<p><b>站点名称：</b>{{ compData.name }}</p>
			<p><b>网站备份大小：</b>xxx</p>
			<p><b>站点目录：</b>{{ compData.path }}</p>

			<el-checkbox v-model="confirmDatabase">数据库</el-checkbox>
		</div>

		<!-- 数据库列表 -->
		<div class="p-2rem" v-if="showDataBaseBack">
			<div class="flex items-center">
				<i class="text-warning svgtofont-el-warning-filled !text-iconLarge"></i>
				<span class="text-base ml-[8px] leading-10">在备份数据库时，对应网站将不可访问，是否继续操作？</span>
			</div>

			<bt-table :column="tableColumn" :data="tableData" class="my-[1.2rem]"></bt-table>

			<span class="flex items-center"
				>备份后文件大小：{{ sizedata.size }}，当前磁盘剩余空间：{{ sizedata.current }}
				<i class="text-primary text-base svgtofont-el-refresh cursor-pointer ml-4px" @click="refreshSize"></i>
			</span>
		</div>
		<div class="bg-light footer-btn flex items-center justify-end p-[12px] w-full">
			<el-button type="warning" @click="$e => emit('close')">取消</el-button>
			<el-button type="primary" @click="confirmBackup"> 确定</el-button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useDataHandle } from '@/hooks/tools'
import { useCheckbox } from '@/hooks/tools/table/column'

interface Props {
	compData: any
}
const props = withDefaults(defineProps<Props>(), {
	compData: () => ({}),
})

const tableColumn = ref([useCheckbox(), { label: '数据库名称', prop: 'name' }, { label: '大小', prop: 'size' }]) // 表格列
const tableData = ref([]) // 表格数据
const confirmDatabase = ref(false) // 是否确认备份

const emit = defineEmits(['close'])

const sizedata = ref({
	size: 0,
	current: 0,
})

const showDataBaseBack = ref(false)

const confirmBackup = () => {
	// 当界面未第二步时，点击确定直接请求
	if (showDataBaseBack.value) {
		onSubmitBack()
		return
	}

	// 判断是否需要备份数据库
	if (confirmDatabase.value) {
		showDataBaseBack.value = true

		// const res = await xxx()
		// console.log(res)
		// tableData.value =

		return
	} else {
		onSubmitBack()
	}
}

const onSubmitBack = () => {
	console.log('备份')
	try {
		// useDataHandle({
		// 	loading: '正在备份中，请稍后...',
		// 	request: () => {},
		// })
		emit('close')
		props.compData.refresh && props.compData.refresh()
	} catch (error) {
		console.log(error)
	}
}

const refreshSize = () => {
	console.log('刷新')
}

defineExpose({
	onConfirm: onSubmitBack,
})
</script>

<style lang="sass" scoped></style>
