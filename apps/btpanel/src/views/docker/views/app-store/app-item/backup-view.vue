<template>
	<div class="p-2rem">
		<bt-table-group>
			<template #header-left>
				<el-button type="primary" @click="handleBackup">点击备份</el-button>
				<el-button @click="uploadPopup = true">上传备份</el-button>
			</template>
			<template #content>
				<bt-table :column="tableColumns" :data="tableData" v-bt-loading="tableLoading" :max-height="500" />
			</template>
			<template #popup>
				<bt-dialog title="上传文件" v-model="uploadPopup" :area="50" @confirm="onConfirmUpload" @cancel="onCancel" showFooter>
					<div class="p-[2rem]">
						<el-form ref="cmdFormRef" size="default" :model="uploadForm" class="relative w-full" :label-position="`right`" @submit.native.prevent>
							<el-form-item prop="dep_zip" label="上传文件">
								<div class="flex items-center">
									<el-upload
										class="upload-demo h-[0] w-[0]"
										ref="upload"
										:name="'blob'"
										:data="uploadForm"
										:action="uploadUrl"
										:headers="header"
										accept=".zip,.gz,.tar"
										:show-file-list="false"
										:on-error="uploadError"
										:multiple="false"
										:auto-upload="false"
										:on-success="uploadSuccess"
										:on-change="uploadBefore">
										<el-button ref="open" v-show="false" size="default" type="default"> 选择文件 </el-button>
									</el-upload>
									<el-button title="导入项目" size="default" class="!mr-[.5rem]" @click="openFile"> 选择文件 </el-button>
									<span>{{ uploadForm.f_name || '未选择' }}</span>
								</div>
							</el-form-item>

							<el-form-item label=" ">
								<el-checkbox v-model="uploadForm.restore_backup"> 是否立即导入备份文件 </el-checkbox>
							</el-form-item>
							<el-form-item label=" " v-if="uploadForm.restore_backup">
								<el-checkbox v-model="uploadForm.backup"> 是否备份覆盖前的数据 </el-checkbox>
							</el-form-item>

							<ul class="mt-[.8rem] leading-8 text-small list-disc ml-[2rem]">
								<li>立即导入备份文件将覆盖现有文件数据，请做好相关数据备份</li>
							</ul>
						</el-form>
					</div>
				</bt-dialog>
			</template>
		</bt-table-group>
	</div>
</template>

<script setup lang="tsx">
import { backupDockerApp, deleteBackup, getBackupList, restoreBackup } from '@/api/docker'
import { useMessage, useConfirm, useDataHandle } from '@/hooks/tools'
import { useOperate, usePath } from '@/hooks/tools/table/column'
import { getDockerStore } from '@docker/useStore'
import { formatTime, getByteUnit } from '@utils/index'

interface Props {
	compData: { id: string }
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => {
		id: ''
	},
})

const {
	refs: { isRefreshInstallList },
} = getDockerStore()

const header = { 'x-http-token': window.vite_public_request_token }

const uploadPopup = ref(false) //
const upload = ref<any>(null) // 上传文件ref
const open = ref<any>(null) // 选择文件ref
const uploadUrl = window.location.protocol + '//' + window.location.host + '/mod/docker/com/upload_backup'

const uploadForm = reactive({
	id: props.compData.id,
	restore_backup: false,
	backup: false,
	f_size: 0,
	f_path: '/www/dk_project/backup/apps',
	f_name: '',
	f_start: 0,
})

const { id } = props.compData
const load = ref<any>(false)
// const { proxy: vm }: any = getCurrentInstance()
const Message = useMessage() // 消息提示

const tableData = shallowRef([])
const tableLoading = shallowRef(false)

/**
 * @description 获取备份列表
 */
const getBackData = async () => {
	useDataHandle({
		request: getBackupList({ id }),
		loading: tableLoading,
		success: (res: any) => {
			tableData.value = res.data.data
		},
	})
}

/**
 * @description 备份
 */
const handleBackup = async () => {
	useDataHandle({
		request: backupDockerApp({ id }),
		loading: '正在备份中，请稍后...',
		message: true,
		success: getBackData,
	})
}

/**
 * @description 删除备份
 */
const delBackup = async (row: any) => {
	await useConfirm({
		content: '即将删除备份文件，是否继续？',
		title: '删除备份-' + row.file_name,
		icon: 'warning-filled',
	})
	useDataHandle({
		request: deleteBackup({ id, file_name: row.file_name }),
		loading: '正在删除中，请稍后...',
		message: true,
		success: getBackData,
	})
}

/**
 * @description 下载
 */
const downLoadBack = async (row: any) => {
	window.open('/download?filename=' + row.backup_path + '/' + row.file_name, '_blank', 'noopener,noreferrer')
}

/**
 * @description 恢复
 */
const restoreBack = async (row: any) => {
	await useConfirm({
		content: '恢复备份将会覆盖已有数据，是否继续？',
		title: '恢复备份-' + row.file_name,
		icon: 'warning-filled',
		type: 'check',
		check: {
			content: '备份覆盖前的数据',
			onConfirm: async (status: boolean) => {
				await useDataHandle({
					request: restoreBackup({
						id,
						file_name: row.file_name,
						backup: status,
					}),
					loading: '正在恢复中，请稍后...',
					message: true,
				})
				getBackData()
				isRefreshInstallList.value = true
			},
		},
	})
}

const onConfirmUpload = async () => {
	if (!uploadForm.f_name) {
		Message.error('请选择文件')
		return
	}
	load.value = Message.load('正在上传中，请稍后...')
	await upload.value?.submit()
	return false
}

const uploadSuccess = (res: any) => {
	Message.request(res)
	uploadPopup.value = false
	uploadForm.f_name = ''
	getBackData()
	load.value?.close()
	if (res.status) uploadPopup.value = false
}

const uploadBefore = (file: any) => {
	uploadForm.f_size = file.size
	uploadForm.f_name = file.name
}

const uploadError = () => {
	Message.error('导入失败')
	uploadForm.f_name = ''
	load.value?.close()
	getBackData()
}

const openFile = () => {
	open.value.$el.click()
}

const onCancel = () => {
	upload.value?.clearFiles()
	uploadPopup.value = false
	uploadForm.f_name = ''
	uploadForm.restore_backup = false
}

const tableColumns = [
	{ label: '备份名称', prop: 'file_name', width: 160 },
	{
		label: '类型',
		render: (row: any) => <span>{row.backup_type === 'local' ? '本地' : row.backup_type}</span>,
	},
	{
		label: '备份时间',
		width: 140,
		render: (row: any) => <span>{formatTime(Number(row.backup_time))}</span>,
	},
	usePath({ prop: 'backup_path', label: '备份目录' }),
	{ label: '大小', render: (row: any) => <span>{getByteUnit(row.size)}</span> },
	useOperate([
		{ title: '恢复', onClick: restoreBack },
		{ title: '下载', onClick: downLoadBack },
		{ title: '删除', onClick: delBackup },
	]),
]

onMounted(getBackData)
</script>

<style scoped></style>
