<template>
	<div>
		<bt-table-group>
			<template #header-left>
				<el-button type="primary" @click="addView = true"> 添加进程白名单 </el-button>
			</template>

			<template #content>
				<bt-table :column="tableColumn" :data="tableData" v-bt-loading="tableLoading" :description="'进程白名单列表为空'" v-bt-loading:title="'正在加载进程白名单列表，请稍后...'"></bt-table>
			</template>

			<template #popup>
				<bt-dialog title="添加进程" v-model="addView" :area="42" @confirm="addWhiteData" showFooter>
					<el-form ref="addProcessWhiteRef" :rules="rules" :model="addForm" class="p-[2rem]" label-width="5rem">
						<el-form-item :label="'进程名称'" prop="cmd">
							<bt-input v-model="addForm.cmd" width="20rem" :placeholder="'例:/bin/bash'" clearable></bt-input>
						</el-form-item>
						<bt-help
							:options="[
								{
									class: 'text-danger',
									content: '命令需要填写全路径例如：/usr/bin/curl',
								},
							]"
							class="pl-[3.6rem] pt-[.4rem]"></bt-help>
					</el-form>
				</bt-dialog>
			</template>
		</bt-table-group>
	</div>
</template>
<script lang="tsx" setup>
import { addProcessWhite, delProcessWhite, getProcessWhiteList } from '@/api/firewall'
import { useOperate } from '@/hooks/tools/table/column'
import { useConfirm, useDataHandle } from '@hooks/tools'
import { useGlobalStore } from '@store/global'

const { mainHeight } = useGlobalStore()

const tableLoading = ref(false) // 加载状态
const tableData = ref([]) //列表数据

const addView = ref(false) // 添加进程白名单弹窗
const addForm = reactive({ cmd: '' }) // 添加进程白名单表单数据
const addProcessWhiteRef = ref() // 添加进程白名单表单ref

const rules = {
	cmd: [{ trigger: ['blur', 'change'], required: true, message: '请输入进程名称' }],
} // 校验规则

/**
 * @description 切换列表页面
 */
const getWhiteList = async () => {
	await useDataHandle({
		loading: tableLoading,
		request: getProcessWhiteList(),
		data: [Array, tableData],
	})
}

/**
 * @description 删除进程白名单
 * @param {any} row 进程白名单行数据
 */
const deleteRow = async (row: any) => {
	await useConfirm({
		icon: 'warning-filled',
		title: '删除进程白名单【' + row + '】',
		width: '34rem',
		content: '删除选中的进程后，该进程将不再进行收到保护，是否继续操作？',
	})
	await useDataHandle({
		loading: '正在删除进程白名单，请稍后...',
		request: delProcessWhite({ cmd: row }),
		message: true,
	})
	getWhiteList()
}

/**
 * @description 添加进程白名单
 */
const addWhiteData = async () => {
	await addProcessWhiteRef.value.validate()
	await useDataHandle({
		loading: '正在添加进程白名单，请稍后...',
		request: addProcessWhite(addForm),
		message: true,
	})
	getWhiteList()
	addView.value = false
	addForm.cmd = ''
}

const tableColumn = [{ label: '进程名', render: (row: any) => <span>{row}</span> }, useOperate([{ onClick: deleteRow, title: '删除' }])]

// 页面加载完成
onMounted(() => {
	getWhiteList()
})
</script>
