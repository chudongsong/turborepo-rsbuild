<template>
	<div class="px-[1.6rem] py-[0.6rem]">
		<bt-table-group>
			<template #content>
				<bt-table ref="addWebsiteTable" max-height="260px" :column="tableColumn" @selection-change="handleSelectionChange" :data="tableData" v-bt-loading="loading" :description="'端口列表为空'" v-bt-loading:title="'正在加载端口列表，请稍后...'"></bt-table>
			</template>
		</bt-table-group>
	</div>
</template>
<script lang="tsx" setup>
import { addAllSite } from '@/api/firewall'
import { useCheckbox } from '@/hooks/tools/table/column'
import { useDataHandle } from '@hooks/tools'

interface Props {
	compData: any
}
const props = withDefaults(defineProps<Props>(), {
	compData: () => {},
})

// 页面数据
const loading = ref<boolean>(false) // 加载状态
const tableData = shallowRef<Array<any>>() //列表数据

// 表格选中数据
const tableSelect = reactive({
	list: [],
	num: 0,
})

// 表格数据
const tableColumn = [useCheckbox({ key: 'path' }), { label: '目录', prop: 'path' }]

/**
 * @description 切换列表页面
 * @param {number} p 当前页码
 */
const currentListPage = async (p: number = 1) => {
	await useDataHandle({
		request: addAllSite(),
		loading,
		data: [Array, tableData],
	})
	tableData.value = tableData.value?.map((item: any) => ({ path: item }))
}

/**
 * @description 表格选中事件
 * @param {Array} val 表格选中数据
 */
const handleSelectionChange = (val: any) => {
	tableSelect.num = val.length
	tableSelect.list = val
}

/**
 * @description: 提交表单
 */
const submitFrom = async (close: Function) => {
	try {
		props.compData.dirs = tableSelect.list.map(item => item.path).join('\n')
		close()
	} catch (error) {
		console.log(error)
	}
}

// 页面加载完成
onMounted(() => {
	currentListPage()
})

defineExpose({ onConfirm: submitFrom })
</script>
