<template>
	<div class="p-[2rem]">
		<bt-table-group>
			<template #header-left> </template>
			<template #header-right> </template>
			<template #content>
				<bt-table :max-height="300" :column="tableColumns" :data="tableData" v-bt-loading="tableLoading" @selection-change="selectionChange" />
			</template>
			<template #footer-left>
				<!-- <bt-table-batch :data="batchGroup" :config="batchConfig" :batch-fn="batchEvent" /> -->
			</template>
		</bt-table-group>
		<!-- <ul class="mt-8x leading-8 text-small list-disc ml-20x">
			<li>启动顺序为依次启动时,项目将按照从上到下依次进行启动</li>
		</ul> -->
	</div>
</template>

<script setup lang="ts">
import { groupAddProjects, getJavaSpringProject } from '@/api/site'
import { useMessage } from '@/hooks/tools'
import { useCheckbox } from '@/hooks/tools/table/column'

const props = defineProps<{
	compData: any
}>()

const Message = useMessage()
const emit = defineEmits(['close'])

const tableData = ref([]) // 表格数据
const tableLoading = ref(false) // 表格加载状态
const selectList = ref([]) // 选中的项目
const tableColumns = [useCheckbox(), { prop: 'name', label: '项目名称' }] // 响应式数据 响应式数据

/**
 * @description: 选择项目
 * @param {Array} val
 */
const selectionChange = (val: any) => {
	selectList.value = val.map((item: any) => item.id)
}
/**
 * @description: 过滤项目
 * @param {Array} arr 已有项目列表
 */
const filterProject = (arr: any) => {
	const usedList = props.compData.projectList.map((item: any) => item.id)
	return arr.filter((item: any) => !usedList.includes(item.id))
}
/**
 * @description: 获取可用项目列表
 */
const getList = async () => {
	try {
		tableLoading.value = true
		const res = await getJavaSpringProject()
		const list = filterProject(res.data)

		if (list.length === 0) {
			Message.error('暂无可用项目')
			emit('close')
			return
		}
		tableData.value = list
	} catch (error) {
	} finally {
		tableLoading.value = false
	}
}

/**
 * @description: 保存添加项目
 */
const onConfirm = async () => {
	try {
		if (selectList.value.length === 0) {
			Message.error('请选择项目')
			return
		}
		const res = await groupAddProjects({
			group_id: props.compData.group_id,
			project_ids: JSON.stringify(selectList.value),
		})
		Message.request(res)
		if (res.status) {
			emit('close')
			props.compData.refreshEvent()
		}
	} catch (error) {}
}

onBeforeMount(getList)

defineExpose({
	onConfirm,
})
</script>
