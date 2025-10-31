<template>
	<div class="flex w-full h-full">
		<div class="man_l">
			<ul class="man_db">
				<template v-for="(item, index) in compData.list">
					<li v-if="item.path === compData.path" :key="index" :class="index === active ? 'active' : ''">
						<div class="man_db_li">
							<div class="man_db_li_left">
								<bt-image src="/database/database-icon.png" class="w-[1.4rem] h-[1.4rem] mr-[4px] ml-[8px]"></bt-image>
								<span :title="item.name">{{ item.name }}</span>
							</div>
							<div class="cursor-pointer ml-8px">
								<el-button size="small" @click="refreshDb">
									<i class="svgtofont-el-refresh-right mr-4px"></i>
									刷新
								</el-button>
							</div>
						</div>
						<ul class="man_t">
							<li class="new_query flex items-center" @click="leftTableClick({ path: item.path, name: 'sql' })" :class="activeChild.indexOf('nq_con_') !== -1 ? 'active' : ''">
								<bt-image src="/database/select-icon.png" class="w-[1.4rem] mr-[4px] align-text-bottom"></bt-image>
								<span>新建查询</span>
							</li>
							<li class="flex items-center" v-for="(it, idx) in dbObj[item.path]" :key="idx" @click="leftTableClick({ path: item.path, name: it.name })" :class="it.name === activeChild ? 'active' : ''">
								<bt-image src="/database/table-icon.png" class="w-[1.4rem] mr-[4px] align-text-bottom"></bt-image>
								<span class="flex items-center">
									<span class="inline-block max-w-[14rem] truncate">
										{{ it.name }}
									</span>
									{{ '（' + it.count + '）' }}
								</span>
							</li>
						</ul>
					</li>
				</template>
			</ul>
		</div>
		<div class="man_r">
			<template v-if="isEmpty">
				<div class="flex items-center justify-center h-full">
					<el-empty description="请点击左侧表查看数据"></el-empty>
				</div>
			</template>
			<template v-else>
				<div ref="scrollDiv" class="ul_scroll" @wheel="handleScroll">
					<ul>
						<li :class="item.name === activeChild || item.path === activeChild ? 'active' : ''" v-for="(item, index) in rightHeader" :key="index" @click="rightTableClick(item)">
							<div class="ul-item">
								<div class="flex-1 flex items-center">
									<bt-image :src="item.name === '新建查询' ? '/database/select-icon.png' : '/database/table-icon.png'" class="w-[1.4rem] h-[1.4rem] mr-[4px] align-middle text-small"></bt-image>
									<span>{{ item.name }}</span>
								</div>
								<i class="svgtofont-el-close ml-[4px]" @click="removeItem(index)"></i>
							</div>
						</li>
					</ul>
				</div>
				<bt-table-group v-if="isTable" class="p-[1.2rem]">
					<template #header-left>
						<el-button type="primary" @click="insertData">添加数据</el-button>
					</template>
					<template #header-right>
						<bt-input-search class="mr-4px" v-model="tableParam.search" @search="getTableData" placeholder="搜索所有字段" />
						<bt-table-refresh @refresh="refreshTable"></bt-table-refresh>
					</template>
					<template #content>
						<bt-table ref="mangerTableRef" :max-height="480" v-bt-loading="tableLoad" :column="tableColumn" :data="tableParam.data" :description="tableParam.emptyText"></bt-table>
					</template>
					<template #footer-left>
						<bt-table-batch :table-ref="mangerTableRef" :options="batchOptions" />
					</template>
					<template #footer-right>
						<bt-table-page layout="prev, pager, next,  total, jumper" type="default" v-model:page="tableParam.p" v-model:row="tableParam.limit" @change="getTableData" :total="tableParam.total" />
					</template>
				</bt-table-group>
				<div v-else class="nq_con">
					<template v-for="(item, index) in rightHeader">
						<div v-if="item.name === '新建查询'" :key="index" :class="item.path === activeChild ? '' : 'hidden'">
							<div class="p-[1.5rem]">
								<bt-editor v-model="item.sql" class="!h-[21rem]" :editor-option="config"></bt-editor>
								<el-button type="default" class="!mt-[1rem]" @click="runSql(item)" :disabled="item.status === 1">
									{{ item.status === 1 ? '正在查询...' : '运行' }}
								</el-button>
							</div>
							<div class="run_result p-[1.5rem]" :class="item.status ? '' : 'hidden'">
								<span class="text-base">查询结果：</span>
								<div class="mt-[1rem]">
									<table v-if="!isString(item.result)" class="result_table table" border="1">
										<tbody>
											<tr v-for="(ite, idx) in item.result" :key="idx">
												<td v-for="(it, id) in ite" :key="id">{{ it }}</td>
											</tr>
										</tbody>
									</table>
									<div v-else class="text-danger">{{ item.result }}</div>
								</div>
							</div>
						</div>
					</template>
				</div>
			</template>
		</div>
	</div>
</template>
<script lang="ts" setup>
import type { TableColumnProps } from '@/components/data/bt-table/types.d'

import { deleteTableData, getSqliteKeys, getSqliteTableInfo, getSqliteTableList, querySql } from '@/api/database'
import { useBatchStatus, useCheckbox, useOperate } from '@/hooks/tools/table/column'
import { Message } from '@hooks/tools'
import { useConfirm, useDataHandle, useDataPage, useDialog } from '@hooks/tools'
import { getPageTotal, getRandomChart, isString } from '@utils/index'
import { isDark } from '@/utils/theme-config'
interface Props {
	compData?: any
}
const props = withDefaults(defineProps<Props>(), {
	compData: {},
})

const mangerTableRef = ref()

const scrollDiv = ref() // 滚动容器
const isEmpty = ref(true) // 是否为空
const active = ref(0)
const activeChild = ref('')
const tableLoad = ref(false) // 表格loading
const isTable = ref(true) // 是否显示表格
const tableParam = ref<any>({
	p: 1,
	limit: 10,
	total: 0,
	search: '',
	data: [],
	path: '',
	table: '',
	emptyText: '暂无数据，您可以添加数据',
})
let dbObj = ref<any>({}) // 数据库对象
const rightHeader = ref<any>([]) // 右侧头部
const tableKeys = ref<any>([]) // 表格字段

const config = {
	mode: 'ace/mode/nginx',
	theme: !isDark.value ? 'ace/theme/chrome' : 'ace/theme/clouds_midnight', //主题
	wrap: true, // 是否自动换行
	showInvisibles: false, // 是否显示空格
	showFoldWidgets: false, // 是否显示代码折叠线
	useSoftTabs: true, // 是否使用空格代替tab
	tabSize: 2, // tab宽度
	showPrintMargin: false, // 是否显示打印边距
	readOnly: false, // 是否只读
	fontSize: '12px', // 字体大小
} // ace编辑器配置

/**
 * @description: 修改数据
 */
const updateEvent = (row: any) => {
	useDialog({
		title: '更改数据【' + row.id + '】',
		component: () => import('./insert-data.vue'),
		area: 48,
		compData: {
			keys: tableKeys.value,
			row: row,
			path: tableParam.value.path,
			table: tableParam.value.table,
			refresh: getTableData,
		},
		showFooter: true,
	})
}

/**
 * @description: 删除数据 / 批量删除数据
 * @param row 行数据
 */
const delEvent = async (row: any): Promise<void> => {
	const primaryKey = tableKeys.value.find((item: any) => item.pk === 1).name
	await useConfirm({
		title: '删除表数据 [ ' + row[primaryKey] + ' ]',
		content: '删除选中表【' + tableParam.value.table + '】的数据后，该条数据将彻底消失，是否继续操作？',
	})
	await useDataHandle({
		loading: '正在删除表数据，请稍后...',
		request: deleteTableData({
			path: tableParam.value.path,
			table: tableParam.value.table,
			where_data: row,
		}),
		message: true,
	})
	getTableData()
}

const tableColumn = ref<TableColumnProps[]>()

const insertData = () => {
	useDialog({
		title: '添加数据',
		component: () => import('./insert-data.vue'),
		area: 48,
		compData: {
			keys: tableKeys.value,
			path: tableParam.value.path,
			table: tableParam.value.table,
			refresh: initTable,
		},
		showFooter: true,
	})
}

const initTable = () => {
	getTableData()
	getTableList(props.compData.path, true)
}

/**
 * @description: 获取数据库表列表
 * @param {string} path 数据库路径
 * @param {boolean} isRefresh 是否刷新左侧列表
 */
const getTableList = async (path: string, isRefresh?: boolean) => {
	try {
		if (!dbObj.value[path] || isRefresh) {
			// 如果没有缓存 或者 刷新
			const { data } = await getSqliteTableList({ path: path })
			dbObj.value = { ...dbObj.value, [path]: data }
			if (!isRefresh && data.length > 0) leftTableClick({ path: path, name: data[0].name })
		} else {
			dbObj.value[path]?.length > 0 && leftTableClick({ path: path, name: dbObj.value[path][0].name })
		}
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description: 左侧表点击事件
 */
const leftTableClick = (obj: any) => {
	const { name, path } = obj
	isEmpty.value = false
	// 新建查询 单独处理 不显示表格
	if (name === 'sql') {
		const num = getRandomChart(8)
		isTable.value = false
		rightHeader.value.push({
			name: '新建查询',
			path: 'nq_con_' + num,
			sql: '',
			status: 0, // 是否运行
			queryPath: path,
		})
		activeChild.value = 'nq_con_' + num
		return
	}
	// 显示表格
	isTable.value = true
	if (!rightHeader.value.find((item: any) => item.path === path && item.name === name)) {
		rightHeader.value.push({ name, path })
		rightTableClick(obj)
	} else {
		rightTableClick(obj)
	}
}

/**
 * @description: 移除右侧表
 */
const removeItem = (index: number) => {
	rightHeader.value.splice(index, 1)
	if (rightHeader.value.length) {
		rightTableClick(rightHeader.value[index] || rightHeader.value[index - 1])
	} else {
		isEmpty.value = true
		isTable.value = false
	}
}

/**
 * @description: 右侧表点击事件
 */
const rightTableClick = (item: any) => {
	const { name, path } = item
	isEmpty.value = false
	if (name === '新建查询') {
		activeChild.value = path
	} else {
		isTable.value = true
		renderTable(item)
	}
}

/**
 * @description: 渲染表格
 */
const renderTable = async (item: any) => {
	try {
		const { path, name } = item
		const { data: res } = await getSqliteKeys({ path, table: name })
		tableKeys.value = res
		let columns: any = []
		res.forEach((item: any) => columns.push({ label: item.name, prop: item.name, showOverflowTooltip: true }))
		tableColumn.value = [
			useCheckbox({ key: columns[0].prop }),
			...columns,
			useOperate([
				{ onClick: updateEvent, title: '更改' },
				{ onClick: delEvent, title: '删除' },
			]), // 操作
		]
		tableParam.value.path = path
		tableParam.value.table = name
		getTableData()
		// batchConfig.describe.propsValue = tableKeys.value.find(
		//   (item: any) => item.pk === 1
		// ).name;
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description: 获取表格数据
 */
const getTableData = async () => {
	try {
		activeChild.value = tableParam.value.table
		const { data: res } = await useDataHandle({
			loading: tableLoad,
			request: getSqliteTableInfo({
				path: tableParam.value.path,
				table: tableParam.value.table,
				p: tableParam.value.p,
				search: tableParam.value.search,
			}),
		})
		tableParam.value.data = isString(res.data) ? [] : res.data
		tableParam.value.emptyText = isString(res.data) ? res.data : '暂无数据，您可以添加数据'
		tableParam.value.total = getPageTotal(res.page)
	} catch (error) {}
}

/**
 * @description: 运行sql
 */
const runSql = async (item: any) => {
	try {
		item.status = 1
		if (item.sql) {
			const { data } = await querySql({
				path: item.queryPath,
				sql_shell: item.sql,
			})
			item.result = data.status ? data.list : data.msg
		} else {
			item.result = '请输入sql语句查询'
		}
		item.status = 2
	} catch (error) {}
}

/**
 * @description: 滚动事件
 */
const handleScroll = (e: any) => {
	if (e.deltaY > 0) {
		// 向下滚动，横向滚动条向右移动
		scrollDiv.value.scrollLeft += 100
	} else {
		// 向上滚动，横向滚动条向左移动
		scrollDiv.value.scrollLeft -= 100
	}
}

/**
 * @description: 刷新数据库
 */
const refreshDb = async () => {
	await getTableList(props.compData.path, true)
	Message.success('刷新成功')
}

/**
 * @description: 刷新数据库
 */
const refreshTable = async () => {
	await getTableData()
	Message.success('刷新成功')
}

const batchOptions = [
	{
		label: '删除数据',
		value: 'delete',
		event: async (batchConfirm, nextAll, selectedList, options) => {
			await batchConfirm({
				title: `批量删除备份文件`,
				content: `批量删除已选备份文件，是否继续操作？`,
				column: [{ prop: tableColumn.value[1]?.prop, label: tableColumn.value[1]?.label }, useBatchStatus()] as TableColumnProps[], // 弹窗配置
				onConfirm: async () => {
					await nextAll((data: any) =>
						deleteTableData({
							path: tableParam.value.path,
							table: tableParam.value.table,
							where_data: data,
						})
					) // 递归操作所有选中的数据
					initTable()
					// 返回false则不关闭弹窗
					return false
				},
			})
		},
	},
]

onMounted(() => {
	const { list, path } = props.compData
	active.value = list.findIndex((item: any) => item.path === path) || 0
	getTableList(path)
})
</script>

<style lang="css" scoped>
.man_l {
	@apply w-[24rem] overflow-auto;
	border-right: 1px solid var(--el-color-border-extra-light);
}

.man_db {
	@apply leading-[2.8rem];
}

.man_db_li {
	@apply flex items-center justify-between px-[1rem] leading-[3rem];
}

.man_db_li_left {
	@apply flex-1 flex items-center w-[70%];
}

.man_db_li_left span {
	@apply flex-1 overflow-hidden overflow-ellipsis whitespace-nowrap;
}

.man_t {
	@apply pl-[1rem];
}

.active .man_t {
	@apply block;
}

.man_t {
	@apply hidden;
}

.man_t li {
	@apply cursor-pointer pl-[2.5rem];
}

.man_t li:hover {
	background: var(--el-fill-color-dark);
}

.man_t li.active {
	background: var(--el-fill-color-darker);
}

.man_r {
	@apply w-[90rem];
}

.man_r .ul_scroll {
	@apply overflow-auto h-[4.4rem];
}

.man_r ul {
	@apply relative leading-[3rem] h-[3.4rem] max-w-max flex;
	border-bottom: 1px solid var(--el-color-border-dark-tertiary);
}

.man_r ul li {
	@apply float-left max-w-[30rem] block relative h-[3.4rem] bg-darker;
	border-right: 1px solid var(--el-color-border-extra-light);
}

.man_r ul li .ul-item {
	@apply cursor-pointer whitespace-nowrap overflow-hidden overflow-ellipsis text-medium leading-[3rem] flex items-center justify-between;
	padding: 0 1rem;
}

.man_r ul li span {
	padding: 0 0.5rem;
}

.man_r ul li.active {
	@apply bg-lighter;
	border-right: 1px solid var(--el-color-border-extra-light);
}

.man_r ul li.active:before {
	@apply absolute inline-block w-[100%] h-[0.2rem] bg-primary bottom-0;
	content: '';
}

.run_result {
	border-top: 1px solid var(--el-color-border-dark-tertiary);
}

.result_table {
	@apply mb-0 w-[100%] overflow-auto max-h-[25rem];
	border: 1px solid var(--el-color-border-dark);
}

.result_table td {
	@apply p-[0.8rem] align-middle;
	border-top: 1px solid var(--el-color-border-dark);
	border-right: 1px solid var(--el-color-border-dark);
}
</style>
