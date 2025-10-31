<template>
	<div class="p-[2rem]">
		<el-upload
			class="upload-demo"
			ref="uploadRef"
			:name="'blob'"
			:data="fileData"
			:action="uploadUrl"
			:headers="header"
			:accept="accept"
			:on-error="uploadError"
			:multiple="true"
			:show-file-list="false"
			:auto-upload="false"
			:on-success="uploadSuccess"
			:on-progress="uploadProgress"
			:file-list="uploadFilesList"
			:on-change="uploadChange"
			:before-upload="uploadBefore">
			<el-button size="small" type="primary">导入</el-button>
		</el-upload>
		<div class="h-[40rem] border border-lighter mt-[1rem]">
			<el-table height="400" :data="uploadFilesList" style="width: 100%">
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
						<el-button v-show="scope.row.status === 'ready' || scope.row.status === 'fail'" type="default" size="small" @click="removeFile(scope.row)">删除</el-button>
					</template>
				</el-table-column>

				<template #empty>
					<el-empty :description="props.compData.path ? '暂无文件' : `只支持'.sql', '.zip', '.bak', '.gz'文件格式导入`" />
				</template>
			</el-table>
		</div>
	</div>
</template>
<script setup lang="ts">
import { useMessage } from '@/hooks/tools'
import { useGlobalStore } from '@/store/global'
import { getByteUnit, getPopupInstance } from '@/utils'

interface Props {
	compData?: any
}

const props = withDefaults(defineProps<Props>(), {
	compData: {},
})

const Message = useMessage() // 消息提示

const { proxy: vm }: any = getCurrentInstance()
const popupVm = getPopupInstance(vm)

const { panel } = useGlobalStore()
const popupSetFooter = inject('popupSetFooter', (val: boolean) => {})

const uploadRef = ref<any>() // 上传refs
const backPath = ref<string>(panel.value.backupPath) // 返回路径
const uploadUrl = window.location.protocol + '//' + window.location.host + '/files?action=upload'
const fileData = reactive({
	f_size: 0,
	f_path: (backPath.value + '/database')?.replaceAll('//', '/'),
	f_name: '',
	f_start: 0,
}) // 文件信息

const uploadFilesList = ref<any>([]) // 上传文件列表
const accept = ref(['.sql', '.zip', '.bak', '.gz'].join(',')) // 文件格式
const header = { 'x-http-token': window.vite_public_request_token } // 请求头
let first = true // 是否为第一次上传

/**
 * @description 导入成功
 */
const uploadSuccess = () => {
	Message.success('上传成功')
	props.compData.refreshEvent()
}

/**
 * @description 导入失败
 */
const uploadError = (err: any, file: any, fileList: any) => {
	fileList.push(file)
	Message.error('上传失败')
}

/**
 *  @description 上传前
 * @param file
 */
const uploadBefore = (file: any) => {
	// file.value = file
	fileData.f_size = file.size
	fileData.f_name = file.name
	fileData.f_start = 0
}

/**
 *  @description 上传文件列表
 * @param file
 */
const uploadChange = (file: any, fileList: any) => {
	uploadFilesList.value = fileList || []
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

watch(
	() => uploadFilesList.value,
	() => {
		// 判断是否有文件
		if (uploadFilesList.value.length === 0) {
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
		if (
			uploadFilesList.value.some((item: any) => {
				return item.status !== 'success'
			})
		) {
			if (first) {
				popupVm.confirmText = '开始上传'
			} else {
				popupVm.confirmText = '重新上传'
			}
			popupSetFooter(true)
		}
	},
	{ immediate: true }
)

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
	uploadRef.value.submit()
	popupSetFooter(false)
}
onMounted(() => {
	if (props.compData.path) {
		fileData.f_path = props.compData.path
		accept.value = ''
	}
})

defineExpose({
	onConfirm,
})
</script>

<style scoped lang="sass"></style>
