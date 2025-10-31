<template>
	<div class="p-[20px]">
		<bt-table-group>
			<template #content>
				<bt-table @selection-change="handleSelection" max-height="260" :column="tableColumn" v-bt-loading="loading" v-bt-loading:title="'正在加载列表，请稍后...'" :data="tableData"> </bt-table>
			</template>
			<template #footer-left>
				<div>
					<div class="flex items-center mt-[16px] leading-[3rem]">
						<span class="mr-[16px]">备份方式</span>
						<!-- 其他模块 -->
						<el-radio-group v-model="ownBackParam.storage_type" v-if="tabActive !== 'mongodb'">
							<el-radio value="db">合并导出</el-radio>
							<el-radio value="table">分表导出</el-radio>
						</el-radio-group>
						<!-- mongodb -->
						<el-radio-group v-model="ownBackParam.storage_type" v-if="tabActive == 'mongodb'">
							<el-radio value="bson">bson</el-radio>
							<el-radio value="json">json</el-radio>
						</el-radio-group>
					</div>
					<div class="flex items-center mt-16px" v-if="tabActive == 'mysql'">
						<span class="mr-16px !w-[6.4rem]">压缩密码</span>
						<bt-input-icon v-focus placeholder="请输入压缩密码，可为空" v-model="ownBackParam.password" icon="el-refresh" @icon-click="() => (ownBackParam.password = getRandomChart(16))" />
					</div>
				</div>
			</template>
		</bt-table-group>
		<bt-help :options="tipList" list-style="disc" class="ml-[20px] mt-[36px]"> </bt-help>
	</div>
</template>
<script lang="ts" setup>
import type { HelpOptionsProps } from '@/components/form/bt-help/types'

import { getDatabaseStore } from '@database/useStore'
import { getTableInfo, getModulesTableInfo } from '@/api/database'

import { backDatabaseEvent } from '@database/useMethod'
import { Message } from '@hooks/tools'
import { useDataHandle } from '@hooks/tools'
import { useHandleError } from '@hooks/tools'
import { getRandomChart } from '@/utils'
import { useCheckbox } from '@/hooks/tools/table/column'

interface Props {
	compData?: {
		name: string
		id: number
		refreshFn?: AnyFunction
	}
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({
		name: '',
		id: 0,
	}),
})

const {
	refs: { tabActive },
} = getDatabaseStore()

const { name, id } = props.compData // 数据库名称

const radioValue = ref(tabActive.value === 'mongodb' ? 'bson' : 'db') // 备份方式
const loading = ref<boolean>(false) // 加载状态
const tableData = ref<any>([]) // 表格数据
const tableSelected = ref<any>([]) // 表格选中数据

const ownBackParam = reactive({
	id: id, // 数据库id
	table_list: tableSelected.value, // 选中的表
	storage_type: radioValue.value, // 备份方式
	file_type: radioValue.value,
	password: '', // 密码
}) // 备份参数

const tableColumn = shallowRef([
	useCheckbox({ key: tabActive.value == 'mongodb' ? 'collection_name' : 'table_name' }),
	{
		prop: tabActive.value == 'mongodb' ? 'collection_name' : 'table_name',
		label: '表名',
	},
	{
		prop: tabActive.value == 'mongodb' ? 'count' : 'rows_count',
		label: '行数',
	},
	{
		prop: tabActive.value === 'mongodb' ? 'size' : tabActive.value === 'pgsql' ? 'table_size' : 'data_size',
		label: '大小',
	},
]) // 表格配置

const tipList = computed(() => {
	let list: HelpOptionsProps[] = [{ content: '分表导出：一张表存储为一个SQL文件。' }, { content: '合并导出：将选中的表导出到一个SQL文件内' }, { content: '备份格式：打包后压缩包内的文件格式' }]
	if (tabActive.value == 'mysql') list.push({ content: '压缩密码：设置备份压缩密码后请注意保存好密码！', class: 'text-warning' })
	return list
}) // 提示列表

/**
 * @description 选中数据
 * @param val 选中的数据
 */
const handleSelection = (val: any) => {
	tableSelected.value = val
}

/**
 * @description 确认备份
 * @param close 关闭弹窗
 */
const onConfirm = async (close: AnyFunction) => {
	try {
		if (tableSelected.value.length === 0) {
			Message.error('请至少选择一项要备份的表')
			return
		}
		// 参数，mongodb不可缺collection_list，其他为table_list
		let params = {
			...ownBackParam,
			collection_list: tableSelected.value.map((item: any) => item.collection_name),
			table_list: JSON.stringify(tableSelected.value.map((item: any) => `${item.schema}.${item.table_name}`)),
		}
		// 特殊参数处理
		switch (tabActive.value) {
			case 'mongodb':
				params['file_type'] = ownBackParam.storage_type
				params['storage_type'] = 'table'
				break
			case 'pgsql':
				params.table_list = tableSelected.value.map((item: any) => `${item.schema}.${item.table_name}`)
				break
			case 'mysql':
				params.table_list = JSON.stringify(tableSelected.value.map((item: any) => `${item.table_name}`))
				break
		}

		const res = await backDatabaseEvent(params) //写在公共方法中的备份请求
		// 结果
		Message.request(res)
		// 刷新
		props.compData.refreshFn?.()
		close()
	} catch (error) {
		useHandleError(error, '数据库-表备份-onConfirm')
	}
}

/**
 * @description 打开弹窗
 */
const getTableInfoEvent = async () => {
	const { data: res } = await useDataHandle({
		loading,
		request: tabActive.value === 'mysql' ? getTableInfo({ db_name: name }) : getModulesTableInfo({ data: JSON.stringify({ db_name: name }) }, tabActive.value),
	})
	// collection_list mongodb数据库表字段
	// tables mysql数据库表字段
	// table_list pgsql 数据库表字段
	if (tabActive.value === 'mysql') tableData.value = res.tables
	if (tabActive.value === 'mongodb') tableData.value = res.data.collection_list
	if (tabActive.value === 'pgsql') tableData.value = res.data.table_list
}

onMounted(() => {
	getTableInfoEvent()
})

defineExpose({ onConfirm })
</script>
