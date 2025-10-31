<template>
	<div class="p-[20px]">
		<bt-table-group>
			<template #header-left>
				<el-button type="primary" @click="openAddCloudForm()">添加远程数据库</el-button>
			</template>
			<template #content>
				<bt-table :column="tableColumn" :data="tableData" :max-height="300"></bt-table>
			</template>
		</bt-table-group>

		<ul class="ml-20px mt-12px leading-8 text-small list-disc">
			<li v-if="tips?.length && tips[0]">{{ tips[0] }}</li>
			<li v-for="(help, index) in helpList" :key="index">{{ help.content }}</li>
			<li v-if="tips?.length && tips[1]">{{ tips[1] }}</li>
		</ul>
	</div>
</template>
<script lang="tsx" setup>
import type { CloudServerItem } from '@database/types' // 表格数据类型

import { removeServer, removeModuleServer, getModulesCloudServer, getMysqlCloudServer } from '@api/database'
import { getDatabaseStore } from '@database/useStore'

import { useDataHandle } from '@hooks/tools'
import { useOperate } from '@hooks/tools/table/column'
import { useDialog } from '@hooks/tools'
import { useConfirm } from '@hooks/tools'
import { showTips as tips } from '@database/useMethod'

const {
	refs: { tabActive, isHaveServer },
	refreshTableList,
} = getDatabaseStore()

const tableData = ref<Array<CloudServerItem>>([]) // 表格数据

const helpList = [{ content: '支持阿里云、腾讯云等云厂商的云数据库' }, { content: '注意1：请确保本服务器有访问数据库的权限' }, { content: '注意2：请确保填写的管理员帐号具备足够的权限' }] // 帮助文案列表

/**
 * @description 打开添加远程数据库表单
 */
const openAddCloudForm = (row?: CloudServerItem) => {
	useDialog({
		title: `${row ? '编辑' : '添加'}远程数据库`,
		area: [42],
		compData: { row, refreshEvent: () => getServerList() },
		showFooter: true,
		component: () => import('./add-cloud-server.vue'),
	})
}

/**
 * @description 删除远程数据库
 * @param row 行数据
 */
const delCloudEvent = async (row: CloudServerItem) => {
	await useConfirm({
		title: `删除【${row.db_host}】远程数据库`,
		content: '该操作仅删除管理关系以及面板中的数据库记录，不会删除远程数据库中的数据,是否继续？',
		icon: 'warning-filled',
	})
	await useDataHandle({
		loading: '正在删除中，请稍后...',
		request: tabActive.value === 'mysql' ? removeServer({ id: row.id }) : removeModuleServer({ data: JSON.stringify({ id: row.id }) }, tabActive.value),
		message: true,
	})
	getServerList() // 更新服务器列表
	refreshTableList() // 刷新列表
}

/**
 * @description 更新服务器列表
 */
const getServerList = async () => {
	const res = await useDataHandle({
		loading: '正在获取数据中，请稍后...',
		request: tabActive.value === 'mysql' ? getMysqlCloudServer() : getModulesCloudServer({ data: JSON.stringify({ type: tabActive.value }) }, tabActive.value),
		data: [Array, (data: any) => data.filter((item: any) => item.id !== 0)],
	})
	tableData.value = res || []
	isHaveServer.value = res.length
	return res
}

const useCloudTableColumn = () => {
	return [
		{ prop: 'db_host', label: '服务器地址', width: 120 },
		{ prop: 'db_port', label: '数据库端口' },
		{ prop: 'db_type', label: '数据库类型' },
		{ prop: 'db_user', label: '管理员名称' },
		{ prop: 'db_password', label: '管理员密码', width: 150 },
		{ label: '备注', prop: 'ps' },
		useOperate([
			{ onClick: (row: CloudServerItem) => openAddCloudForm(row), title: '编辑' },
			{ onClick: (row: CloudServerItem) => delCloudEvent(row), title: '删除' },
		]), // 操作
	]
}

const tableColumn = useCloudTableColumn()

onMounted(() => {
	getServerList()
})
</script>
