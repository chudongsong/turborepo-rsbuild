<template>
	<div class="p-[20px]">
		<bt-table-group>
			<template #header-left>
				<el-button type="primary" @click="addPermission">添加权限</el-button>
			</template>
			<template #content>
				<bt-table max-height="500" v-bt-loading="tableLoad" v-bt-loading:title="'正在加载列表，请稍后...'" :data="associated.associatedData" :column="associated.associatedDataColumn" :default-sort="{ prop: 'user', order: 'descending' }"></bt-table>
			</template>
			<template #popup>
				<bt-dialog title="添加权限" v-model="associated.addPermissionPopup" :area="60" @confirm="submitPermission" show-footer>
					<div class="p-[20px]">
						<el-form :rules="addPerFormRules" label-width="100px" :model="addPerForm" ref="addUserPermissionFormRef" v-bt-loading="addPerForm.loading" :label-position="`right`" @submit.native.prevent>
							<el-form-item label="数据库权限关联" prop="dbname">
								<el-col :span="8">
									<el-select class="!w-[15rem]" v-model="addPerForm.dbname">
										<el-option v-for="(item, index) in databaseOptions" :key="index" :label="item.name" :value="item.value"></el-option>
									</el-select>
								</el-col>
								<el-col :span="10" v-show="addPerForm.dbname !== '*'">
									<el-form-item prop="tbname">
										<el-select class="!w-[22.3rem] ml-[1rem]" v-model="addPerForm.tbname">
											<el-option v-for="(item, index) in databaseOptions.find(items => items.value === addPerForm.dbname).tb_list" :key="index" :label="item.name" :value="item.value"></el-option>
										</el-select>
									</el-form-item>
								</el-col>
							</el-form-item>
							<el-form-item label="基础权限">
								<div class="w-[38rem] max-h-[18rem] overflow-auto border border-solid p-[12px] border-darker">
									<el-tree :data="treeData" node-key="id" default-expand-all show-checkbox ref="tree" :default-checked-keys="treeDataSelected" :props="defaultProps"> </el-tree>
								</div>
							</el-form-item>
						</el-form>
					</div>
				</bt-dialog>
			</template>
		</bt-table-group>
	</div>
</template>

<script setup lang="tsx">
import { useDataHandle, useConfirm, Message } from '@hooks/tools'
import { useOperate } from '@hooks/tools/table/column'
import { getDatabasesList, delUserGrants, addUserGrants } from '@/api/database'
import { allTree, databaseTree } from './useData'

interface Props {
	compData?: any
}
const props = withDefaults(defineProps<Props>(), {
	compData: {},
})

const { proxy: vm }: any = getCurrentInstance()
const { row: rowData, sid } = toRefs(props.compData)

const tableLoad = ref(false) // 表格加载状态
const addUserPermissionFormRef = ref() // 表单实例
const databaseOptions = ref<any>([]) // 数据库选项

const treeData = computed(() => {
	if (addPerForm.dbname === '*') return allTree
	if (addPerForm.dbname !== '*' && addPerForm.tbname !== '*') return databaseTree.find((item: any) => item.id === 1)?.children
	return databaseTree
}) // 树形组件数据

const treeDataSelected = computed(() => {
	if (addPerForm.dbname === '*') return []
	return [1, 6, 21, 22]
})

/**
 * @description 树形组件默认配置
 */
const disabledFn = (data: any) => {
	const numArr = [1, 2, 3, 4, 5]
	if (addPerForm.dbname !== '*' && addPerForm.tbname !== '*' && !numArr.includes(data.id)) return true
	return false
}

const defaultProps = reactive<any>({
	children: 'children',
	label: 'msg',
	disabled: disabledFn,
}) // 树形组件默认配置

const addPerForm = reactive({
	database: '',
	table: '',
	access: [] as any,
	dbname: '*',
	tbname: '*',
	loading: false,
	selected: [1, 6, 21, 22], // 数据库选中的权限
})

// 添加权限表单验证规则
const addPerFormRules = {
	dbname: [{ required: true, message: '请选择数据库', trigger: ['blur'] }],
	tbname: [
		{
			validator: (rule: any, value: any, callback: any) => {
				if (value === '' && addPerForm.dbname !== '*') {
					callback(new Error('请选择数据库表'))
				} else {
					callback()
				}
			},
			trigger: ['blur'],
		},
	],
}

/**
 * @description 添加权限
 */
const addPermission = async () => {
	try {
		addPerForm.loading = true
		const { data: res } = await getDatabasesList({ sid: sid.value })
		databaseOptions.value = res.data
		associated.addPermissionPopup = true
	} catch (error) {
		console.log(error)
	} finally {
		addPerForm.loading = false
	}
}

/**
 * @description 删除权限
 * @param row
 */
const delPermission = async (row: any) => {
	try {
		await useConfirm({
			title: '删除权限',
			icon: 'warning-filled',
			content: '即将删除【' + row.database + '】的权限，是否继续?',
		})
		const res = await delUserGrants({
			sid: sid.value,
			host: rowData.value.host,
			username: rowData.value.user,
			db_name: row.database,
			tb_name: row.table,
			access: row.access.map((item: any) => item.access).join(','),
			with_grant: 0,
		})
		getNewData(rowData.value.user, rowData.value.host)
		Message.request(res)
	} catch (error) {
		console.log(error)
	}
}

const handleParams = () => {
	const tree = vm.$refs.tree
		.getCheckedNodes()
		.filter((item: any) => item.name && !item.children)
		.map((item: any) => item.name)
		.join(',')
	const data = {
		sid: sid.value,
		host: rowData.value.host,
		username: rowData.value.user,
		db_name: addPerForm.dbname,
		tb_name: addPerForm.tbname,
		access: tree,
		with_grant: 0,
	}
	return data
}

/**
 * @description 提交权限
 */
const submitPermission = async () => {
	try {
		await addUserPermissionFormRef.value.validate()
		addPerForm.loading = true
		const params = handleParams()
		if (params.access === '') return Message.error('权限不可为空，请选择权限！')
		await useDataHandle({
			loading: '正在添加权限，请稍后...',
			request: addUserGrants(params),
			message: true,
			success: () => {
				associated.addPermissionPopup = false
				getNewData(rowData.value.user, rowData.value.host)
			},
		})
	} catch (error) {
		console.log(error)
	} finally {
		addPerForm.loading = false
	}
}

/**
 * @description 获取用户数据
 * @param name 用户名称
 * @param host 用户host
 */
const getNewData = async (name: string, host: string) => {
	try {
		tableLoad.value = true
		const { data } = await props.compData.refreshEvent()
		let list = data.find((item: any) => item.user === name).list
		let list2 = list.find((item: any) => item.host === host).access_list
		associated.associatedData = list2
		tableLoad.value = false
	} catch (error) {
		console.log(error)
	} finally {
		tableLoad.value = false
	}
}

const associated = reactive({
	addPermissionPopup: false, // 关联数据库弹窗
	associatedData: [] as any, // 关联数据库表格数据
	associatedDataColumn: [
		{
			label: '数据库',
			render: (row: any) => (row.database === '*' ? row.database + ' -所有数据库' : row.database),
		},
		{ label: '表', render: (row: any) => (row.table === '*' ? row.table + ' -所有表' : row.table) },
		{
			label: '权限',
			width: '320',
			render(row: any) {
				return h(
					'div',
					{
						class: 'truncate break-words max-h-[8rem] overflow-auto whitespace-nowrap',
					},
					[row.access.map((item: any) => `${item.title ? item.title : item.msg}：${item.access ? item.access : item.name}`).join('\n')]
				)
			},
		},
		useOperate([{ title: '删除', onClick: delPermission }]),
	], // 关联数据库表格列
})

onMounted(async () => {
	associated.associatedData = rowData.value.access_list
})
</script>
