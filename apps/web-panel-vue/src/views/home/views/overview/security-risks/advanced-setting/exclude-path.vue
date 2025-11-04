<template>
	
	<bt-table-group>
		<template #header-left>
			<bt-input-icon class="mr-[12px]" v-model="dirValue" icon="el-folder-opened" @icon-click="onPathChange" width="32rem" placeholder="请填写或选择目录路径" />
			<el-button type="primary" @click="addPath"> 添加 </el-button>
		</template>
		<template #content>
			<bt-table max-height="370" :column="tableColumn" :data="malwareData.exclude_dirs" v-bt-loading="tableLoading"></bt-table>
		</template>
	</bt-table-group>
</template>

<script lang="tsx" setup>
import { storeToRefs } from 'pinia'
import { useOperate } from '@hooks/tools/table/column'
import { fileSelectionDialog } from '@/public'
import HOME_SECURITY_RISKS_STORE from '../store'
import { Message,useConfirm } from '@/hooks/tools'

const store = HOME_SECURITY_RISKS_STORE()
const { malwareData } = storeToRefs(store)
const {setMalwareConfig} = store

const tableLoading = ref(false) // 表格加载中
const dirValue = ref<string>('') // 目录名称

const tableColumn = ref([
	{
		prop: 'name',
		label: '路径',
		showOverflowTooltip: true, // 超出是否展示tooltip，默认为false
		minWidth: 690,
	},
	useOperate([
		{
			title: '删除', onClick: async(row: any) => {
				await useConfirm({
					title: '删除排除目录',
					content: '是否删除【' + row.name + '】？删除后，该目录将不再被排除',
				})
				await setMalwareConfig({delete_exclude_path: row.name})
		}},
	])
])

/**
 * @description: 添加目录
 */
const addPath = () => { 
	if (!dirValue.value) {
		return Message.error('请输入或选择目录路径')
	}

	if (dirValue.value === '/') {
		return Message.error('不能添加全盘路径')
	}
	
	// 添加目录逻辑
	setMalwareConfig({ add_exclude_path: dirValue.value })
	// 清空输入框
	dirValue.value = ''
}

/**
 * @description: 触发目录选择
 */
const onPathChange = () => {
	fileSelectionDialog({
		type: 'dir',
		path: dirValue.value,
		change: (path: string) => {
			dirValue.value = path
		},
	})
}
</script>