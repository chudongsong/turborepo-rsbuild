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
			<el-button type="primary">导入</el-button>
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
						<template v-if="scope.row.status === 'success'"> 上传成功！ </template>
						<template v-else-if="scope.row.status === 'fail'"> 上传失败! </template>
						<template v-else-if="scope.row.status === 'ready'"> 等待上传 </template>
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
						<el-button v-show="scope.row.status === 'ready' || scope.row.status === 'fail'" type="default" size="small" @click="removeFile(scope.row)"> 删除 </el-button>
					</template>
				</el-table-column>

				<template #empty>
					<el-empty :description="compData.accept && compData.useEmptyPlaceholder ? `只支持${compData.accept}文件格式导入` : '暂无文件'" />
				</template>
			</el-table>
		</div>
		<bt-help v-if="compData.help?.length" :options="props.compData.help" class="list-disc mt-[1rem] ml-[2rem]"></bt-help>
	</div>
</template>
<script setup lang="ts">
import { useMessage } from '@/hooks/tools'
import { getByteUnit, getPopupInstance } from '@/utils'

interface Props {
	compData?: {
		path: string // 上传路径
		accept?: string // 上传文件后缀
		params?: any | undefined // 上传参数(会覆盖path参数)
		api?: string // 上传接口
		beforeUploadEvent?: (params: any, file: File, setParamsFn: any) => Promise<boolean> | undefined // 上传完成事件(上传参数，上传的文件，设置)
		refreshEvent?: () => void // 上传完成事件
		help?: { text?: string; useHtml?: boolean; content?: string }[]
		useEmptyPlaceholder?: boolean // 无文件时是否显示文件上传类型提示
	}
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => {
		return {
			path: '',
			accept: '',
			params: undefined,
			api: window.location.protocol + '//' + window.location.host + '/files?action=upload',
			beforeUploadEvent: undefined,
			refreshEvent: () => {},
			help: [],
			useEmptyPlaceholder: true,
		}
	},
})

const { proxy: vm }: any = getCurrentInstance()
const popupVm = getPopupInstance(vm)

const emit = defineEmits(['showFooterFun'])

const Message = useMessage() // 消息提示

const uploadRef = ref<any>() // 上传组件
const uploadUrl = ref<string>(window.location.protocol + '//' + window.location.host + '/files?action=upload') // 上传地址
const fileData = ref({
	f_size: 0,
	f_path: '',
	f_name: '',
	f_start: 0,
}) // 文件信息

const uploadFilesList = ref<any>([]) // 上传文件列表
const accept = ref('') // 文件格式
const header = { 'x-http-token': window.vite_public_request_token } // 请求头
let first = true // 是否为第一次上传

/**
 * @description 导入成功
 */
const uploadSuccess = () => {
	Message.success('导入成功')
	props.compData.refreshEvent && props.compData.refreshEvent()
}

/**
 * @description 导入失败
 */
const uploadError = (err: any, file: any, fileList: any) => {
	fileList.push(file)
	Message.error('导入失败')
}

/**
 *  @description 上传前
 * @param file
 */
const uploadBefore = async (file: any) => {
	if (props.compData.beforeUploadEvent) {
		return await props.compData.beforeUploadEvent(fileData.value, file, setUploadParams)
	}
	if (!props.compData.params) {
		fileData.value.f_size = file.size
		fileData.value.f_name = file.name
		fileData.value.f_start = 0
	}
	return Promise.resolve(true)
}
/**
 * @description 设置上传参数
 * @param params
 */
const setUploadParams = (params: any) => {
	fileData.value = params
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
	fileData.value.f_start && (fileData.value.f_start = event.percent)
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
			emit('showFooterFun', false)
			return
		}
		// 如果有文件在上传，隐藏底部按钮
		const status = ['success', 'fail', 'ready']
		for (let i = 0; i < uploadFilesList.value.length; i++) {
			if (!status.includes(uploadFilesList.value[i].status)) {
				emit('showFooterFun', false)
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
			emit('showFooterFun', true)
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
	emit('showFooterFun', false)
}

onMounted(() => {
	if (props.compData.path) {
		fileData.value.f_path = props.compData.path
	}
	if (props.compData.accept) {
		accept.value = props.compData.accept
	}
	if (props.compData.params) {
		fileData.value = props.compData.params
	}
	uploadUrl.value = props.compData?.api || ''
})

defineExpose({
	onConfirm,
})
</script>
