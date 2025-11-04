<!--  -->
<template>
	<div>
		<bt-table-group>
			<template #header-left>
				<!-- 按钮组 -->
				<div class="flex items-center">
					<el-upload
						class="upload-demo h-[0] w-[0]"
						ref="upload"
						:name="'blob'"
						:data="uploadForm"
						action="#"
						:headers="header"
						:http-request="uploadEvent"
						accept=".tar,.gz"
						:show-file-list="false"
						:multiple="false"
						:auto-upload="true"
						:on-error="uploadError"
						:on-success="uploadSuccess"
						:on-change="uploadBefore">
						<el-button ref="open" v-show="false" size="default" type="default"> 选择文件 </el-button>
					</el-upload>
					<el-button type="primary" @click="openBackDialog">创建备份</el-button>
					<el-button @click="openBackupUploadView(uploadSuccess)">上传文件</el-button>
					<span class="text-tertiary ml-4px">上传格式为.tar,.gz文件</span>
				</div>
			</template>
			<template #header-right>
				<BtRefresh />
			</template>
			<template #content>
				<BtTable></BtTable>
			</template>
			<template #footer-left> <BtBatch /> </template>
		</bt-table-group>

		<bt-dialog v-model="uploadProgress" :area="52" :title="false">
			<div class="p-[20px]">
				<span class="mb-[0.8rem]"></span>
				<el-progress :text-inside="true" :stroke-width="20" :percentage="uploadNum" />
			</div>
		</bt-dialog>
		<bt-help class="mt-[1rem]" :options="[{isHtml:true,content: '9.5以前版本的备份还原不会在备份列表中显示，如有需要请<span class=\'bt-link\' onClick=\'openFilePath()\'>点击查看</span>'}]"></bt-help>
	</div>
</template>

<script setup lang="tsx">
import { Message, useAllTable, useBatch, useRefreshList, } from '@/hooks/tools'
import { useBatchStatus, useCheckbox, useOperate, usePath } from '@/hooks/tools/table/column'
import { openPathEvent } from '@/hooks/tools/table/event'
import { useGlobalStore } from '@/store/global'
import { deleteBack, detailBack, downloadBack, getBackList, uploadEvent, uploadNum, openRestoreBack, showLogBack, uploadProgress, openBackDialog, execBack, openBackupUploadView } from './useMethod'
import { isRefreshBackList, detailData } from '../useMethod'
import { TableColumnProps } from '@/components/data/bt-table/types'
import { delBackApi } from '@/api/config'
import { openProgress, progressDialog } from '../add-back/useMethod'
import { getByteUnit } from '@/utils'

const { panel } = useGlobalStore()

/**
 * @description 批量操作
 */
const useTableBatch = useBatch([
	{
		label: '删除',
		value: 'delete',
		event: async (batchConfirm, nextAll, selectedList, options, clearBatch, config) => {
			const requestHandle = async (item: AnyObject, index: number) => {
				const res = await delBackApi({ timestamp: item.timestamp })
				return res
			}
			await batchConfirm({
				title: '删除备份',
				column: [{ label: '备份名称', prop: 'backup_name' }, useBatchStatus()] as TableColumnProps[], // 弹窗配置
				content: '删除后不可恢复，确定删除吗？',
				onConfirm: async () => {
					await nextAll(requestHandle)
					isRefreshBackList.value = true
					// 返回false则不关闭弹窗
					return false
				},
			})
		},
	},
])

const { BtTable, BtBatch, BtRefresh } = useAllTable({
	request: getBackList,
	columns: computed(() => [
		useCheckbox({ key: 'timestamp' }),
		{ label: '备份名称', prop: 'backup_name' },
		{
			label: '状态',
			render: (row: any) => {
				const isIng = row.backup_status === 1 || row.restore_status === 1
				const isWait = row.backup_status === 0
				const isRestore = row.restore_status === 1
				const _html = (
					<div>
						{<span>成功({row.backup_count.success || 0})</span>}
						{<span class="!ml-[4px]">失败({row.backup_count.failed || 0})</span>}
					</div>
				)

				const isShowICon = isIng || isWait

				return (
					<div class="inline-flex items-center">
						<span style={`background:${row.backup_count.failed ? 'var(--el-color-danger)' : 'var(--el-color-primary)'}`} class={`rounded-full w-[6px] h-[6px] mr-[4px] ${isShowICon ? '!hidden' : ''}`}></span>
						{isIng && (
							<span
								class="ml-2px text-[var(--el-color-warning-light-3)] cursor-pointer"
								onClick={() => {
									{
										detailData.value.operateType = isRestore ? 'restore' : 'backup'
										progressDialog.value = openProgress()
									}
								}}>
								{isRestore ? '还原中' : '备份中'}
							</span>
						)}
						{isWait && <span class="ml-2px text-tertiary">等待备份</span>}
						{!isIng && !isWait && _html}
					</div>
				)
			},
		},

		usePath({ prop: 'backup_path', label: '备份文件' }),
		// usePathSize({ prop: 'size' }),
		{
			label: '备份大小',
			prop: 'backup_file_size',
			sortable: true,
			render: (row: any) => {
				return <span>{getByteUnit(Number(row.backup_file_size))}</span>
			},
		},
		{ label: '备份时间', prop: 'backup_time', sortable: true },
		{ label: '创建时间', prop: 'create_time', sortable: true },
		useOperate([
			//  当备份还未执行时，显示立即执行
			{ title: '立即备份', width: 70, onClick: execBack, isHide: (row: any) => row.backup_status !== 0 && row.backup_status !== 1 },
			{ title: '下载', onClick: downloadBack, isHide: (row: any) => row.backup_status === 0 || row.backup_status === 1 },
			{ title: '还原', onClick: openRestoreBack, isHide: (row: any) => row.backup_status === 0 || row.backup_status === 1 }, // 暂时隐藏还原,后端接口问题
			{ title: '详情', onClick: detailBack },
			{ title: '日志', onClick: showLogBack },
			{ title: '删除', onClick: deleteBack },
		]),
	]),
	extension: [useRefreshList(isRefreshBackList), useTableBatch],
	empty: () => {
		return (
			<span>
				您的列表为空，您可以
				<span class="bt-link" onClick={openBackDialog}>
					创建一个备份
				</span>
			</span>
		)
	},
})

const header = { 'x-http-token': window.vite_public_request_token }
const upload = ref<any>(null) // 上传文件ref
const open = ref<any>(null) // 选择文件ref
const uploadForm = reactive({
	f_size: 0,
	f_path: '/www/backup/backup_restore/',
	f_name: '',
	f_start: 0,
})

const openFile = () => open.value.$el.click()
const uploadBefore = (file: any) => {
	uploadForm.f_size = file.size
	uploadForm.f_name = file.name
}

const uploadError = (err: any, file: any, fileList: any) => {
	Message.error('导入失败')
	// 关闭弹窗
	uploadProgress.value = false
	isRefreshBackList.value = true
}

const uploadSuccess = (response: any, file: any, fileList: any) => {
	// 关闭弹窗
	uploadProgress.value = false
	isRefreshBackList.value = true
}

onMounted(() => {
	window.openFilePath = () => openPathEvent({path:"/www/backup/whole_machine_backup"})
	setTimeout(() => {
		const hasJump = localStorage.getItem('hasJump')
		if (panel.value.migration && hasJump) {
			openProgress('restore')
			localStorage.removeItem('hasJump')
		}
	}, 1000)
})
</script>

<style lang="css" scoped></style>
