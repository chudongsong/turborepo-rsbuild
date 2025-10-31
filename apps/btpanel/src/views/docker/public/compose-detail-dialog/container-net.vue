<template>
	<bt-table-group>
		<template #header-left>
			<bt-select v-model="net.container_id" :options="options" class="!w-[20rem]" />
			<el-button title="加入网络" class="!ml-[1rem]" type="primary" @click="join">加入网络</el-button>
		</template>
		<template #header-right>
			<bt-table-column :name="'containerNetColumn'" :column="tableColumn" :tableRef="dockerNetTable" />
		</template>
		<template #content>
			<bt-table ref="dockerNetTable" :column="tableColumn" :data="TableData.list" :description="'容器网络列表为空'" v-bt-loading="TableData.loading" v-bt-loading:title="'正在加载容器网络列表，请稍后...'" />
		</template>
	</bt-table-group>
</template>

<script setup lang="ts">
import { contrastTableConfig } from '@utils/index' // 工具函数
import { Message } from '@hooks/tools/message'
import { useConfirm } from '@hooks/tools/confirm'
import { useDataHandle } from '@hooks/tools/data'
import { setConAddNet, setConOutNet, getNetList } from '@/api/docker'
import { getDockerStore } from '@docker/useStore'
import { useOperate } from '@hooks/tools/table/column'

const {
	refs: { currentConDetail },
	getCurrentCon,
} = getDockerStore()

const dockerNetTable = ref() // 获取表格实例

// 表单
const net = reactive({
	container_id: '', // 网络ID
})

// 表格数据
const TableData = reactive({
	list: [] as any[],
	loading: false,
})

// 网络列表选项
const options = shallowRef([])

// 加入
const join = async () => {
	const params = {
		id: net.container_id,
		container_id: currentConDetail.value.Id,
	}

	if (!params.id) {
		Message.error('请选择网络')
		return
	}

	useDataHandle({
		request: setConAddNet({ data: JSON.stringify(params) }),
		message: true,
		success: async (res: any) => {
			if (res.status) {
				await getCurrentCon(currentConDetail.value.Id)
				getTableData()
				net.container_id = ''
			}
		},
	})
}

/**
 * @description 退出网络事件
 * @param {any} table_row 行数据
 */
const deleteDataEvent = async (table_row: any): Promise<void> => {
	await useConfirm({
		title: `退出网络【${table_row.name}】`,
		content: `您真的要退出网络【${table_row.name}】吗？`,
	})

	const params = {
		id: table_row.NetworkID,
		container_id: currentConDetail.value.Id,
	}
	useDataHandle({
		request: setConOutNet({ data: JSON.stringify(params) }),
		message: true,
		success: async (res: any) => {
			if (res.status) {
				await getCurrentCon(currentConDetail.value.Id)
				getTableData()
			}
		},
	})
}

// 获取表格数据
const getTableData = async () => {
	TableData.loading = true
	const arr = Object.entries(currentConDetail.value.NetworkSettings.Networks)
	const list: any[] = []
	arr.forEach((item: any) => {
		list.push({ name: item[0], ...item[1] })
	})
	TableData.list = list
	TableData.loading = false
}

let tableColumn = ref([
	{ label: `网络名`, prop: 'name', minWidth: 100 },
	{ label: `IPV4地址`, prop: 'IPAddress', minWidth: 100, isCustom: true },
	{ label: `IPV6地址`, prop: 'IPAddress6', minWidth: 100, isCustom: false },
	{ label: `网关`, prop: 'Gateway', minWidth: 100, isCustom: true },
	{ label: `MAC地址`, prop: 'MacAddress', minWidth: 100, isCustom: true },
	useOperate([{ onClick: deleteDataEvent, width: 60, title: `退出网络` }]),
])

const init = async () => {
	getTableData()
	// tableColumn = contrastTableConfig(JSON.parse(localStorage.getItem('containerNetColumn') || '[]'), tableColumn)
	// 获取网络选项
	useDataHandle({
		request: getNetList(),
		data: Array,
		success: (data: any) => {
			options.value = data.map((item: any) => ({ label: item.name, value: item.id }))
		},
	})
}

onMounted(init)
</script>
