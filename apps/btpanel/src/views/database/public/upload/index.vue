<template>
	<div class="p-[2rem]">
		<!--
		 上传失败：uploadError
		 上传成功：uploadSuccess
		 上传进度：uploadProgress
		 上传前：uploadBefore
		 上传文件列表变化：uploadChange
		  -->
		<el-upload
			class="upload-demo"
			ref="upload"
			:name="'blob'"
			:data="fileData"
			:action="uploadUrl"
			:headers="header"
			:accept="accept"
			:multiple="true"
			:show-file-list="false"
			:auto-upload="false"
			:file-list="uploadFilesList"
			:on-error="uploadError"
			:on-success="uploadSuccess"
			:on-progress="uploadProgress"
			:on-change="uploadChange"
			:before-upload="uploadBefore">
			<el-button type="primary">上传</el-button>
		</el-upload>
		<div class="h-[40rem] border border-base mt-[1rem]">
			<el-table height="400" :data="uploadFilesList">
				<el-table-column prop="name" :show-overflow-tooltip="true" label="名称">
					<template #default="scope">
						<i class="svgtofont-el-document text-supplement" />
						<span class="ml-[0.5rem]">{{ scope.row.name }}</span>
					</template>
				</el-table-column>

				<el-table-column prop="name" label="是否成功" width="300">
					<template #default="scope">
						<template v-if="scope.row.status === 'success'">上传成功！</template>
						<template v-else-if="scope.row.status === 'fail'">上传失败!</template>
						<template v-else-if="scope.row.status === 'ready'">等待上传</template>
						<el-progress v-else :percentage="Math.floor(scope.row.percentage)" />
					</template>
				</el-table-column>

				<el-table-column width="120" prop="size" label="大小">
					<template #default="scope">
						{{ getByteUnit(scope.row.size) }}
					</template>
				</el-table-column>

				<el-table-column prop="name" width="180" align="right" :show-overflow-tooltip="true" label="操作">
					<template #default="scope">
						<el-button v-show="scope.row.status === 'ready' || scope.row.status === 'fail'" type="text" size="small" @click="removeFile(scope.row)">删除</el-button>
					</template>
				</el-table-column>

				<template #empty>
					<el-empty description="只支持'.sql', '.zip', '.bak', '.gz'文件格式导入" />
				</template>
			</el-table>
		</div>
		<ul class="mt-8px leading-8 text-small list-disc ml-2rem">
			<li>仅支持sql、zip、sql.gz、(tar.gz|gz|tgz)</li>
		</ul>
	</div>
</template>
<script setup lang="ts">
import { getByteUnit } from '@utils/index'
import { useMessage } from '@hooks/tools'
import { useGlobalStore } from '@/store/global'
import useDatabaseStore from '../../useStore'

const message = useMessage()

interface Props {
	compData?: {
		path?: string
		refreshEvent: () => void
	}
}

const { panel } = useGlobalStore()
const { tabActive } = useDatabaseStore()

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({
		path: '',
		refreshEvent: () => {},
	}),
})

const popupSetFooter = inject<any>('popupSetFooter') //     弹窗切换底部按钮展示
const buttonText = inject<any>('buttonText') //     弹窗切换底部按钮

let first: boolean = true // 是否为第一次上传

const upload = ref() // 上传组件
const uploadFilesList = ref<any>([]) // 上传文件列表

const accept = shallowRef<string>(['.sql', '.zip', '.bak', '.gz'].join(',')) // 文件格式
const header = { 'x-http-token': window.vite_public_request_token } // 请求头
const uploadUrl: string = window.location.protocol + '//' + window.location.host + '/files?action=upload'

const path = computed(() => {
	if (props.compData.path) return props.compData.path
	return (panel.value.backupPath + '/database')?.replace(/\/\//g, '/')
})

// '/www/backup/database/mysql/all_backup' 数据库备份上传
const fileData = reactive({
	f_size: 0,
	f_path: path.value,
	f_name: '',
	f_start: 0,
}) // 文件信息

/**
 * @description 导入成功
 */
const uploadSuccess = () => {
	message.success('上传成功')
	props.compData.refreshEvent()
}

/**
 * @description 导入失败
 */
const uploadError = (err: any, file: any, fileList: any) => {
	fileList.push(file)
	message.error('上传失败')
}

/**
 *  @description 上传前
 * @param file
 */
const uploadBefore = (file: any) => {
	fileData.f_size = file.size
	fileData.f_name = file.name
	fileData.f_start = 0
}

/**
 *  @description 上传文件列表
 * @param file
 */
const uploadChange = (file: any, fileList: any) => {
	const fileSuffix = file.name.substring(file.name.lastIndexOf('.') + 1)
	const whiteList = ['sql', 'zip', 'bak', 'gz']
	if (whiteList.indexOf(fileSuffix) === -1) {
		// 基于提示
		return false
	}
	uploadFilesList.value =
		fileList.filter((item: any) => {
			let suffix = item.name.substring(item.name.lastIndexOf('.') + 1)
			return whiteList.indexOf(suffix) !== -1
		}) || []
}

/**
 *  @description 上传进度
 * @param file
 */
const uploadProgress = (event: any, file: any, fileList: any) => {
	fileData.f_start = event.percent
	uploadFilesList.value = fileList.map((item: any) => {
		if (item.uid === file.uid) {
			item.percentage = event.percent
		}
		return item
	})
}

/**
 * @description 删除文件
 * @param {ImportFileProps} row 行文件信息
 * @returns {Promise<void>}
 */
const removeFile = (row: any) => {
	uploadFilesList.value = uploadFilesList.value.filter((item: any) => item.name !== row.name)
}

/**
 * @description 确认导入
 */
const onConfirm = () => {
	// 判断是否有文件要继续上传
	uploadFilesList.value.map((file: any) => {
		if (file.status === 'success') {
			return
		}
		file.status = 'ready'
	})
	first = false
	upload.value.submit()
	popupSetFooter(false)
}

watch(
	() => uploadFilesList.value.length,
	val => {
		// 判断是否有文件
		if (val === 0) {
			popupSetFooter(false)
			return
		}

		// 如果有文件在上传，隐藏底部按钮
		const status = ['success', 'fail', 'ready']
		for (let i = 0; i < uploadFilesList.value.length; i++) {
			if (!status.includes(uploadFilesList.value[i].status)) {
				popupSetFooter(false)
				return
			}
		}

		// 判断是否有文件要继续上传
		const uploadStatus = uploadFilesList.value.some((item: any) => {
			return item.status !== 'success'
		})
		if (uploadStatus) {
			buttonText.value = first ? '开始上传' : '重新上传'
			popupSetFooter(true)
		}
	}
)

defineExpose({
	onConfirm,
})
</script>
