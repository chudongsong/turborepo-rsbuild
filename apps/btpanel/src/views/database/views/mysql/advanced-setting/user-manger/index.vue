<template>
	<div>
		<bt-table-group>
			<template #header-left>
				<el-button type="primary" @click="addUser">添加用户</el-button>
			</template>
			<template #header-right>
				<el-select v-model="selectServer" class="mr-[1.5rem] !w-[16rem]" placeholder="请选择" @change="getUserTableData">
					<el-option v-for="item in serverList" :key="item.value" :label="item.ps" :value="item.id" />
				</el-select>
				<bt-input-search v-model="searchValue" placeholder="请输入用户名" class="!w-[20rem]" @search="getUserTableData"> </bt-input-search>
			</template>
			<template #content>
				<el-table :data="userData" max-height="400">
					<el-table-column type="expand">
						<template #default="scope">
							<bt-table v-bt-loading="tableLoad" :column="tableColumn" :data="scope.row.list"> </bt-table>
						</template>
					</el-table-column>
					<el-table-column label="用户" prop="user"></el-table-column>
				</el-table>
			</template>
			<template #popup>
				<!-- 考虑是否需要提取为公共组件 -->
				<bt-dialog title="导出结果" v-model="exportResults" :area="38">
					<el-result :icon="exportResultsData.resultStatus ? 'success' : 'error'" :title="exportResultsData.resultStatus ? '导出成功' : '导出失败'">
						<template #extra>
							<div class="break-words flex items-center justify-center w-full text-secondary">
								<span class="max-w-[28rem] truncate" :title="exportResultsData.resultMsg">{{ exportResultsData.resultMsg }}</span
								><el-button type="text" @click="copyResult(exportResultsData.resultMsg, $event)">复制</el-button>
							</div>
						</template>
					</el-result>
				</bt-dialog>
				<bt-dialog title="关联数据库" v-model="associated.associatedPopup" :area="80">
					<div class="p-20px">
						<bt-table max-height="300" :data="associated.associatedData" :column="associated.associatedDataColumn" :default-sort="{ prop: 'user', order: 'descending' }" />
						<bt-table max-height="300" :data="associated.associatedData" :column="associated.associatedDataColumn" />
					</div>
				</bt-dialog>
				<bt-dialog title="全局权限" v-model="auth.authPopup" :area="40">
					<div class="p-20px">
						<bt-table max-height="300" :data="auth.authData" :column="auth.authDataColumn" />
					</div>
				</bt-dialog>
			</template>
		</bt-table-group>
		<bt-help :options="helpList" list-style="disc" class="ml-20px mt-12px" />
	</div>
</template>

<script lang="tsx" setup>
import type { TableColumnProps } from '@components/data/bt-table/types'
import type { CloudServerItem } from '@database/types'

import { Message, useDataHandle, useConfirm, useDialog } from '@hooks/tools'
import { useOperate } from '@hooks/tools/table/column'
import { copyText } from '@utils/index'
import { getUserData, delMysqlUser, exportUserData, getMysqlCloudServer } from '@/api/database'

const selectServer = ref(0) // 选择服务器sid
const exportResults = ref(false) // 导出结果
const searchValue = ref('') // 搜索值
const userData = ref<any[]>([]) // 用户管理数据
const tableLoad = ref<boolean>(true) // 表格加载状态
const serverList = ref<any[]>([]) // 服务器列表

const associated = reactive({
	associatedPopup: false, // 关联数据库弹窗
	associatedData: [], // 关联数据库表格数据
	associatedDataColumn: [
		{ label: '数据库', prop: 'database' },
		{ label: '表', prop: 'table' },
		{
			label: '权限',
			render: (row: any) => row.access.map((item: any) => `${item.title}：${item.access}`).join('\n'),
		},
	], // 关联数据库表格列
})

const exportResultsData = ref({
	resultMsg: '',
	resultData: '',
	resultStatus: false,
}) // 导出结果数据

const auth = reactive({
	authPopup: false, // 全局权限弹窗
	authData: [], // 全局权限表格数据
	authDataColumn: [
		{
			label: '权限',
			render: (row: any) => row.map((item: any) => h('div', `${item.title}：${item.access}`)),
		},
	], // 全局权限表格列
})

const helpList = [
	{
		content: '说明：此处用户数据为连接mysql直接获取，未与面板数据库连接，建议仅对此处新建的用户进行操作，以防出现意外',
	},
	{
		content: '访问权限：localhost/127.0.0.1:仅限本机访问 %：允许任何人访问 IP地址：仅限此IP地址访问（不含本机）',
	},
	{
		content: '全局权限：全局权限是指对所有数据库拥有的权限 ALL PRIVILEGES即root最高权限，USAGE为普通用户，拥有指定数据库指定权限（关联数据库权限）',
	},
] // 帮助列表

/**
 * @description 复制结果
 */
const copyResult = (value: string) => copyText({ value })

/**
 * @description 添加用户
 */
const addUser = (row: any) => {
	useDialog({
		title: '添加用户',
		area: 60,
		component: () => import('./add-user.vue'),
		compData: { refreshFn: () => init(), serverList },
		showFooter: true,
	})
}

/**
 * @description 修改密码
 * @param user 用户名
 * @param host 访问权限
 */
const editPassword = ({ user: username, host }: any) => {
	if (username === 'root' && host === 'localhost') return Message.error('该用户不允许改密')
	useDialog({
		title: '修改密码',
		area: 42,
		compData: { username, host, sid: selectServer.value },
		component: () => import('./user-pwd.vue'),
		showFooter: true,
	})
}

/**
 * @description 导出数据
 */
const outputData = async ({ host, user: username }: any) => {
	try {
		const res: any = await exportUserData({ username, host, sid: selectServer.value })
		exportResultsData.value.resultMsg = res.data
		exportResultsData.value.resultStatus = true
		exportResults.value = true
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 删除用户
 */
const delUserData = async ({ host, user: username }: any) => {
	try {
		await useConfirm({
			title: '删除用户',
			content: `删除用户后，该用户将无法访问数据库，是否继续操作？`,
			icon: 'warning-filled',
		})
		await useDataHandle({
			loading: '正在删除用户，请稍后...',
			request: delMysqlUser({ username, host, sid: selectServer.value }),
			message: true,
			success: getUserTableData,
		})
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 获取数据库列表
 */
const setAuthEvent = (row: any) => {
	useDialog({
		title: '数据库权限',
		area: 80,
		component: () => import('./user-auth.vue'),
		compData: { row, sid: selectServer.value, refreshEvent: getUserTableData },
	})
}

/**
 * @description 获取用户管理数据
 */
const getUserTableData = async () => {
	try {
		let params: {
			sid: number
			search?: string
		} = { sid: selectServer.value }
		if (searchValue.value) params.search = searchValue.value
		const res: any = await useDataHandle({
			loading: tableLoad,
			request: getUserData(params),
			data: { data: [Array, userData], status: Boolean },
		})
		if (!res.status) {
			userData.value = []
			return Message.error(res.msg || '获取用户数据失败')
		} else {
			userData.value.forEach((item: any) => {
				item.list.forEach((list: any) => {
					list.user = item.user
				})
			})
		}
		return res
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 获取服务器列表
 */
const getServerList = async () => {
	await useDataHandle({
		loading: '正在获取服务器数据，请稍后...',
		request: getMysqlCloudServer(),
		data: [Array, serverList],
	})
	serverList.value = serverList.value?.filter((option: CloudServerItem) => option.id !== '')
	selectServer.value = serverList.value[0]?.id
}

const tableColumn = ref<TableColumnProps[]>([
	{
		label: '访问权限',
		render: (row: any) => {
			return h('span', `${row.host}${row.host == '%' ? ' - 所有人' : row.host == 'localhost' || row.host == '127.0.0.1' ? ' - 本地' : ''}`)
		},
	},
	{ prop: 'password', label: '密码', width: 50 },
	{ prop: 'password_last_changed', label: '密码修改时间', width: 160 },
	useOperate([
		{ onClick: setAuthEvent, title: '权限' },
		{ onClick: editPassword, title: '改密' },
		{ onClick: outputData, title: '导出' },
		{ onClick: delUserData, title: '删除' },
	]), // 操作
])

const init = async () => {
	getUserTableData() // 获取用户管理数据
	getServerList() // 获取服务器列表
}

onMounted(init)
defineExpose({ init })
</script>
