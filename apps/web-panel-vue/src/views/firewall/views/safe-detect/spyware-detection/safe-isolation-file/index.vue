<template>
	<div class="p-[2rem]">
		<bt-table-group>
			<template #content>
				<bt-table :column="tableColumns" :data="tableData" />
			</template>
		</bt-table-group>
		<bt-help :options="[{ content: '样本文件：查杀时的文件内容被记录形成的样本文件' }]" class="ml-[2rem] mt-[1.2rem]"></bt-help>
		<bt-dialog title="在线编辑" showFooter v-model="editorPopup" :area="70" @confirm="saveFile">
			<div class="p-[2rem]">
				<bt-editor v-model="editorValue" class="!h-[40rem]"></bt-editor>
			</div>
		</bt-dialog>
		<bt-dialog title="删除文件" showFooter :area="40" v-model="confirmPopup" @confirm="delFile">
			<div class="flex items-center p-[2rem] text-base">
				<i class="svgtofont-el-question text-warningDark text-titleLarge"></i>
				<div class="flex flex-col ml-[1.2rem]">
					<span class="leading-8">是否要删除关联的源文件？</span>
					<div class="flex items-center mt-[1.2rem]">
						<el-checkbox v-model="fileFlag" class="!mr-[.4rem]"></el-checkbox>
						源文件
					</div>
				</div>
			</div>
		</bt-dialog>
	</div>
</template>

<script setup lang="tsx">
import { useOperate, usePath, usePathSize } from '@/hooks/tools/table/column'

import { getWebShellFile, setHandleFile } from '@/api/firewall'
import { getFileBody, saveFileBody } from '@api/global'
import { useDataHandle } from '@hooks/tools'
import { useMessage } from '@hooks/tools'
import { openPathEvent } from '@table/event'

const Message = useMessage() // 消息提示

// const { proxy: vm }: any = getCurrentInstance() // 获取vue实例对象
const tableData = ref([]) // 响应式数据
const editorValue = ref('') // 响应式数据
const editorPopup = ref(false) // 响应式数据
const rowData = ref<any>({}) // 行数据
const confirmPopup = ref(false) // 弹窗
const fileFlag = ref(false) // 是否删除源文件
const tableColumns = ref([
	{
		label: '隔离时间',
		prop: 'time',
	},
	usePath({ label: '文件', prop: 'path' }),
	useOperate([
		{
			title: '样本文件',
			width: 60,
			onClick: async (row: any) => {
				rowData.value = row
				const res = await useDataHandle({
					request: getFileBody({ path: row.path }),
				})

				if (res.data.msg) {
					Message.request(res)
				} else {
					editorValue.value = res.data.data
					editorPopup.value = true
				}
			},
		},
		{
			title: '删除',
			onClick: async (row: any) => {
				confirmPopup.value = true
				rowData.value = row
			},
		},
	]),
]) // 响应式数据

/**
 *@description 获取隔离文件列表
 */
const getWebShellList = async () => {
	useDataHandle({
		request: getWebShellFile(),
		data: [Array, tableData],
	})
}

/**
 *@description 保存文件
 */
const saveFile = async () => {
	useDataHandle({
		request: saveFileBody({
			path: rowData.value.path,
			data: editorValue.value,
			encoding: 'utf-8',
		}),
		message: true,
	})
}

/**
 *@description 删除文件
 */
const delFile = async () => {
	useDataHandle({
		request: setHandleFile({
			data: JSON.stringify({
				md5: rowData.value.md5,
				path: rowData.value.path,
				type: fileFlag.value ? 'delete' : '',
			}),
		}),
		message: true,
		success: () => {
			getWebShellList()
			fileFlag.value = false
			confirmPopup.value = false
		},
	})
}

onMounted(() => {
	getWebShellList()
})
</script>
